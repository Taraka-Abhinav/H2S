import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 shadow-lg ${
        elevated ? "bg-surface-elevated/80" : "bg-surface/80"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
