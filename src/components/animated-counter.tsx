"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

export function AnimatedCounter({
  value,
  className,
  dir,
}: {
  value: number;
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration: reduce ? 0 : 1.6,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, mv, value, reduce]);

  return (
    <motion.div ref={ref} className={className} dir={dir}>
      {text}
    </motion.div>
  );
}