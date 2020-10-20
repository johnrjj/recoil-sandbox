import React from 'react'
import { Header as AppHeader } from './app/header'
import { OrderTable, OrderTableWrapper } from './orders/order-table'
import { OrdersStickyHeader as OrdersSubheader } from './orders/order-sticky-header'
import { useSocketIoOrderWatcher } from './orders/order-watcher'
import { useOrderUpdateHandler, useFilteredOrderIds, useOrderIds } from './orders/order-state'

export interface AppProps {
  websocketEndpoint: string
}

const App: React.FC<AppProps> = ({ websocketEndpoint }) => {
  const orderUpdateHandler = useOrderUpdateHandler()
  const isConnected = useSocketIoOrderWatcher(websocketEndpoint, orderUpdateHandler)

  const allOrderIds = useOrderIds()
  const filteredOrderIds = useFilteredOrderIds()

  return (
    <>
      <AppHeader />
      <OrdersSubheader
        allOrderIds={allOrderIds}
        filteredOrderIds={filteredOrderIds}
        orderUpdateFeedConnected={isConnected}
      />
      <OrderTableWrapper>
        <OrderTable allOrderIds={allOrderIds} filteredOrderIds={filteredOrderIds} />
      </OrderTableWrapper>
    </>
  )
}

export default App
