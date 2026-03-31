import Image from "next/image";
import Link from "next/link";
import { BrandTitle } from "@/components/brand-title";
import { SocialFooterLinks } from "@/components/social-footer-links";
import { BRAND_LOGO_PATH } from "@/lib/brand";
import { SITE_NAME } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";

export async function SiteFooter() {
  let socialFacebookUrl: string | null = null;
  let socialInstagramUrl: string | null = null;
  let socialWhatsAppUrl: string | null = null;
  try {
    const s = await getSiteSettings();
    socialFacebookUrl = s.socialFacebookUrl;
    socialInstagramUrl = s.socialInstagramUrl;
    socialWhatsAppUrl = s.socialWhatsAppUrl;
  } catch {
    /* DB unavailable — footer still renders */
  }

  return (
    <footer className="border-t border-ink-800/80 bg-ink-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex gap-3">
          <Image
            src={BRAND_LOGO_PATH}
            alt={SITE_NAME}
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-md object-cover opacity-90"
          />
          <div>
            <p className="font-display text-ink-100">
              <BrandTitle />
            </p>
            <p className="mt-1 text-sm text-ink-400">
              Stories, comments, and community — moderated with care.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:items-end">
          <div className="flex flex-wrap items-center gap-6 text-sm text-ink-400">
            <Link href="/blog" className="hover:text-ink-200">
              Articles
            </Link>
            <Link href="/auth/register" className="hover:text-ink-200">
              Join
            </Link>
          </div>
          <SocialFooterLinks
            facebookUrl={socialFacebookUrl}
            instagramUrl={socialInstagramUrl}
            whatsAppUrl={socialWhatsAppUrl}
          />
          <p className="text-xs text-ink-500">
            Developed by{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-400 hover:text-ink-200"
            >
              Vercel
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
