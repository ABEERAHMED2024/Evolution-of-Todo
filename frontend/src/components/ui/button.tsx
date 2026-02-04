'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium
   transition-all duration-300 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   active:scale-[0.98]`,
  {
    variants: {
      variant: {
        default: `
          bg-primary text-primary-foreground
          hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25
          active:bg-primary/80
        `,
        destructive: `
          bg-destructive text-destructive-foreground
          hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25
          active:bg-destructive/80
        `,
        outline: `
          border border-input bg-background
          hover:bg-accent hover:text-accent-foreground hover:border-accent
          active:bg-accent/80
        `,
        secondary: `
          bg-secondary text-secondary-foreground
          hover:bg-secondary/80 hover:shadow-md
          active:bg-secondary/70
        `,
        ghost: `
          hover:bg-accent hover:text-accent-foreground
          active:bg-accent/80
        `,
        link: `
          text-primary underline-offset-4
          hover:underline hover:text-primary/80
        `,
        // Futuristic variants
        neon: `
          bg-transparent border-2 border-primary text-primary
          hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]
          active:bg-primary/20
          transition-shadow
        `,
        glass: `
          bg-white/10 backdrop-blur-md border border-white/20 text-foreground
          hover:bg-white/20 hover:border-white/30 hover:shadow-glass
          dark:bg-black/20 dark:border-white/10
          dark:hover:bg-black/30 dark:hover:border-white/20
        `,
        gradient: `
          bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white
          hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25
          active:opacity-80
          bg-[length:200%_100%] hover:bg-right
          transition-all duration-500
        `,
        glow: `
          bg-primary text-primary-foreground
          shadow-[0_0_15px_rgba(59,130,246,0.5)]
          hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]
          active:shadow-[0_0_10px_rgba(59,130,246,0.4)]
        `,
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-md',
        sm: 'h-9 px-3 text-sm rounded-md',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      rounded: {
        default: '',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
      rounded: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a loading spinner and disables the button */
  loading?: boolean
  /** Icon to display before the button text */
  leftIcon?: React.ReactNode
  /** Icon to display after the button text */
  rightIcon?: React.ReactNode
  /** Render as a child component (useful for links) */
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      rounded,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, rounded, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}

        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button content */}
        {children && (
          <span className={cn(loading && 'opacity-70')}>{children}</span>
        )}

        {/* Right icon */}
        {rightIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Icon Button component for convenience
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode
  'aria-label': string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', variant = 'ghost', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn('p-0', className)}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

// Button Group component
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the button group */
  orientation?: 'horizontal' | 'vertical'
  /** Spacing between buttons */
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = 'horizontal', spacing = 'none', children, ...props }, ref) => {
    const spacingClasses = {
      none: '',
      sm: orientation === 'horizontal' ? 'gap-1' : 'gap-1',
      md: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
      lg: orientation === 'horizontal' ? 'gap-4' : 'gap-4',
    }

    const orientationClasses = {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    }

    // When spacing is none, create connected buttons
    const connectedClasses =
      spacing === 'none'
        ? orientation === 'horizontal'
          ? '[&>button:not(:first-child)]:rounded-l-none [&>button:not(:last-child)]:rounded-r-none [&>button:not(:first-child)]:-ml-px'
          : '[&>button:not(:first-child)]:rounded-t-none [&>button:not(:last-child)]:rounded-b-none [&>button:not(:first-child)]:-mt-px'
        : ''

    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          'inline-flex',
          orientationClasses[orientation],
          spacingClasses[spacing],
          connectedClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ButtonGroup.displayName = 'ButtonGroup'

export { Button, IconButton, ButtonGroup, buttonVariants }
