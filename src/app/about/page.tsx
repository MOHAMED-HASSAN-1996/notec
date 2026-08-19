import type { Metadata } from "next";
import Image from "next/image";
import { getT } from "@/lib/i18n-server";
import { Reveal } from "@/components/parallax";
import { StepsList, type StepData } from "@/components/steps-list";
import { Btn, IconBolt, SectionHead } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.about.heroA };
}

export default async function AboutPage() {
  const { t } = await getT();

  const pillars: StepData[] = t.about.pillars.map((p, i) => ({
    n: `0${i + 1}`,
    icon: p.icon,
    t: p.t,
    d: p.d,
  }));

  return (
    <div className="pt-[72px]">
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-20 md:grid-cols-2 md:pt-28">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-lime/10 blur-3xl" />
            <Image
              src="/about-hero.jpg"
              alt="Notec"
              width={1600}
              height={1200}
              className="relative aspect-[4/3] w-full rounded-3xl border border-line object-cover"
            />
          </div>
          <div>
            <div className="mb-3 flex items-center gap-3 text-[15px] font-bold text-limed">
              <span>Notec</span>
              <span className="h-px w-10 bg-line" />
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.4] md:text-6xl">
              {t.about.heroA}
              <br />
              <span className="text-limed">{t.about.heroB}</span>
            </h1>
            <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-mut md:text-lg">
              {t.about.heroSub}
            </p>
          </div>
        </div>
      </section>

      {/* pillars */}
      <section className="mx-auto max-w-6xl px-5 pt-10">
        <SectionHead
          index="01"
          title={
            <>
              {t.about.pillarsTitleA}{" "}
              <span className="text-limed">{t.about.pillarsTitleB}</span>
            </>
          }
        />
        <StepsList items={pillars} />
        <div className="border-t border-line" />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-5 pt-24 md:pt-32">
        <SectionHead index="02" title={t.about.faqTitle} />
        <div className="flex flex-col gap-3">
          {t.about.faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-line bg-ink2 open:border-mut/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[16px] font-black [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-mut transition-transform group-open:rotate-45 group-open:text-limed">
                  <IconBolt className="size-4 rotate-90" />
                </span>
              </summary>
              <p className="px-6 pb-6 text-[15px] leading-relaxed text-mut">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-28 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-4xl font-black leading-tight md:text-6xl">
            {t.about.ctaA} <span className="text-limed">{t.about.ctaB}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-mut">
            {t.about.ctaSub}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Btn href="/events">{t.about.ctaEvents}</Btn>
            <Btn href="/add" variant="outline">
              {t.about.ctaAdd}
            </Btn>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
