import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const glowButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        primary: [
          "bg-accent text-neutral-950 shadow-glow-cyan",
          "hover:bg-accent-hover hover:shadow-glow-cyan-lg hover:scale-[1.03]",
          "active:scale-95"
        ],
        secondary: [
          "bg-accent-secondary text-neutral-950 shadow-glow-lime",
          "hover:bg-[color-mix(in_srgb,var(--accent-secondary)_85%,black)] hover:shadow-glow-lime hover:scale-[1.03]",
          "active:scale-95"
        ],
        ghost: [
          "bg-transparent text-fg-secondary border border-line",
          "hover:bg-elevated hover:shadow-glow-accent-xs hover:border-accent-hover",
          "active:scale-95"
        ],
        gradient: [
          "bg-gradient-to-r from-accent to-accent-secondary text-neutral-950 relative",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-accent-hover before:to-accent-secondary before:opacity-0 before:transition-opacity before:duration-200",
          "hover:before:opacity-100 hover:shadow-glow-accent-lg hover:scale-105",
          "active:scale-95"
        ]
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant, size, asChild = false, loading, icon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(glowButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer effect for gradient variant */}
        {variant === "gradient" && (
          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        
        {/* Loading spinner */}
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        
        {/* Icon (passed via the `icon` prop) */}
        {icon && !loading && (
          <span className={cn("flex items-center", children && "mr-2")}>
            {icon}
          </span>
        )}

        {/* Content — inline-flex keeps any child icons (svg) on the same row as
            the text. Tailwind Preflight makes <svg> display:block, which would
            otherwise push the label onto a second line. */}
        {children != null && children !== false && (
          <span className="relative z-10 inline-flex items-center gap-2">
            {children}
          </span>
        )}
      </Comp>
    )
  }
)
GlowButton.displayName = "GlowButton"

export { GlowButton, glowButtonVariants }