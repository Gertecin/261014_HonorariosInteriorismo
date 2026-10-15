import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  disabled = false
}: ButtonProps) {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary'
  const widthClass = fullWidth ? 'w-full' : ''
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed active:scale-100' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${widthClass} ${disabledClass}`}
    >
      {children}
    </button>
  )
}
