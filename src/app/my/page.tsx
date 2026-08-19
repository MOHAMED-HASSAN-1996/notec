import type { Metadata } from "next";
import { getT } from "@/lib/i18n-server";
import { MyList } from "@/components/my-list";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.my.title };
}

export default async function MyPage() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-4xl px-5 pb-20 pt-28 md:pt-36">
      <div className="mb-3 flex items-center gap-3 text-[15px] font-bold text-limed">
        <span>Notec</span>
        <span className="h-px w-10 bg-line" />
      </div>
      <h1 className="text-5xl font-black leading-none md:text-7xl">{t.my.title}</h1>
      <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-mut">{t.my.sub}</p>
      <div className="mt-12">
        <MyList />
      </div>
    </div>
  );
}
