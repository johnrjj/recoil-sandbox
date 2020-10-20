export interface OrderUpdateDataFromWebsocket {
  customer: string
  destination: string
  event_name: string
  id: string
  item: string
  price: number
  sent_at_second: number
}

export interface OrderUpdate {
  customer: string
  destination: string
  eventName: string
  id: string
  item: string
  price: number
  sentAtSecond: number
}

export interface Order {
  customer: string
  destination: string
  id: string
  item: string
  price: number
  lastEventName: string
  lastUpdated: Date
  lastUpdatedSecondIndexFromServer: number
}
