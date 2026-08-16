import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          // 基础样式
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",

          // 尺寸
          {
            "h-9 px-4 text-sm": size === 'sm',
            "h-12 px-6 text-base": size === 'md',
            "h-14 px-8 text-lg": size === 'lg',
          },

          // 变体
          {
            // Primary - 主要按钮（NHS 蓝）
            "bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]":
              variant === 'primary',

            // Secondary - 次要按钮
            "border-2 border-[#005EB8] text-[#005EB8] bg-transparent hover:bg-[#F0F7FF]":
              variant === 'secondary',

            // Danger - 危险按钮
            "bg-[#DA291C] text-white hover:bg-[#B02116] shadow-md":
              variant === 'danger',

            // Ghost - 幽灵按钮
            "text-[#005EB8] hover:bg-[#F5F5F5]":
              variant === 'ghost',
          },

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
