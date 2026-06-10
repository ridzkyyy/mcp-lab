// Shared domain types for MCP Lab. Kept independent of the SDK so the UI
// can talk to both real servers and the built-in example session.

export interface McpToolSchemaProperty {
  type?: 'string' | 'number' | 'integer' | 'boolean'
  description?: string
  enum?: Array<string | number>
  default?: unknown
}

export interface McpToolInputSchema {
  type?: string
  properties?: Record<string, McpToolSchemaProperty>
  required?: string[]
}

export interface McpTool {
  name: string
  description?: string
  inputSchema: McpToolInputSchema
}

export interface McpTextContent {
  type: 'text'
  text: string
}

export type McpContentBlock = McpTextContent | { type: string; [key: string]: unknown }

export interface McpToolResult {
  isError: boolean
  content: McpContentBlock[]
}

export interface McpServerInfo {
  name: string
  version?: string
}

export type TransportKind = 'http' | 'sse'

/**
 * A live connection to an MCP server. The UI depends only on this interface,
 * so a real SDK-backed session and the in-memory example session are
 * interchangeable.
 */
export interface McpSession {
  readonly serverInfo: McpServerInfo
  listTools(): Promise<McpTool[]>
  callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult>
  close(): Promise<void>
}
