"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * 2D parallax: moves children on X and Y relative to page scroll.
 * x / y are pixels-per-scrolled-pixel (e.g. 0.12 or -0.2).
 */
export function Parallax({
  x = 0,
  y = 0,
  className,
  children,
}: {
  x?: number;
  y?: number;
  className?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const px = useTransform(scrollY, (v) => v * x);
  const py = useTransform(scrollY, (v) => v * y);
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      style={{ x: px, y: py, willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

/** Bounded parallax relative to the element itself (for covers & bands). */
export function LocalParallax({
  y = 60,
  className,
  children,
}: {
  y?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const ty = useTransform(scrollYProgress, [0, 1], [y, -y]);
  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full w-full"
        style={reduce ? undefined : { y: ty, willChange: "transform" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Scroll-reveal fade-up, used across the site. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Underline that scales in from 0 to 100% width. */
export function Underline({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={`inline-block ${className}`} />;
  return (
    <motion.span
      className={`inline-block origin-right ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

/** Gentle infinite floating bob up/down. */
export function Float({
  y = 12,
  duration = 4,
  delay = 0,
  className,
  children,
}: {
  y?: number;
  duration?: number;
  delay?: number;
  className?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -y, 0] }}
      transition={{ duration, delay, ease: "easeInOut", repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}
