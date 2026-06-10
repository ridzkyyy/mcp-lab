import { useState } from 'react'
import { ConnectionBar } from './components/ConnectionBar/ConnectionBar'
import { ToolList } from './components/ToolList/ToolList'
import { ToolForm } from './components/ToolForm/ToolForm'
import { ResultView } from './components/ResultView/ResultView'
import { useMcpSession } from './hooks/use-mcp-session'
import type { McpToolResult } from './types'
import './App.css'

const REPO_URL = 'https://github.com/ridzkyyy/mcp-lab'

function App() {
  const { status, session, tools, error, connect, connectExample, disconnect } = useMcpSession()
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<McpToolResult | null>(null)
  const [callError, setCallError] = useState<string | null>(null)

  const selectedTool = tools.find((tool) => tool.name === activeTool) ?? null

  const resetCallState = () => {
    setResult(null)
    setCallError(null)
  }

  const handleSelect = (name: string) => {
    setActiveTool(name)
    resetCallState()
  }

  const handleRun = async (args: Record<string, unknown>) => {
    if (!session || !selectedTool) return
    setIsRunning(true)
    resetCallState()
    try {
      const toolResult = await session.callTool(selectedTool.name, args)
      setResult(toolResult)
    } catch (err: unknown) {
      setCallError(err instanceof Error ? err.message : 'Tool call failed')
    } finally {
      setIsRunning(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setActiveTool(null)
    resetCallState()
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">🧪</span>
          <div>
            <h1 className="app__title">MCP Lab</h1>
            <p className="app__tagline">Postman for MCP servers</p>
          </div>
        </div>
        <a className="app__repo" href={REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub ★
        </a>
      </header>

      <ConnectionBar
        status={status}
        serverName={session?.serverInfo.name ?? null}
        onConnect={connect}
        onExample={connectExample}
        onDisconnect={handleDisconnect}
      />

      {status === 'error' && error ? (
        <p className="app__banner" role="alert">
          {error}
        </p>
      ) : null}

      {status === 'connected' ? (
        <main className="app__workspace">
          <aside className="app__sidebar">
            <ToolList tools={tools} activeTool={activeTool} onSelect={handleSelect} />
          </aside>
          <section className="app__panel">
            {selectedTool ? (
              <ToolForm key={selectedTool.name} tool={selectedTool} isRunning={isRunning} onRun={handleRun} />
            ) : (
              <p className="app__placeholder">Select a tool from the left to call it.</p>
            )}
            <ResultView result={result} error={callError} />
          </section>
        </main>
      ) : (
        <section className="app__hero" aria-labelledby="hero-heading">
          <h2 id="hero-heading">Connect to an MCP server</h2>
          <p>
            Paste a server URL above, or click <strong>Try example</strong> to explore a built-in mock
            server — no setup, no install. List its tools, fill in the generated form, and read the
            result formatted instead of raw JSON-RPC.
          </p>
        </section>
      )}

      <footer className="app__footer">
        MVP · HTTP &amp; SSE transports ·{' '}
        <a href={`${REPO_URL}/blob/main/ROADMAP.md`} target="_blank" rel="noopener noreferrer">
          roadmap
        </a>
      </footer>
    </div>
  )
}

export default App
