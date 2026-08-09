interface VerifiedStampProps {
  label?: string;
  sublabel?: string;
  size?: "sm" | "md";
}

export function VerifiedStamp({
  label = "VERIFIED",
  sublabel = "RERA",
  size = "md",
}: VerifiedStampProps) {
  const outer = size === "sm" ? "w-10 h-10" : "w-14 h-14";
  const inner = size === "sm" ? "w-8 h-8" : "w-11 h-11";
  const t1 = size === "sm" ? "text-[5.5px]" : "text-[7px]";
  const t2 = size === "sm" ? "text-[8px]" : "text-[10px]";

  return (
    <div
      className={`${outer} rounded-full border-2 border-dashed border-verified/50 bg-white/90 backdrop-blur-sm flex items-center justify-center -rotate-[9deg]`}
    >
      <div
        className={`${inner} rounded-full border-[1.5px] border-verified flex flex-col items-center justify-center font-mono text-verified leading-none`}
      >
        <span className={`${t1} font-semibold tracking-wide`}>{sublabel}</span>
        <span className={`${t2} font-bold mt-0.5`}>{label}</span>
      </div>
    </div>
  );
}