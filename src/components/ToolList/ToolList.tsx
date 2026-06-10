import type { McpTool } from '../../types'
import './tool-list.css'

type Props = {
  tools: McpTool[]
  activeTool: string | null
  onSelect: (name: string) => void
}

export function ToolList({ tools, activeTool, onSelect }: Props) {
  if (tools.length === 0) {
    return <p className="tool-list__empty">No tools exposed by this server.</p>
  }

  return (
    <nav className="tool-list" aria-label="Tools">
      <h2 className="tool-list__heading">
        Tools <span>{tools.length}</span>
      </h2>
      <ul className="tool-list__items">
        {tools.map((tool) => {
          const isActive = tool.name === activeTool
          return (
            <li key={tool.name}>
              <button
                type="button"
                className={isActive ? 'tool-list__item is-active' : 'tool-list__item'}
                onClick={() => onSelect(tool.name)}
                aria-current={isActive}
              >
                <span className="tool-list__name">{tool.name}</span>
                {tool.description ? <span className="tool-list__desc">{tool.description}</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
