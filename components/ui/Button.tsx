import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-fifa-green hover:bg-fifa-green-light text-ink shadow-lg shadow-fifa-green/20",
  secondary:
    "bg-fifa-blue hover:bg-fifa-blue/90 text-white shadow-lg shadow-fifa-blue/20",
  ghost:
    "bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10",
  danger:
    "bg-red-600 hover:bg-red-500 text-white",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fifa-green/40 focus:ring-offset-2 focus:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
