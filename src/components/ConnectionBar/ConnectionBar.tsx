import { useState, type FormEvent } from 'react'
import type { TransportKind } from '../../types'
import type { ConnectionStatus } from '../../hooks/use-mcp-session'
import './connection-bar.css'

type Props = {
  status: ConnectionStatus
  serverName: string | null
  onConnect: (url: string, transport: TransportKind) => void
  onExample: () => void
  onDisconnect: () => void
}

export function ConnectionBar({ status, serverName, onConnect, onExample, onDisconnect }: Props) {
  const [url, setUrl] = useState('')
  const [transport, setTransport] = useState<TransportKind>('http')
  const isConnecting = status === 'connecting'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = url.trim()
    if (trimmed) onConnect(trimmed, transport)
  }

  if (status === 'connected') {
    return (
      <div className="connection-bar connection-bar--connected">
        <span className="connection-bar__dot" aria-hidden="true" />
        <span className="connection-bar__server">{serverName}</span>
        <button type="button" className="btn btn--ghost" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <form className="connection-bar" onSubmit={handleSubmit}>
      <input
        className="connection-bar__url"
        type="url"
        inputMode="url"
        placeholder="https://your-mcp-server.com/mcp"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        aria-label="MCP server URL"
      />
      <select
        className="connection-bar__transport"
        value={transport}
        onChange={(event) => setTransport(event.target.value as TransportKind)}
        aria-label="Transport"
      >
        <option value="http">HTTP</option>
        <option value="sse">SSE</option>
      </select>
      <button type="submit" className="btn btn--primary" disabled={isConnecting || !url.trim()}>
        {isConnecting ? 'Connecting…' : 'Connect'}
      </button>
      <button type="button" className="btn btn--ghost" onClick={onExample} disabled={isConnecting}>
        Try example
      </button>
    </form>
  )
}
