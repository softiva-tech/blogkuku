import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSessionSafe } from "@/lib/get-session";
import { getSiteSettings } from "@/lib/site-settings";
import { getBaseUrl, getMetadataBaseUrl } from "@/lib/base-url";
import { BRAND_LOGO_PATH } from "@/lib/brand";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE_DEFAULT } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

function absoluteOgImageUrl(base: string, pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  const path = t.startsWith("/") ? t : `/${t}`;
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const base = getBaseUrl();
    let promoMetaTitle: string | null = null;
    let promoMetaDescription: string | null = null;
    let promoKeywords: string | null = null;
    let promoOgImageUrl: string | null = null;
    try {
      const s = await getSiteSettings();
      promoMetaTitle = s.promoMetaTitle;
      promoMetaDescription = s.promoMetaDescription;
      promoKeywords = s.promoKeywords;
      promoOgImageUrl = s.promoOgImageUrl;
    } catch {
      /* DB unavailable — fall back to static defaults */
    }

    const titleDefault = promoMetaTitle?.trim() || SITE_TITLE_DEFAULT;
    const description = promoMetaDescription?.trim() || SITE_DESCRIPTION;
    const keywords = promoKeywords
      ?.split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    const ogImagePath = promoOgImageUrl?.trim() || BRAND_LOGO_PATH;
    const ogImageAbsolute = absoluteOgImageUrl(base, ogImagePath);

    return {
      metadataBase: getMetadataBaseUrl(),
      title: {
        default: titleDefault,
        template: `%s · ${SITE_NAME}`,
      },
      description,
      ...(keywords?.length ? { keywords } : {}),
      icons: {
        icon: [{ url: BRAND_LOGO_PATH, type: "image/png" }],
        apple: [{ url: BRAND_LOGO_PATH, type: "image/png" }],
      },
      openGraph: {
        type: "website",
        locale: "en_US",
        siteName: SITE_NAME,
        title: titleDefault,
        description,
        images: [
          {
            url: ogImageAbsolute,
            width: 512,
            height: 512,
            alt: SITE_NAME,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: titleDefault,
        description,
        images: [ogImageAbsolute],
      },
      robots: { index: true, follow: true },
    };
  } catch (e) {
    console.error("[layout] generateMetadata failed:", e);
    return {
      metadataBase: getMetadataBaseUrl(),
      title: { default: SITE_TITLE_DEFAULT, template: `%s · ${SITE_NAME}` },
      description: SITE_DESCRIPTION,
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionSafe();

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">
        <SiteHeader session={session} />
        <Providers session={session}>
          <main className="min-h-[50vh]">{children}</main>
        </Providers>
        <SiteFooter />
      </body>
    </html>
  );
}
