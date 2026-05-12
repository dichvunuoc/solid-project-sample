/**
 * Base Card Component
 *
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

import { memo } from 'react'
import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

export const Card = memo(function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  )
})
