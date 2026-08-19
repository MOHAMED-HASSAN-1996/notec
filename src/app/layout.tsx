import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { dict, isLang, type Lang } from "@/lib/i18n";
import { ToastProvider } from "@/components/toast";
import { Providers, type Theme } from "@/components/providers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export function generateMetadata(): Metadata {
  const lang: Lang = "ar";
  const t = dict[lang];
  return {
    title: {
      default: t.meta.homeTitle,
      template: "%s | Notec",
    },
    description: t.meta.homeDesc,
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0e",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const c = await cookies();
  const langVal = c.get("notec_lang")?.value;
  const lang: Lang = isLang(langVal) ? langVal : "ar";
  const theme: Theme = c.get("notec_theme")?.value === "light" ? "light" : "dark";

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={theme === "light" ? "light" : ""}
    >
      <body className="bg-ink text-bone antialiased">
        <Providers initialLang={lang} initialTheme={theme}>
          <ToastProvider>
            <div className="grain" aria-hidden />
            <Nav />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
