import { clsx } from 'clsx'

const variants = {
  primary:   'bg-athleticBlue text-white hover:bg-athleticBlue-700 focus:ring-athleticBlue',
  secondary: 'bg-white text-athleticBlue border border-athleticBlue hover:bg-athleticBlue-50 focus:ring-athleticBlue',
  field:     'bg-energyGreen text-white hover:bg-energyGreen-700 focus:ring-energyGreen',
  urgent:    'bg-urgent text-white hover:bg-urgent-700 focus:ring-urgent',
  rapidFill: 'bg-rapidFill text-white hover:bg-rapidFill-700 focus:ring-rapidFill',
  ghost:     'bg-transparent text-navy hover:bg-gray-100 focus:ring-navy',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  white:     'bg-white text-energyGreen hover:bg-energyGreen-50 focus:ring-energyGreen',
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
