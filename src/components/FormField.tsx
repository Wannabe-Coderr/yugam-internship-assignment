import type { InputHTMLAttributes, ReactNode } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  action?: ReactNode
}

export function FormField({
  label,
  error,
  action,
  id,
  name,
  ...props
}: FormFieldProps) {
  const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="fieldGroup">
      <label htmlFor={inputId} className="fieldLabel">
        {label}
      </label>
      <div className={`inputShell ${error ? 'error' : ''}`}>
        <input id={inputId} name={name} {...props} />
        {action ? <div className="inputAction">{action}</div> : null}
      </div>
      {error ? (
        <span className="fieldError" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
