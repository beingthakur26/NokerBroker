interface VerifiedStampProps {
  size?: "sm" | "md";
  variant?: "green" | "orange";
  children?: React.ReactNode;
}

export function VerifiedStamp({ size = "md", variant = "green", children = "Verified · Zero brokerage" }: VerifiedStampProps) {
  return (
    <span className={`stamp ${size === "sm" ? "sm" : ""} ${variant === "orange" ? "orange" : ""}`}>
      <span>{children}</span>
    </span>
  );
}
