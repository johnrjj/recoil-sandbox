import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useRecoilCallback, useRecoilState } from 'recoil'
import { Search, X } from 'react-feather'
import { orderTableFilterInputAtom, filteredOrderIdsAtom, orderIdsAtom, ordersAtomFamily } from './order-state'
import { Input } from '../app/input'
import { PulsingDot } from './pulsing-dot'
import { filterOrderByPriceFuzzy, sanitizeFilterInput } from './util'
import { theme } from '../theme'
import type { Order } from './types'

const HeaderStickyOutsideContainer = styled.div`
  position: sticky;
  display: flex;
  align-items: center;
  top: 0;
  height: 80px;
  z-index: 2;
  box-shadow: inset 0px -2px 0px #f1f2f6;
  background-color: ${theme.palette.lightGray};
  margin-bottom: 16px;
`

const HeaderInsideWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
  margin: 0 auto;
  padding: 0 8px;
  max-width: ${theme.sizing.maxWidthPageWrapper}px;
`

const HeaderLeftSideWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const HeaderLeftSideInnerWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  height: 36px;
`

const HeaderRightSideWrapper = styled.div`
  display: flex;
  align-items: center;
`

const OrderDashboardTitle = styled.h2`
  font-size: 36px;
  font-weight: 600;
`

const OrderFeedStatusContainer = styled.div`
  display: flex;
  flex-shrink: 0;
`

const InputContainer = styled.div`
  position: relative;
  flex-basis: 262px;
`

export interface OrdersStickyHeaderProps {
  allOrderIds: Array<string>
  filteredOrderIds: Array<string>
  orderUpdateFeedConnected: boolean
}
const OrdersStickyHeader: React.FC<OrdersStickyHeaderProps> = ({
  filteredOrderIds,
  allOrderIds,
  orderUpdateFeedConnected,
}) => {
  const [filterInput, setFilterInput] = useRecoilState(orderTableFilterInputAtom)

  // So, this should be a selector, but right now Recoil isn't performant enough, so we derive this in userland for now w/ some light caching (which is fine for now).
  // See order-state.tsx for what the selector would actually look like. There are some WIP perf improvements wrt large lists waiting to land on Recoil
  const deriveFilteredOrderIds = useRecoilCallback(
    ({ snapshot, set }) => async () => {
      const orderIds = await snapshot.getPromise(orderIdsAtom)
      const sanitizedFilterInput = sanitizeFilterInput(filterInput)
      if (!sanitizedFilterInput) {
        set(filteredOrderIdsAtom, orderIds)
      }
      const orders = await Promise.all(orderIds.map((orderId) => snapshot.getPromise(ordersAtomFamily(orderId))))
      // Reset if stale (e.g. not cached to the current filter input)
      if (filterCurrentKey !== sanitizedFilterInput) {
        resetFilterCache(filterInput)
      }
      const filteredOrders = orders.filter((order) => {
        if (filterCache.has(order)) {
          return filterCache.get(order)
        } else {
          const match = filterOrderByPriceFuzzy(sanitizedFilterInput, order)
          filterCache.set(order, match)
          return match
        }
      })
      const filteredOrderIds = filteredOrders.map((order) => order.id)
      set(filteredOrderIdsAtom, filteredOrderIds)
    },
    [filterInput, allOrderIds]
  )

  // Update filtered orders whenever the input changes or the orders change (e.g. an order gets added/removed)
  useEffect(() => {
    deriveFilteredOrderIds()
  }, [filterInput, deriveFilteredOrderIds, allOrderIds.length])

  const numberOfFilteredOrders = filteredOrderIds.length
  const numberOfTotalOrders = allOrderIds.length
  const activeFilter = sanitizeFilterInput(filterInput)

  return (
    <HeaderStickyOutsideContainer>
      <HeaderInsideWrapper>
        <HeaderLeftSideWrapper>
          <HeaderLeftSideInnerWrapper>
            <OrderDashboardTitle>Orders</OrderDashboardTitle>
            <div style={{ marginLeft: 16 }}>
              <div style={{ marginBottom: 4 }}>
                {activeFilter ? (
                  <>
                    Showing <span style={{ fontWeight: 500 }}>{numberOfFilteredOrders}</span> of{' '}
                    <span style={{ fontWeight: 500 }}>{numberOfTotalOrders}</span>
                  </>
                ) : (
                  <>
                    (<span style={{ fontWeight: 500 }}>{numberOfTotalOrders}</span>)
                  </>
                )}
              </div>
            </div>
          </HeaderLeftSideInnerWrapper>
        </HeaderLeftSideWrapper>
        <HeaderRightSideWrapper>
          <OrderFeedStatusContainer>
            <div style={{ marginRight: 8, color: theme.colors.secondaryTextColor, fontWeight: 500 }}>
              {orderUpdateFeedConnected ? 'Connected' : 'Waiting to connect'}
            </div>
            <div style={{ marginRight: 32 }}>
              <PulsingDot connected={orderUpdateFeedConnected} />
            </div>
          </OrderFeedStatusContainer>
          <InputContainer>
            <Input placeholder={'Search orders'} value={filterInput} onChange={(e) => setFilterInput(e.target.value)} />
            <SearchAbsoluteContainer>
              {filterInput ? (
                <X cursor={'pointer'} onClick={() => setFilterInput('')} size={20} color={theme.palette.gray} />
              ) : (
                <Search size={20} color={theme.palette.gray} pointerEvents={'none'} />
              )}
            </SearchAbsoluteContainer>
          </InputContainer>
        </HeaderRightSideWrapper>
      </HeaderInsideWrapper>
    </HeaderStickyOutsideContainer>
  )
}

const SearchAbsoluteContainer = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  right: 16px;
  top: 0;
  bottom: 0;
`

// Super simple cache for the filter, avoids any obvious repeated work.
// If order count gets too large, can always use an LRU
let filterCache = new WeakMap<Order, boolean>()
let filterCurrentKey = ''
const resetFilterCache = (newKey: string = '') => {
  filterCache = new WeakMap()
  filterCurrentKey = newKey
}

export { OrdersStickyHeader }
