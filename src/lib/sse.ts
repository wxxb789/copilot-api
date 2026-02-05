import type { SSEMessage, SSEStreamingApi } from "hono/streaming"

type SseQueueOptions = {
  keepaliveMs?: number
}

type SseQueue = {
  sendSse: (message: SSEMessage) => Promise<void>
  sendRaw: (raw: string) => Promise<void>
  stop: () => void
}

export const createSseWriteQueue = (
  stream: SSEStreamingApi,
  options: SseQueueOptions,
): SseQueue => {
  let stopped = false
  let interval: ReturnType<typeof setInterval> | undefined
  let chain = Promise.resolve()

  const enqueue = (fn: () => Promise<void>) => {
    if (stopped) {
      return Promise.resolve()
    }
    chain = chain
      .then(() => (stopped ? undefined : fn()))
      .catch(() => undefined)
    return chain
  }

  const sendRaw = (raw: string) =>
    enqueue(async () => {
      await stream.write(raw)
    })
  const sendSse = (message: SSEMessage) =>
    enqueue(() => stream.writeSSE(message))

  const stop = () => {
    if (stopped) return
    stopped = true
    if (interval) {
      clearInterval(interval)
      interval = undefined
    }
  }

  if (options.keepaliveMs && options.keepaliveMs > 0) {
    interval = setInterval(() => {
      void sendRaw(": ping\n\n")
    }, options.keepaliveMs)
  }

  stream.onAbort(() => {
    stop()
  })

  return { sendSse, sendRaw, stop }
}
