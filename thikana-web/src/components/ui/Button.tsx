import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "accent" | "outline" | "primary" | "whatsapp" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  accent:
    "bg-orange text-white shadow-[0_6px_16px_rgba(244,96,15,0.28)] hover:bg-orange-deep",
  outline:
    "bg-transparent border-[1.5px] border-border text-ink hover:border-orange hover:text-orange-deep",
  primary: "bg-ink text-white hover:bg-[#3A2B21]",
  whatsapp: "bg-whatsapp text-white",
  ghost: "bg-transparent text-ink-soft",
};

const Button = ({
  variant = "primary",
  block,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
        variants[variant],
        block && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };