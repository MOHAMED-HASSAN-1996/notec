import type { Metadata } from "next";
import { getT } from "@/lib/i18n-server";
import { CommunitiesGrid } from "@/components/communities-grid";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.communitiesPage.title };
}

export default async function CommunitiesPage() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-28 md:pt-36">
      <div className="mb-3 flex items-center gap-3 text-[15px] font-bold text-limed">
        <span>Notec</span>
        <span className="h-px w-10 bg-line" />
        <span className="text-bone">{t.communitiesPage.title}</span>
      </div>
      <h1 className="text-4xl font-black leading-[1.12] md:text-6xl">
        {t.communitiesPage.title}
      </h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-mut md:text-lg">
        {t.communitiesPage.sub}
      </p>
      <div className="mt-10">
        <CommunitiesGrid />
      </div>
    </div>
  );
}
