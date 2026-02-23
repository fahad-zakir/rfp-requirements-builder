"use client";

import { useId } from "react";

interface GuideAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const sizes = { sm: 60, md: 80, lg: 100 };

export default function GuideAvatar({ className = "", size = "md", animated = true }: GuideAvatarProps) {
  const id = useId().replace(/:/g, "");
  const px = sizes[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full opacity-60"
        style={{
          background: `radial-gradient(circle, var(--glow) 0%, transparent 70%)`,
          animation: animated ? "pulse-glow 3s ease-in-out infinite" : undefined,
        }}
      />
      {/* Use actual logo icon from image - crop to show just icon portion */}
      <div
        className="relative drop-shadow-lg rounded-full overflow-hidden"
        style={{
          width: px,
          height: px,
          animation: animated ? "float 4s ease-in-out infinite" : undefined,
        }}
      >
        <img
          src="/logo-2.png"
          alt="FlowOpta Guide"
          className="absolute inset-0 w-full h-full object-contain rounded-full"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
}
