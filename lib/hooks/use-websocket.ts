import { useEffect, useRef, useState, useCallback } from 'react'

export interface WebSocketMessage {
  type: string
  [key: string]: any
}

export interface UseWebSocketOptions {
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  onMessage?: (message: WebSocketMessage) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
  autoConnect?: boolean
}

export interface UseWebSocketReturn {
  isConnected: boolean
  isConnecting: boolean
  error: Event | null
  send: (message: WebSocketMessage) => void
  connect: () => void
  disconnect: () => void
  subscribe: (eventType: string, callback: (data: any) => void) => () => void
}

/**
 * Custom hook for WebSocket connection management
 * Handles connection, reconnection, message sending, and event subscription
 */
export function useWebSocket(
  url: string | null,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    autoConnect = true,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Event | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())
  const messageQueueRef = useRef<WebSocketMessage[]>([])

  /**
   * Send a message through WebSocket
   */
  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message))
      } catch (err) {
        console.error('Error sending WebSocket message:', err)
      }
    } else {
      // Queue message if not connected
      messageQueueRef.current.push(message)
    }
  }, [])

  /**
   * Subscribe to specific event types
   */
  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set<(data: any) => void>())
    }
    subscribersRef.current.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(eventType)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          subscribersRef.current.delete(eventType)
        }
      }
    }
  }, [])

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        
        // Call global message handler
        onMessage?.(message)

        // Call type-specific subscribers
        const subscribers = subscribersRef.current.get(message.type)
        if (subscribers) {
          subscribers.forEach((callback) => callback(message))
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    },
    [onMessage]
  )

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!url || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        console.log('WebSocket connected:', url)
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        reconnectAttemptsRef.current = 0

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift()
          if (message) {
            ws.send(JSON.stringify(message))
          }
        }

        onOpen?.()
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected:', url)
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null

        onClose?.()

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          console.log(
            `Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`
          )
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else {
          console.error('Max reconnection attempts reached')
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError(event)
        setIsConnecting(false)
        onError?.(event)
      }

      ws.onmessage = handleMessage

      wsRef.current = ws
    } catch (err) {
      console.error('Error creating WebSocket:', err)
      setIsConnecting(false)
    }
  }, [url, onOpen, onClose, onError, handleMessage, reconnectInterval, maxReconnectAttempts])

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    reconnectAttemptsRef.current = maxReconnectAttempts // Prevent auto-reconnect
  }, [maxReconnectAttempts])

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect && url) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [url, autoConnect]) // Only reconnect if URL changes

  return {
    isConnected,
    isConnecting,
    error,
    send,
    connect,
    disconnect,
    subscribe,
  }
}
