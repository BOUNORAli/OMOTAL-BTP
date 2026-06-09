import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  asChild,
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-8 px-2.5 text-xs",
        size === "md" && "h-10 px-3 text-sm",
        size === "lg" && "h-12 px-4 text-base",
        variant === "primary" && "bg-[#12355b] text-white shadow-sm hover:bg-[#0d2948]",
        variant === "secondary" && "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
