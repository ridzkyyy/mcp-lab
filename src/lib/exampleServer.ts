import type { McpSession, McpTool, McpToolResult } from '../types'

// A fully in-memory MCP session so the empty state is never empty and the
// live demo works offline, with zero CORS or setup friction.

const EXAMPLE_TOOLS: McpTool[] = [
  {
    name: 'echo',
    description: 'Echo a message back — the simplest possible tool.',
    inputSchema: {
      type: 'object',
      properties: { message: { type: 'string', description: 'Text to echo back' } },
      required: ['message'],
    },
  },
  {
    name: 'add',
    description: 'Add two numbers and return the sum.',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First addend' },
        b: { type: 'number', description: 'Second addend' },
      },
      required: ['a', 'b'],
    },
  },
  {
    name: 'get_forecast',
    description: 'Return a mock weather forecast for a city.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name' },
        units: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius',
          description: 'Temperature units',
        },
      },
      required: ['city'],
    },
  },
]

function text(value: string): McpToolResult {
  return { isError: false, content: [{ type: 'text', text: value }] }
}

function callExampleTool(name: string, args: Record<string, unknown>): McpToolResult {
  switch (name) {
    case 'echo':
      return text(String(args.message ?? ''))
    case 'add': {
      const a = Number(args.a ?? 0)
      const b = Number(args.b ?? 0)
      return text(JSON.stringify({ a, b, sum: a + b }, null, 2))
    }
    case 'get_forecast': {
      const city = String(args.city ?? 'Nowhere')
      const units = args.units === 'fahrenheit' ? 'fahrenheit' : 'celsius'
      const temperature = units === 'fahrenheit' ? 72 : 22
      return text(JSON.stringify({ city, units, temperature, condition: 'Partly cloudy' }, null, 2))
    }
    default:
      return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${name}` }] }
  }
}

export function createExampleSession(): McpSession {
  return {
    serverInfo: { name: 'Example MCP Server', version: '0.1.0' },
    async listTools(): Promise<McpTool[]> {
      return EXAMPLE_TOOLS
    },
    async callTool(name, args): Promise<McpToolResult> {
      return callExampleTool(name, args)
    },
    async close(): Promise<void> {
      // no-op: the example session holds no real connection
    },
  }
}
