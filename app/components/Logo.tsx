"use client";

import Link from "next/link";

interface LogoProps {
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: 32, md: 40, lg: 48 };

export default function Logo({ 
  href = "/", 
  showText = true, 
  size = "md",
  className = "" 
}: LogoProps) {
  const iconSize = sizes[size];
  
  const logoContent = (
    <div className={`flex items-center gap-2.5 group ${className}`} style={{ padding: 0, margin: 0 }}>
      {/* Use actual logo image - show full logo (icon + text) */}
      {showText ? (
        <img 
          src="/logo.png"
          alt="FlowOpta"
          className="transition-transform group-hover:scale-105"
          style={{
            height: `${iconSize}px`,
            width: 'auto',
            display: 'block',
            padding: 0,
            margin: 0,
            verticalAlign: 'middle',
          }}
        />
      ) : (
        <div 
          className="flex items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-105 relative overflow-hidden"
          style={{
            width: iconSize,
            height: iconSize,
            boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/logo.png)',
              backgroundSize: 'auto 100%',
              backgroundPosition: 'left center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}
