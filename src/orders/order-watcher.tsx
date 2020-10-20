import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'
import io from 'socket.io-client'
import { createNanoEvents, Emitter, Unsubscribe } from 'nanoevents'
import type { OrderUpdate, OrderUpdateDataFromWebsocket } from './types'

export interface IOrderWatcher {
  start: () => Promise<void>
  stop: () => Promise<void>
  subscribeToOrderUpdates: (cb: (orderUpdateData: OrderUpdate) => void) => Unsubscribe
}

export interface OrderWatcherEvents {
  order_update: (order: OrderUpdate) => void
}

export interface SocketOrderWatcherEvents extends OrderWatcherEvents {
  connect: () => void
  disconnect: () => void
}

export interface SocketOrderWatcherConfig {
  io: SocketIOClient.Socket
  emitter?: Emitter<SocketOrderWatcherEvents>
}

class SocketIoOrderWatcher implements IOrderWatcher {
  private readonly io: SocketIOClient.Socket
  private readonly emitter: Emitter<SocketOrderWatcherEvents>

  constructor(config: SocketOrderWatcherConfig) {
    invariant(config.io, 'SocketOrderWatcher:ctor:socket.io instance must be provided.')
    this.io = config.io
    this.emitter = config.emitter ?? createNanoEvents<OrderWatcherEvents>()
  }

  public start = async () => {
    this.io.open()
    this.io.on('connect', this.handleSocketConnect)
    this.io.on('order_event', this.handleSocketOrderEvent)
    this.io.on('disconnect', this.handleSocketDisconnect)
  }

  public stop = async () => {
    this.io.close()
    this.io.off('connect', this.handleSocketConnect)
    this.io.off('order_event', this.handleSocketOrderEvent)
    this.io.off('disconnect', this.handleSocketDisconnect)
  }

  public subscribeToOrderUpdates = (cb: (orderUpdateData: OrderUpdate) => void) => {
    const unsubscribe = this.emitter.on('order_update', cb)
    return unsubscribe
  }

  public subscribeToConnectEvents = (cb: () => void) => {
    const unsubscribe = this.emitter.on('connect', cb)
    return unsubscribe
  }

  public subscribeToDisconnectEvents = (cb: () => void) => {
    const unsubscribe = this.emitter.on('disconnect', cb)
    return unsubscribe
  }

  private notifySubscribersOfOrderUpdate = (orderUpdate: OrderUpdateDataFromWebsocket) => {
    this.emitter.emit('order_update', SocketIoOrderWatcher.websocketMessageToOrderUpdate(orderUpdate))
  }

  private handleSocketOrderEvent = (data: Array<OrderUpdateDataFromWebsocket> | OrderUpdateDataFromWebsocket) => {
    const handleBatchUpdates = (batch: Array<OrderUpdateDataFromWebsocket>) => {
      batch.forEach((orderUpdate) => this.notifySubscribersOfOrderUpdate(orderUpdate))
    }
    if (Array.isArray(data)) {
      handleBatchUpdates(data)
    } else {
      this.notifySubscribersOfOrderUpdate(data)
    }
  }

  private handleSocketConnect = () => {
    this.emitter.emit('connect')
  }

  private handleSocketDisconnect = () => {
    this.emitter.emit('disconnect')
  }

  static websocketMessageToOrderUpdate = (wsOrderUpdate: OrderUpdateDataFromWebsocket): OrderUpdate => {
    return {
      customer: wsOrderUpdate.customer,
      destination: wsOrderUpdate.destination,
      eventName: wsOrderUpdate.event_name,
      id: wsOrderUpdate.id,
      item: wsOrderUpdate.item,
      price: wsOrderUpdate.price,
      sentAtSecond: wsOrderUpdate.sent_at_second,
    }
  }
}

const useSocketIoOrderWatcher = (websocketEndpoint: string, orderUpdateHandler: (orderUpdate: OrderUpdate) => void) => {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  useEffect(() => {
    const orderWatcher: SocketIoOrderWatcher = new SocketIoOrderWatcher({
      io: io(websocketEndpoint, { autoConnect: false }),
    })
    orderWatcher.start()
    const unsubscribeOrderUpdatesEvents = orderWatcher.subscribeToOrderUpdates(orderUpdateHandler)
    const unsubscribeConnectEvents = orderWatcher.subscribeToConnectEvents(() => setIsConnected(true))
    const unsubscribeDisconnectEvents = orderWatcher.subscribeToDisconnectEvents(() => setIsConnected(false))
    return () => {
      unsubscribeOrderUpdatesEvents()
      unsubscribeConnectEvents()
      unsubscribeDisconnectEvents()
      setIsConnected(false)
      orderWatcher.stop()
    }
  }, [orderUpdateHandler, websocketEndpoint])
  return isConnected
}

export { SocketIoOrderWatcher, useSocketIoOrderWatcher }
