"use client";

import { useEffect, useRef, useState } from "react";
import GuideAvatar from "./GuideAvatar";

interface AgentBubbleProps {
  message: string;
  onComplete?: () => void;
  typingDelay?: number;
  showAvatar?: boolean;
  className?: string;
  instant?: boolean;
}

export default function AgentBubble({
  message,
  onComplete,
  typingDelay = 30,
  showAvatar = true,
  className = "",
  instant = false,
}: AgentBubbleProps) {
  const [displayed, setDisplayed] = useState(instant ? message : "");
  const [done, setDone] = useState(instant);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (instant) {
      setDisplayed(message);
      setDone(true);
      onCompleteRef.current?.();
      return;
    }
    
    if (message.length === 0) {
      setDone(true);
      onCompleteRef.current?.();
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setDisplayed(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(t);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, typingDelay);
    return () => clearInterval(t);
  }, [message, typingDelay, instant]);

  return (
    <div
      className={`flex gap-3 ${className}`}
      style={{ animation: "bubble-in 0.35s ease-out" }}
    >
      {showAvatar && (
        <div className="flex-shrink-0 pt-1">
          <GuideAvatar size="sm" animated={!done} />
        </div>
      )}
      <div
        className="rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--card) 0%, rgba(255,255,255,0.98) 100%)",
          borderColor: "rgba(37, 99, 235, 0.25)",
        }}
      >
        <p className="font-sans text-[var(--foreground)] leading-relaxed">
          {displayed}
          {!done && (
            <span
              className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--primary)]"
              aria-hidden
            />
          )}
        </p>
      </div>
    </div>
  );
}
