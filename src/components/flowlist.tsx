"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * FlowList — motion-first animated list (reactvibe style).
 * Staggered scroll-reveal + a subtle 2D drift: every row glides
 * on X and Y at a rate based on its position in the list.
 */
function FlowItem({
  index,
  count,
  children,
}: {
  index: number;
  count: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const center = (count - 1) / 2;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [(index - center) * -16, (index - center) * 16],
  );
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [index % 2 === 0 ? 7 : -7, index % 2 === 0 ? -7 : 7],
  );
  if (reduce) return <li>{children}</li>;
  return (
    <motion.li ref={ref} style={{ x, y, willChange: "transform" }}>
      {children}
    </motion.li>
  );
}

export function FlowList<T>({
  items,
  render,
  className = "",
}: {
  items: T[];
  render: (item: T, i: number) => ReactNode;
  className?: string;
}) {
  return (
    <motion.ul
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {items.map((it, i) => (
        <FlowItem key={i} index={i} count={items.length}>
          <motion.div
            className="h-full"
            variants={{
              hidden: { opacity: 0, y: 38 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {render(it, i)}
          </motion.div>
        </FlowItem>
      ))}
    </motion.ul>
  );
}

/**
 * SimpleList — plain scroll-reveal list without parallax drift.
 * Every row sits at its natural position, so spacing stays consistent.
 */
export function SimpleList<T>({
  items,
  render,
  className = "",
}: {
  items: T[];
  render: (item: T, i: number) => ReactNode;
  className?: string;
}) {
  return (
    <motion.ul
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {items.map((it, i) => (
        <motion.li
          key={i}
          className="h-full"
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {render(it, i)}
        </motion.li>
      ))}
    </motion.ul>
  );
}
