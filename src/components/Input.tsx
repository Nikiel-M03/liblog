import { forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type = 'text', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="flex flex-col gap-2">
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={clsx(
            'w-full px-3 py-2 border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'dark:bg-gray-700 dark:border-gray-600 dark:text-white',
            error && 'border-red-500 focus:ring-red-500',
            className,
          )}
          {...props}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
