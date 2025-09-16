import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const tagChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-[0_0_8px_rgba(11,249,255,0.3)]",
        active: "bg-gradient-to-r from-cyan-500 to-lime-500 text-white shadow-[0_0_12px_rgba(11,249,255,0.4)]",
        removable: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
      },
      size: {
        sm: "px-2 py-1 text-xs h-6",
        md: "px-3 py-1.5 text-sm h-7",
        lg: "px-4 py-2 text-base h-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

export interface TagChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagChipVariants> {
  children: React.ReactNode
  count?: number
  removable?: boolean
  onRemove?: () => void
}

const TagChip = React.forwardRef<HTMLDivElement, TagChipProps>(
  ({ className, variant, size, children, count, removable, onRemove, ...props }, ref) => {
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation()
      onRemove?.()
    }

    return (
      <div
        className={cn(
          tagChipVariants({ 
            variant: removable ? "removable" : variant, 
            size, 
            className 
          })
        )}
        ref={ref}
        {...props}
      >
        <span className="truncate">{children}</span>
        {count && (
          <span className="flex items-center justify-center min-w-[16px] h-4 px-1 text-xs bg-black/20 dark:bg-white/20 rounded-full">
            {count}
          </span>
        )}
        {removable && (
          <button
            onClick={handleRemove}
            className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            <X size={10} />
          </button>
        )}
      </div>
    )
  }
)
TagChip.displayName = "TagChip"

// Group component for tag lists
interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxVisible?: number
  showMore?: boolean
  onShowMore?: () => void
}

const TagGroup = React.forwardRef<HTMLDivElement, TagGroupProps>(
  ({ className, children, maxVisible = 3, showMore, onShowMore, ...props }, ref) => {
    const childArray = React.Children.toArray(children)
    const visibleChildren = childArray.slice(0, maxVisible)
    const hiddenCount = childArray.length - maxVisible

    return (
      <div
        className={cn("flex flex-wrap gap-1.5", className)}
        ref={ref}
        {...props}
      >
        {visibleChildren}
        {hiddenCount > 0 && !showMore && (
          <TagChip
            size="sm"
            variant="default"
            onClick={onShowMore}
            className="cursor-pointer"
          >
            +{hiddenCount}
          </TagChip>
        )}
        {showMore && childArray.slice(maxVisible)}
      </div>
    )
  }
)
TagGroup.displayName = "TagGroup"

export { TagChip, TagGroup, tagChipVariants }