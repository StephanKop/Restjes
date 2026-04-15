import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const labelText = typeof label === 'string' ? label : undefined
    const inputId = id || (labelText ? labelText.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="min-w-0">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-semibold text-warm-800"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`min-w-0 w-full rounded-xl border bg-white px-4 py-3 text-base sm:text-sm text-warm-800 placeholder:text-warm-400 transition-all duration-150 focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-400 hover:border-red-500 focus:border-red-400 focus:ring-red-100'
              : 'border-warm-200 hover:border-warm-300 focus:border-brand-400 focus:ring-brand-100'
          } ${props.disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
