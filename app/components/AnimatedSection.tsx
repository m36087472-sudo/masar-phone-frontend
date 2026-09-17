"use client";
import { useEffect, useRef, useState } from "react";

// Single shared IntersectionObserver for all AnimatedSection instances
// (rather than one observer per instance) — reduces memory & observer overhead.
let sharedObserver: IntersectionObserver | null = null;
const callbackMap = new WeakMap<Element, () => void>();

function getObserver() {
  if (typeof window === "undefined") return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cb = callbackMap.get(entry.target);
            if (cb) {
              cb();
              sharedObserver?.unobserve(entry.target);
              callbackMap.delete(entry.target);
            }
          }
        }
      },
      { rootMargin: "0px" }
    );
  }
  return sharedObserver;
}

export default function AnimatedSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = getObserver();
    if (!observer) {
      setAnimated(true);
      return;
    }
    callbackMap.set(el, () => setAnimated(true));
    observer.observe(el);
    return () => {
      observer.unobserve(el);
      callbackMap.delete(el);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: animated ? 1 : 0.85,
        transform: animated ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.45s ease-out ${delay}s, transform 0.45s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
