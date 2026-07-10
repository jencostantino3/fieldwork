import { clsx } from 'clsx'

const variants = {
  primary:   'bg-brand-navy text-white hover:bg-brand-800 focus:ring-brand-navy',
  secondary: 'bg-white text-brand-navy border border-brand-navy hover:bg-brand-50 focus:ring-brand-navy',
  field:     'bg-field text-white hover:bg-field-700 focus:ring-field',
  urgent:    'bg-urgent text-white hover:bg-urgent-700 focus:ring-urgent',
  ghost:     'bg-transparent text-brand-navy hover:bg-gray-100 focus:ring-brand-navy',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  white:     'bg-white text-field hover:bg-field-50 focus:ring-field',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  fullWidth,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg',
        'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
