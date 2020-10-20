import { useCallback, useRef } from 'react'
import produce from 'immer'
import type { WritableDraft } from 'immer/dist/internal'
import {
  atom,
  atomFamily,
  DefaultValue,
  selectorFamily,
  useRecoilCallback,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil'
import { useRequestIdleCallbackLoop } from '../perf/schedulers'
import type { Order, OrderUpdate } from './types'
import { createDefaultOrder, createOrderFromOrderUpdate } from './util'

const orderTableFilterInputAtom = atom({
  key: 'orders/orderTableFilterInput',
  default: '',
})

const orderUpdateCountAtom = atom({
  key: 'orders/orderUpdateCountAtom',
  default: 0,
})

const filteredOrderIdsAtom = atom<string[]>({
  key: 'orders/filteredOrderIds',
  default: [],
})

const orderIdsAtom = atom<string[]>({
  key: 'orders/orderIds',
  default: [],
})

const ordersAtomFamily = atomFamily<Order, string>({
  key: 'orders/orders',
  default: selectorFamily<Order, string>({
    key: 'orders/default',
    get: (param) => () => {
      return createDefaultOrder(param)
    },
  }),
})

function useOrderIds() {
  return useRecoilValue(orderIdsAtom)
}

function useOrder(orderId: string) {
  return useRecoilValue(ordersAtomFamily(orderId))
}

function useFilteredOrderIds() {
  return useRecoilValue(filteredOrderIdsAtom)
}

const ADD_ORDER = 'ADD_ORDER'
const UPDATE_ORDER = 'UPDATE_ORDER'

const dispatchSelectorFamily = selectorFamily<Order, string>({
  key: 'orders/dispatch',
  get: (param) => () => ordersAtomFamily(param),
  set: (type) => ({ get, set }, payload: Order | DefaultValue) => {
    const updateOrderIds = (recipe: (draft: WritableDraft<string[]>) => void) => {
      const newItemIds = produce(get(orderIdsAtom), recipe)
      set(orderIdsAtom, newItemIds)
    }

    switch (type) {
      case ADD_ORDER: {
        const newOrder = payload as Order
        set(ordersAtomFamily(newOrder.id), newOrder)
        updateOrderIds((draft) => void draft.push(newOrder.id))
        break
      }
      case UPDATE_ORDER: {
        const updatedOrder = payload as Order
        set(ordersAtomFamily(updatedOrder.id), updatedOrder)
        break
      }
    }
  },
})

function useAddOrder() {
  const addOrder = useSetRecoilState(dispatchSelectorFamily(ADD_ORDER))
  const cb = useCallback((order: Order) => addOrder(order), [addOrder])
  return cb
}

function useUpdateOrder() {
  const updateOrder = useSetRecoilState(dispatchSelectorFamily(UPDATE_ORDER))
  const cb = useCallback((order: Order) => updateOrder(order), [updateOrder])
  return cb
}

export interface OrderActions {
  addOrder: (order: Order) => void
  updateOrder: (order: Order) => void
}

// Biz logic would go here, everything dependency injected for easier testability
const handleOrderUpdate = (orderUpdatePayload: OrderUpdate, maybeExistingOrder: Order, actions: OrderActions) => {
  if (!maybeExistingOrder.customer) {
    // doesnt exist, add order
    actions.addOrder(createOrderFromOrderUpdate(orderUpdatePayload))
  } else {
    // existing order...
    // Let's check if this event is stale
    if (maybeExistingOrder.lastUpdatedSecondIndexFromServer > orderUpdatePayload.sentAtSecond) {
      // Expired event, we've seen newer, noop
      return
    }
    // If not, update order
    const updatedOrder: Order = {
      ...maybeExistingOrder,
      lastUpdatedSecondIndexFromServer: orderUpdatePayload.sentAtSecond,
      lastEventName: orderUpdatePayload.eventName,
      lastUpdated: new Date(),
    }
    actions.updateOrder(updatedOrder)
  }
}

const DEFAULT_BATCH_SIZE = 10
function useOrderUpdateHandler() {
  // Here we want to control any potential backflow propagation from the websocket,
  // rather than naively sending everything to be handled immediately within the app
  // This ensures we never do too much work at once to leave room for user input
  // (e.g. 1k order updates come in, will block the main thread too long, so we divide up the units of work)
  // Generaly, we want to shoot for < ~16ms sized microtasks, so check the profiler accordingly.
  const orderUpdateIngestQueue = useRef<Array<OrderUpdate>>([])

  const addOrder = useAddOrder()
  const updateOrder = useUpdateOrder()

  const orderUpdateHandler = useRecoilCallback(
    ({ snapshot, set }) => async (payload: OrderUpdate) => {
      const maybeExistingOrder = await snapshot.getPromise(ordersAtomFamily(payload.id))
      handleOrderUpdate(payload, maybeExistingOrder, { addOrder, updateOrder })
      set(orderUpdateCountAtom, (prev) => prev + 1)
    },
    [addOrder, updateOrder]
  )

  const dequeueAndProcessOrderUpdates = useCallback(() => {
    if (orderUpdateIngestQueue.current.length === 0) {
      return
    }
    const orderUpdatesToHandle = orderUpdateIngestQueue.current.splice(0, DEFAULT_BATCH_SIZE)
    orderUpdatesToHandle.forEach((orderUpdate) => {
      orderUpdateHandler(orderUpdate)
    })
  }, [orderUpdateHandler])

  const addOrderUpdatetoIngestQueue = useCallback((orderUpdate: OrderUpdate) => {
    orderUpdateIngestQueue.current.push(orderUpdate)
  }, [])

  // We'll 'pull' for messages on the order update FIFO queue via requestIdleCallback
  // Wrt schedulers, there's three examples below with different tradeoffs within the schedulers.tsx file (rAF, rIC, and setTimeout)
  useRequestIdleCallbackLoop(dequeueAndProcessOrderUpdates, 2000)

  return addOrderUpdatetoIngestQueue
}

export {
  // atoms
  orderTableFilterInputAtom,
  orderIdsAtom,
  ordersAtomFamily,
  orderUpdateCountAtom,
  filteredOrderIdsAtom,
  // hooks
  useOrderIds,
  useOrder,
  useFilteredOrderIds,
  useOrderUpdateHandler,
  useAddOrder,
  useUpdateOrder,
}

// When Recoil lands some perf improvements, we can just one of these selectors (either selectorFamily or selector) directly instead of deriving filter result ids on the fly
// const filteredOrderIdsSelector = selectorFamily<
//   { id: string, match: boolean },
//   { id: string, filter: string }
// >({
//   key: "orders/filteredOrderIdsSelector",
//   get: ({ id, filter }) => ({ get }) => {
//     const currentFilterInput = get(orderTableFilterInputState);
//     const order = get(ordersAtomFamily(id));
//     const match = filterOrderByPriceFuzzy(filter, order);
//     return {
//       match,
//       id,
//     };
//   },
// });

// const filteredOrderIdsSelector = selector<string[]>({
//   key: "orders/filteredOrderIdsSelector",
//   get: ({ get }) => {
//     const filter = get(orderTableFilterInputState);
//     const orderIds = get(orderIdsAtom);
//     const orders = get(waitForAll(orderIds.map((id) => ordersAtomFamily(id))));
//   },
// });
