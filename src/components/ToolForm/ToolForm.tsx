import { useMemo, useState, type FormEvent } from 'react'
import type { McpTool, McpToolSchemaProperty } from '../../types'
import './tool-form.css'

type FieldValue = string | boolean

type Props = {
  tool: McpTool
  isRunning: boolean
  onRun: (args: Record<string, unknown>) => void
}

function isNumeric(prop: McpToolSchemaProperty): boolean {
  return prop.type === 'number' || prop.type === 'integer'
}

function coerce(prop: McpToolSchemaProperty, raw: FieldValue): unknown {
  if (prop.type === 'boolean') return Boolean(raw)
  if (isNumeric(prop)) {
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return raw
}

export function ToolForm({ tool, isRunning, onRun }: Props) {
  const properties = useMemo(() => tool.inputSchema.properties ?? {}, [tool])
  const required = useMemo(() => new Set(tool.inputSchema.required ?? []), [tool])
  const [values, setValues] = useState<Record<string, FieldValue>>({})

  const setField = (name: string, value: FieldValue) =>
    setValues((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const args: Record<string, unknown> = {}
    for (const [name, prop] of Object.entries(properties)) {
      const raw = values[name]
      if (raw === undefined || raw === '') continue
      const value = coerce(prop, raw)
      if (value !== undefined) args[name] = value
    }
    onRun(args)
  }

  const entries = Object.entries(properties)

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <header>
        <h2 className="tool-form__title">{tool.name}</h2>
        {tool.description ? <p className="tool-form__desc">{tool.description}</p> : null}
      </header>

      {entries.length === 0 ? (
        <p className="tool-form__noargs">This tool takes no arguments.</p>
      ) : (
        <div className="tool-form__fields">
          {entries.map(([name, prop]) => (
            <Field
              key={name}
              name={name}
              prop={prop}
              isRequired={required.has(name)}
              value={values[name]}
              onChange={setField}
            />
          ))}
        </div>
      )}

      <button type="submit" className="btn btn--primary" disabled={isRunning}>
        {isRunning ? 'Running…' : 'Run tool'}
      </button>
    </form>
  )
}

type FieldProps = {
  name: string
  prop: McpToolSchemaProperty
  isRequired: boolean
  value: FieldValue | undefined
  onChange: (name: string, value: FieldValue) => void
}

function Field({ name, prop, isRequired, value, onChange }: FieldProps) {
  const label = (
    <span className="tool-form__label-text">
      <span className="tool-form__label-row">
        {name}
        {isRequired ? <span className="tool-form__req" aria-hidden="true">*</span> : null}
      </span>
      {prop.description ? <span className="tool-form__hint">{prop.description}</span> : null}
    </span>
  )

  if (prop.type === 'boolean') {
    return (
      <label className="tool-form__field tool-form__field--bool">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(name, e.target.checked)} />
        {label}
      </label>
    )
  }

  if (prop.enum && prop.enum.length > 0) {
    const current = typeof value === 'string' ? value : String(prop.default ?? prop.enum[0])
    return (
      <label className="tool-form__field">
        {label}
        <select value={current} onChange={(e) => onChange(name, e.target.value)}>
          {prop.enum.map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <label className="tool-form__field">
      {label}
      <input
        type={isNumeric(prop) ? 'number' : 'text'}
        value={typeof value === 'string' ? value : ''}
        required={isRequired}
        placeholder={prop.type ?? 'string'}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </label>
  )
}
