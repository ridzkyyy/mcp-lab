import type { McpContentBlock, McpToolResult } from '../../types'
import './result-view.css'

type Props = {
  result: McpToolResult | null
  error: string | null
}

function isTextBlock(block: McpContentBlock): block is { type: 'text'; text: string } {
  return block.type === 'text' && typeof (block as { text?: unknown }).text === 'string'
}

function ContentBlock({ block }: { block: McpContentBlock }) {
  const body = isTextBlock(block) ? block.text : JSON.stringify(block, null, 2)
  return <pre className="result-view__pre">{body}</pre>
}

export function ResultView({ result, error }: Props) {
  if (error) {
    return (
      <div className="result-view result-view--error" role="alert">
        <h3 className="result-view__heading">Error</h3>
        <pre className="result-view__pre">{error}</pre>
      </div>
    )
  }

  if (!result) {
    return <div className="result-view result-view--empty">Run a tool to see its result here.</div>
  }

  const className = result.isError ? 'result-view result-view--error' : 'result-view'

  return (
    <div className={className}>
      <h3 className="result-view__heading">{result.isError ? 'Tool error' : 'Result'}</h3>
      {result.content.length === 0 ? (
        <pre className="result-view__pre">(empty response)</pre>
      ) : (
        result.content.map((block, index) => <ContentBlock key={index} block={block} />)
      )}
    </div>
  )
}
