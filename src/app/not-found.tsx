"use client";

import { Btn } from "@/components/ui";
import { useLang } from "@/components/providers";

export default function NotFound() {
  const { t } = useLang();
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
      <div className="text-outline font-black text-[18vw] leading-none" aria-hidden>
        404
      </div>
      <h1 className="mt-6 text-3xl font-black md:text-5xl">{t.notFound.title}</h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mut">
        {t.notFound.body}
      </p>
      <div className="mt-8 flex gap-3">
        <Btn href="/">{t.notFound.back}</Btn>
        <Btn href="/events" variant="outline">
          {t.notFound.events}
        </Btn>
      </div>
    </section>
  );
}
