import type { SiteSettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_ID = "site";

/** In-memory defaults when the DB is unreachable (e.g. CI/build with bad `DATABASE_URL`). */
function defaultSiteSettingsRow(): SiteSettings {
  const now = new Date();
  return {
    id: DEFAULT_ID,
    dailyPostLimitEnabled: false,
    dailyPostLimitCount: 3,
    paymentAdsEnabled: false,
    paymentSubscriptionsEnabled: false,
    paymentStripeEnabled: false,
    paymentRazorpayEnabled: false,
    paymentGooglePayEnabled: false,
    paymentPaytmEnabled: false,
    paymentPayPhoneEnabled: false,
    paymentPayPalEnabled: false,
    promoMetaTitle: null,
    promoMetaDescription: null,
    promoKeywords: null,
    promoOgImageUrl: null,
    socialFacebookUrl: null,
    socialInstagramUrl: null,
    socialWhatsAppUrl: null,
    updatedAt: now,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    return await prisma.siteSettings.upsert({
      where: { id: DEFAULT_ID },
      create: { id: DEFAULT_ID },
      update: {},
    });
  } catch {
    return defaultSiteSettingsRow();
  }
}
