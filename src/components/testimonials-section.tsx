"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "./providers";
import { SectionHead } from "./ui";

const directions = [
  { x: 60, y: 0 },
  { x: 0, y: 50 },
  { x: -60, y: 0 },
];

export function TestimonialsSection() {
  const { t } = useLang();
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-5 pt-24 md:pt-32">
      <SectionHead
        index="04"
        title={
          <>
            {t.testimonials.titleA}{" "}
            <span className="text-limed">{t.testimonials.titleB}</span>
          </>
        }
        sub={t.testimonials.sub}
      />
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {t.testimonials.items.map((item, i) => {
          const dir = directions[i];
          return (
            <motion.div
              key={i}
              className="relative rounded-2xl border border-line bg-ink2 p-6 md:p-7"
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, x: dir.x, y: dir.y },
                    whileInView: { opacity: 1, x: 0, y: 0 },
                    viewport: { once: true, margin: "-40px" },
                    transition: {
                      duration: 0.65,
                      delay: i * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  })}
            >
              {/* quotation mark */}
              <motion.span
                className="pointer-events-none absolute -top-3 left-5 select-none text-6xl font-black leading-none text-lime/25"
                {...(reduce
                  ? {}
                  : {
                      initial: { scale: 0, opacity: 0 },
                      whileInView: { scale: 1, opacity: 1 },
                      viewport: { once: true },
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 12,
                        delay: 0.3 + i * 0.12,
                      },
                    })}
              >
                &rdquo;
              </motion.span>

              <p className="relative z-10 text-[15px] leading-relaxed text-bone/85">
                {item.quote}
              </p>

              <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-[15px] font-black text-ink">
                  {item.name[0]}
                </span>
                <div>
                  <div className="text-[14px] font-bold text-bone">{item.name}</div>
                  <div className="text-[13px] text-mut">{item.role}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
