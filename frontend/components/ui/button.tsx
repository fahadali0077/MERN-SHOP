import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold text-[13px] leading-none tracking-wide",
    "rounded-lg transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
    "select-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-white shadow-sm",
          "hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25",
          "active:translate-y-0 active:shadow-sm",
        ],
        outline: [
          "border border-border bg-white text-ink-soft shadow-xs",
          "hover:border-primary hover:bg-primary-light hover:text-primary hover:-translate-y-0.5 hover:shadow-sm",
          "dark:border-dark-border dark:bg-dark-surface dark:text-white dark:hover:border-primary dark:hover:bg-primary/10 dark:hover:text-primary",
        ],
        ghost: [
          "text-ink-muted",
          "hover:bg-surface-raised hover:text-ink",
          "dark:hover:bg-dark-surface-2 dark:text-white",
        ],
        amber: [
          "bg-amber text-white shadow-sm",
          "hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber/25",
          "active:translate-y-0",
        ],
        destructive: [
          "bg-red-600 text-white shadow-sm",
          "hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-md hover:shadow-red-600/25",
        ],
        link: [
          "text-primary underline-offset-4 hover:underline",
          "p-0 h-auto font-medium",
        ],
        secondary: [
          "bg-surface-raised border border-border text-ink shadow-xs",
          "hover:bg-surface-sunken hover:border-border hover:-translate-y-0.5 hover:shadow-sm",
          "dark:bg-dark-surface-2 dark:border-dark-border dark:text-white",
        ],
      },
      size: {
        sm:       "h-8 px-3 text-xs rounded-md",
        default:  "h-10 px-5",
        lg:       "h-12 px-7 text-[15px]",
        xl:       "h-14 px-9 text-base",
        icon:     "size-9 rounded-lg",
        "icon-sm":"h-8 w-8 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
