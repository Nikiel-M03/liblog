import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

function Card({ children, className, title }: CardProps) {
  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-lg shadow-md p-6', className)}>
      {title && <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>}
      {children}
    </div>
  )
}

export default Card
