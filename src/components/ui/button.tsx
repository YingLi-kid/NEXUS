import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "ghost" | "quiet" | "danger";

export function Button({
  variant = "ghost",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        "focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "bg-cyan text-bg hover:opacity-90",
        variant === "ghost" && "bg-elev text-fg shadow-panel hover:bg-elev-2",
        variant === "quiet" && "bg-transparent px-3 text-muted hover:text-fg",
        variant === "danger" && "bg-violet text-fg hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}
