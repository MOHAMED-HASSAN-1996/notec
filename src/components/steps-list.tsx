"use client";

import { FlowList } from "./flowlist";
import { IconBell, IconBolt, IconMerge, IconPlus, IconSpark } from "./ui";

export type StepData = {
  n: string;
  icon: "plus" | "spark" | "bell" | "merge" | "bolt";
  t: string;
  d: string;
};

const icons = {
  plus: IconPlus,
  spark: IconSpark,
  bell: IconBell,
  merge: IconMerge,
  bolt: IconBolt,
};

export function StepsList({ items }: { items: StepData[] }) {
  return (
    <FlowList
      items={items}
      render={(s, i) => {
        const Ico = icons[s.icon];
        return (
          <div
            key={i}
            className="group flex flex-col gap-5 border-t border-line py-8 transition-colors hover:bg-card/30 sm:flex-row sm:items-center sm:gap-10 sm:px-4"
          >
            <span className="text-outline font-black text-6xl leading-none transition-all group-hover:[-webkit-text-stroke-color:rgba(201,242,75,0.5)] md:text-7xl">
              {s.n}
            </span>
            <span className="grid size-13 shrink-0 place-items-center rounded-2xl border border-line bg-ink2 text-limed transition-transform group-hover:-translate-y-1 group-hover:rotate-6">
              <Ico className="size-6" />
            </span>
            <div className="flex-1">
              <h3 className="text-2xl font-black">{s.t}</h3>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-mut">
                {s.d}
              </p>
            </div>
          </div>
        );
      }}
    />
  );
}
