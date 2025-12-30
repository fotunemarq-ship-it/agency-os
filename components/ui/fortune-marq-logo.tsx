"use client";

interface FortuneMarqLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  logoPath?: string;
  showText?: boolean;
}

export default function FortuneMarqLogo({ 
  className = "", 
  size = "md",
  logoPath = "/Logo.png",
  showText = true
}: FortuneMarqLogoProps) {
  const sizeClasses = {
    sm: "w-32 h-auto max-h-20",
    md: "w-40 h-auto max-h-24",
    lg: "w-56 h-auto max-h-36",
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo Image */}
      <img
        src={logoPath}
        alt="FortuneMarq"
        className={sizeClasses[size]}
        style={{ objectFit: 'contain' }}
      />
      {showText && (
        <span className="mt-2 text-lg font-bold text-white">FortuneMarq</span>
      )}
    </div>
  );
}
