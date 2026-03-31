import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-[14px] text-ink ring-offset-white transition-colors",
          "placeholder:text-ink-muted/60",
          "focus-visible:outline-none focus-visible:border-amber focus-visible:ring-1 focus-visible:ring-amber/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Dark mode
          "dark:border-dark-border dark:bg-dark-surface dark:text-white dark:placeholder:text-ink-muted/60 dark:focus-visible:border-amber dark:focus-visible:ring-amber/30",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
