import React from 'react'
import { WindowScroller, AutoSizer, List } from 'react-virtualized'
import { useRecoilValue } from 'recoil'
import styled from 'styled-components'
import { ordersAtomFamily } from './order-state'
import { theme } from '../theme'

// Super simple table done via flexbox.
// If this was a full production env, I'd probably use something like react-table with headless hooks to help build out everything
const TableRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 0 0 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 4px;
`

const ROW_HEIGHT = 64
const TableCell = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  width: 100%;
  padding: 8px 12px;
  overflow: hidden;
  list-style: none;
  text-align: left;
  max-height: ${ROW_HEIGHT}px;
  text-overflow: ellipsis;
  box-sizing: border-box;
`

const TableHeaderRow = styled(TableRow)`
  background-color: ${theme.palette.lightGray};
  ${TableCell} {
    color: ${theme.colors.secondaryTextColor};
    font-weight: 500;
  }
`

const eventToHumanReadableStatusLookup: { [key: string]: string } = {
  CREATED: 'Created',
  COOKED: 'Cooked',
  DRIVER_RECEIVED: 'Driver received',
  CANCELLED: 'Cancelled',
  DELIVERED: 'Delivered',
}

const TABLE_CELL_WIDTHS = {
  id: '10%',
  customer: '15%',
  destination: '35%',
  eventName: '12%',
  price: '8%',
  item: '20%',
}

const OrderHeader = React.memo(() => {
  return (
    <TableHeaderRow style={{ marginBottom: 2 }}>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['id'] }}>
        <div>ID</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['customer'] }}>
        <div>Customer</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['destination'] }}>
        <div>Destination</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['item'] }}>
        <div>Item</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['price'] }}>
        <div>Price</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['eventName'] }}>
        <div>Status</div>
      </TableCell>
    </TableHeaderRow>
  )
})

interface OrderListItemProps {
  orderId: string
  style?: any
}

const MARGIN_BOTTOM = 4
const OrderListItem = React.memo(({ orderId, style }: OrderListItemProps) => {
  const height = style.height
  const adjustedHeight = height - MARGIN_BOTTOM
  const order = useRecoilValue(ordersAtomFamily(orderId))
  return (
    <TableRow style={{ ...style, marginBottom: MARGIN_BOTTOM, height: adjustedHeight }}>
      <TableCell
        style={{
          width: TABLE_CELL_WIDTHS['id'],
          fontWeight: 500,
          color: theme.colors.secondaryTextColor,
        }}
      >
        <div>{order.id}</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['customer'] }}>
        <div>{order.customer}</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['destination'] }}>
        <div>{order.destination}</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['item'] }}>
        <div>{order.item}</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['price'] }}>
        <div>${order.price.toFixed(2)}</div>
      </TableCell>
      <TableCell style={{ width: TABLE_CELL_WIDTHS['eventName'], fontWeight: 500 }}>
        <div>{eventToHumanReadableStatusLookup[order.lastEventName] ?? order.lastEventName}</div>
      </TableCell>
    </TableRow>
  )
})

export interface OrderTableProps {
  filteredOrderIds: Array<string>
  allOrderIds: Array<string>
}

// Virtualized, full-window table
const OrderTable = ({ filteredOrderIds, allOrderIds }: OrderTableProps) => {
  return (
    <>
      <OrderHeader />
      <WindowScroller>
        {({ height, isScrolling, onChildScroll, scrollTop, registerChild }) => (
          <TableRow ref={registerChild}>
            <AutoSizer disableHeight={true}>
              {({ width }) => (
                <List
                  containerStyle={{ backgroundColor: theme.palette.lightGray }}
                  autoHeight
                  height={height}
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  rowCount={filteredOrderIds.length}
                  overscanRowCount={100}
                  rowHeight={ROW_HEIGHT}
                  rowRenderer={({ index, style }) => (
                    <OrderListItem key={filteredOrderIds[index]} style={style} orderId={filteredOrderIds[index]} />
                  )}
                  scrollTop={scrollTop}
                  width={width}
                />
              )}
            </AutoSizer>
          </TableRow>
        )}
      </WindowScroller>
      {filteredOrderIds.length === 0 && (
        <TableRow style={{ height: ROW_HEIGHT }}>
          <TableCell>{allOrderIds.length === 0 ? 'Waiting for orders...' : 'No order found'}</TableCell>
        </TableRow>
      )}
    </>
  )
}

const OrderTableWrapper = styled.div`
  max-width: ${theme.sizing.maxWidthPageWrapper}px;
  margin: 0 auto;
  padding: 0 8px 32px;
`

export { OrderTable, OrderTableWrapper }
