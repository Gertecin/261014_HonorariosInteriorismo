import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  type?: 'button' | 'submit'
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  fullWidth = false,
  type = 'button'
}: ButtonProps) {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary'
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClass} ${widthClass}`}
    >
      {children}
    </button>
  )
}
