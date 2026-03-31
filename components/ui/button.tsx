import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — every button shares these
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold text-[13px] leading-none tracking-wide",
    "rounded-lg transition-all duration-150 ease-spring",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "select-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-ink text-white shadow-sm",
          "hover:bg-ink-soft hover:-translate-y-px hover:shadow-md",
          "active:translate-y-0 active:shadow-sm",
          "dark:bg-amber dark:text-white dark:hover:bg-amber-600",
        ],
        outline: [
          "border border-border bg-white text-ink-soft shadow-xs",
          "hover:border-ink hover:text-ink hover:-translate-y-px hover:shadow-sm",
          "dark:border-dark-border dark:bg-dark-surface dark:text-white dark:hover:border-white",
        ],
        ghost: [
          "text-ink-muted",
          "hover:bg-cream hover:text-ink",
          "dark:hover:bg-dark-surface-2 dark:text-white",
        ],
        amber: [
          "bg-amber text-white shadow-sm",
          "hover:bg-amber-600 hover:-translate-y-px hover:shadow-md",
          "active:translate-y-0",
        ],
        destructive: [
          "bg-red-600 text-white shadow-sm",
          "hover:bg-red-700 hover:-translate-y-px",
        ],
        link: [
          "text-amber underline-offset-4 hover:underline",
          "p-0 h-auto font-medium",
        ],
      },
      size: {
        sm:      "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-5",
        lg:      "h-12 px-7 text-[15px]",
        xl:      "h-14 px-9 text-base",
        icon:    "size-9 rounded-lg hover:bg-cream dark:hover:bg-dark-surface-2",
        "icon-sm": "h-8 w-8 rounded-md",
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
