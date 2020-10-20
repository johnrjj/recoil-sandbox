import { useRef, useEffect } from 'react'

type RequestIdleCallbackHandle = any
type RequestIdleCallbackOptions = {
  timeout: number
}
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean
  timeRemaining: () => number
}

declare global {
  interface Window {
    requestIdleCallback: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions
    ) => RequestIdleCallbackHandle
    cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void
  }
}

const useRequestAnimationFrameLoop = (cb: Function, deps?: Array<any>) => {
  // TODO(johnrjj) - Fallback gracefully to rIC from rAF when window loses focus
  const frame = useRef<number>()
  const last = useRef(performance.now())
  const init = useRef(performance.now())

  const animate = () => {
    const now = performance.now()
    // In seconds
    const time = (now - init.current) / 1000
    const delta = (now - last.current) / 1000
    cb({ time, delta })
    last.current = now
    frame.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    frame.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame.current!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

const useRequestIdleCallbackLoop = (cb: Function, timeout: number, deps?: Array<any>) => {
  const frame = useRef<number>()
  const last = useRef(performance.now())
  const init = useRef(performance.now())

  const animate = () => {
    const now = performance.now()
    // In seconds
    const time = (now - init.current) / 1000
    const delta = (now - last.current) / 1000
    cb({ time, delta })
    last.current = now
    frame.current = window.requestIdleCallback(animate, { timeout })
  }

  useEffect(() => {
    frame.current = window.requestIdleCallback(animate, { timeout })
    return () => window.cancelIdleCallback(frame.current!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

const useSetTimeoutLoop = (cb: Function, deps?: Array<any>) => {
  const frame = useRef<number>()
  const last = useRef(performance.now())
  const init = useRef(performance.now())

  const animate = () => {
    const now = performance.now()
    // In seconds
    const time = (now - init.current) / 1000
    const delta = (now - last.current) / 1000
    cb({ time, delta })
    last.current = now
    frame.current = (setTimeout(animate, 1) as unknown) as number
  }

  useEffect(() => {
    frame.current = (setTimeout(animate, 1) as unknown) as number
    return () => clearTimeout(frame.current!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export { useRequestAnimationFrameLoop, useRequestIdleCallbackLoop, useSetTimeoutLoop }
