import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import type {
  McpContentBlock,
  McpServerInfo,
  McpSession,
  McpTool,
  McpToolInputSchema,
  McpToolResult,
  TransportKind,
} from '../types'

const CLIENT_INFO = { name: 'mcp-lab', version: '0.1.0' } as const

function createTransport(kind: TransportKind, url: URL): Transport {
  return kind === 'sse' ? new SSEClientTransport(url) : new StreamableHTTPClientTransport(url)
}

function parseUrl(rawUrl: string): URL {
  try {
    return new URL(rawUrl)
  } catch {
    throw new Error('Enter a valid URL, e.g. https://example.com/mcp')
  }
}

function toToolResult(raw: unknown): McpToolResult {
  const value = (raw ?? {}) as { isError?: unknown; content?: unknown }
  const content = Array.isArray(value.content) ? (value.content as McpContentBlock[]) : []
  return { isError: value.isError === true, content }
}

function connectErrorMessage(error: unknown): string {
  const base = error instanceof Error ? error.message : 'Failed to connect to the server'
  if (/cors|failed to fetch|networkerror|load failed/i.test(base)) {
    return `${base} — the server may not allow browser (CORS) requests. A local bridge is on the roadmap.`
  }
  return base
}

/**
 * Connect to a real MCP server over an HTTP-based transport and return a
 * session that conforms to the shared `McpSession` interface.
 */
export async function connectSession(rawUrl: string, kind: TransportKind): Promise<McpSession> {
  const url = parseUrl(rawUrl)
  const client = new Client(CLIENT_INFO, { capabilities: {} })
  const transport = createTransport(kind, url)

  try {
    await client.connect(transport)
  } catch (error: unknown) {
    throw new Error(connectErrorMessage(error), { cause: error })
  }

  const version = client.getServerVersion()
  const serverInfo: McpServerInfo = {
    name: version?.name ?? url.host,
    version: version?.version,
  }

  return {
    serverInfo,
    async listTools(): Promise<McpTool[]> {
      const { tools } = await client.listTools()
      return tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: (tool.inputSchema ?? { type: 'object' }) as McpToolInputSchema,
      }))
    },
    async callTool(name, args): Promise<McpToolResult> {
      const result = await client.callTool({ name, arguments: args })
      return toToolResult(result)
    },
    async close(): Promise<void> {
      await client.close()
    },
  }
}
