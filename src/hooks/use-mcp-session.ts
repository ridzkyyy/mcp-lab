import { useCallback, useState } from 'react'
import type { McpSession, McpTool, TransportKind } from '../types'
import { createExampleSession } from '../lib/exampleServer'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface SessionState {
  status: ConnectionStatus
  session: McpSession | null
  tools: McpTool[]
  error: string | null
}

const INITIAL: SessionState = { status: 'idle', session: null, tools: [], error: null }

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Failed to connect'
}

export function useMcpSession() {
  const [state, setState] = useState<SessionState>(INITIAL)

  const start = useCallback(async (factory: () => Promise<McpSession>) => {
    setState({ ...INITIAL, status: 'connecting' })
    try {
      const session = await factory()
      const tools = await session.listTools()
      setState({ status: 'connected', session, tools, error: null })
    } catch (error: unknown) {
      setState({ ...INITIAL, status: 'error', error: getErrorMessage(error) })
    }
  }, [])

  const connect = useCallback(
    (url: string, transport: TransportKind) =>
      start(async () => {
        // Load the SDK-backed client on demand so it stays out of the
        // initial bundle (the example session needs none of it).
        const { connectSession } = await import('../lib/mcpClient')
        return connectSession(url, transport)
      }),
    [start],
  )

  const connectExample = useCallback(() => start(() => Promise.resolve(createExampleSession())), [start])

  const disconnect = useCallback(() => {
    setState((prev) => {
      if (prev.session) void prev.session.close()
      return INITIAL
    })
  }, [])

  return { ...state, connect, connectExample, disconnect }
}
