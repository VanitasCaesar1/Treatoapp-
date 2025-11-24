import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useCapacitor } from "@/lib/capacitor"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-airbnb text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-medical-blue text-white hover:bg-medical-blue-dark shadow-airbnb",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-airbnb",
        outline:
          "border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost:
          "hover:bg-gray-100 text-gray-700",
        link: "text-medical-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-11 px-4 py-2",
        lg: "h-14 px-8 py-4 text-base",
        icon: "size-10",
        "icon-sm": "size-10",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  haptic = true,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    haptic?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  const capacitor = useCapacitor()

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && !props.disabled) {
      await capacitor.lightHaptic()
    }
    onClick?.(e)
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    />
  )
}

export { Button, buttonVariants }
