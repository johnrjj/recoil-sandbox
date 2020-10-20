import type { Order, OrderUpdate } from './types'

const createDefaultOrder = (maybeOrderId: string): Order => {
  return {
    id: maybeOrderId?.toString() ?? 'unknown',
    customer: '',
    destination: '',
    lastEventName: '',
    item: '',
    price: 0,
    lastUpdatedSecondIndexFromServer: -1,
    lastUpdated: new Date(),
  }
}

const createOrderFromOrderUpdate = (orderUpdate: OrderUpdate): Order => {
  return {
    customer: orderUpdate.customer,
    destination: orderUpdate.destination,
    id: orderUpdate.id,
    item: orderUpdate.item,
    price: Number((orderUpdate.price / 100.0).toFixed(2)),
    lastEventName: orderUpdate.eventName,
    lastUpdated: new Date(),
    lastUpdatedSecondIndexFromServer: orderUpdate.sentAtSecond,
  }
}

const sanitizeFilterInput = (rawFilterInput: string) => {
  let sanitized = rawFilterInput.trim()
  // Strip leading dollar sign if provided
  if (sanitized?.[0] === '$') {
    sanitized = sanitized.substring(1)
  }
  return sanitized
}

const filterOrderByPriceFuzzy = (filterTerm: string, order: Order): boolean => {
  const priceString = order.price.toFixed(2).toString()

  let match = true
  filterTerm.split('').forEach((char, idx) => {
    if (char !== priceString?.[idx]) {
      match = false
    }
  })
  return match
}

export { createDefaultOrder, createOrderFromOrderUpdate, filterOrderByPriceFuzzy, sanitizeFilterInput }
