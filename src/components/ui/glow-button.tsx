import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const glowButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        primary: [
          "bg-cyan-500 text-white shadow-[0_0_12px_rgba(11,249,255,0.4)]",
          "hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(11,249,255,0.6)] hover:scale-105",
          "active:scale-95"
        ],
        secondary: [
          "bg-lime-500 text-black shadow-[0_0_12px_rgba(211,255,26,0.4)]",
          "hover:bg-lime-400 hover:shadow-[0_0_20px_rgba(211,255,26,0.6)] hover:scale-105",
          "active:scale-95"
        ],
        ghost: [
          "bg-transparent text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:shadow-[0_0_8px_rgba(11,249,255,0.3)] hover:border-cyan-400",
          "active:scale-95"
        ],
        gradient: [
          "bg-gradient-to-r from-cyan-500 to-lime-500 text-white relative",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-400 before:to-lime-400 before:opacity-0 before:transition-opacity before:duration-200",
          "hover:before:opacity-100 hover:shadow-[0_0_24px_rgba(11,249,255,0.5)] hover:scale-105",
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
        
        {/* Icon */}
        {icon && !loading && (
          <span className={cn("flex items-center", children && "mr-2")}>
            {icon}
          </span>
        )}
        
        {/* Content */}
        <span className="relative z-10">
          {children}
        </span>
      </Comp>
    )
  }
)
GlowButton.displayName = "GlowButton"

export { GlowButton, glowButtonVariants }