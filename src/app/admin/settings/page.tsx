import { updateSiteSettingsAction } from "@/lib/actions";
import { getSiteSettings } from "@/lib/site-settings";
import { PAYMENT_GATEWAY_ENV_HINTS } from "@/lib/payment-gateways";
import Link from "next/link";

export default async function AdminSettingsPage() {
  const s = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-50">Settings & payments</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-400">
        Daily submission limits, payment gateway toggles (Razorpay, Google Pay,
        Paytm, PayPhone, PayPal, Stripe), product flags for /advertise and
        /subscribe, SEO metadata, and footer social links (Facebook, Instagram,
        WhatsApp). Secrets stay in{" "}
        <code className="rounded bg-ink-900 px-1 text-ink-200">.env</code>.
      </p>

      <form
        action={
          updateSiteSettingsAction as unknown as (
            fd: FormData,
          ) => void | Promise<void>
        }
        className="mt-10 max-w-2xl space-y-8"
      >
        <fieldset className="space-y-4 rounded-xl border border-ink-800 bg-ink-900/30 p-5">
          <legend className="text-sm font-medium text-ink-200">
            Site promotion (SEO & social)
          </legend>
          <p className="text-xs text-ink-500">
            Controls the default{" "}
            <code className="text-ink-300">&lt;title&gt;</code>, description, and
            Open Graph / Twitter cards sitewide. Leave fields empty to use the
            built-in defaults. Set{" "}
            <code className="text-ink-300">NEXTAUTH_URL</code> in{" "}
            <code className="text-ink-300">.env</code> to your public site URL so
            share previews resolve images correctly.
          </p>
          <div>
            <label htmlFor="promoMetaTitle" className="text-sm text-ink-300">
              Default page title / OG title
            </label>
            <input
              id="promoMetaTitle"
              name="promoMetaTitle"
              type="text"
              maxLength={200}
              defaultValue={s.promoMetaTitle ?? ""}
              placeholder="Never Quit Punjabi — …"
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-sm text-ink-100"
            />
          </div>
          <div>
            <label
              htmlFor="promoMetaDescription"
              className="text-sm text-ink-300"
            >
              Meta description (search & social)
            </label>
            <textarea
              id="promoMetaDescription"
              name="promoMetaDescription"
              rows={3}
              maxLength={320}
              defaultValue={s.promoMetaDescription ?? ""}
              placeholder="Short pitch for Google, Facebook, X…"
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-sm text-ink-100"
            />
          </div>
          <div>
            <label htmlFor="promoKeywords" className="text-sm text-ink-300">
              Keywords (comma-separated)
            </label>
            <input
              id="promoKeywords"
              name="promoKeywords"
              type="text"
              maxLength={500}
              defaultValue={s.promoKeywords ?? ""}
              placeholder="Punjab, Punjabi, Never Quit, blog"
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-sm text-ink-100"
            />
          </div>
          <div>
            <label htmlFor="promoOgImageUrl" className="text-sm text-ink-300">
              Share image URL or path
            </label>
            <input
              id="promoOgImageUrl"
              name="promoOgImageUrl"
              type="text"
              maxLength={2048}
              defaultValue={s.promoOgImageUrl ?? ""}
              placeholder="/brand/never-quit-punjabi-logo.png"
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 font-mono text-xs text-ink-100"
            />
            <p className="mt-1 text-xs text-ink-500">
              Use a full <code className="text-ink-400">https://…</code> URL or a
              path from the site root (default brand logo if empty).
            </p>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-ink-800 bg-ink-900/30 p-5">
          <legend className="text-sm font-medium text-ink-200">
            Social links
          </legend>
          <p className="text-xs text-ink-500">
            Shown in the site footer. Use full{" "}
            <code className="text-ink-400">https://</code> links. For WhatsApp,
            use <code className="text-ink-400">https://wa.me/&lt;countrycode&gt;&lt;number&gt;</code>{" "}
            (digits only, no +).
          </p>
          <div>
            <label htmlFor="socialFacebookUrl" className="text-sm text-ink-300">
              Facebook
            </label>
            <input
              id="socialFacebookUrl"
              name="socialFacebookUrl"
              type="url"
              inputMode="url"
              maxLength={500}
              defaultValue={s.socialFacebookUrl ?? ""}
              placeholder="https://www.facebook.com/yourpage"
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 font-mono text-xs text-ink-100"
            />
          </div>
          <div>
            <label htmlFor="socialInstagramUrl" className="text-sm text-ink-300">
              Instagram
            </label>
            <input
              id="socialInstagramUrl"
              name="socialInstagramUrl"
              type="url"
              inputMode="url"
              maxLength={500}
              defaultValue={s.socialInstagramUrl ?? ""}
              placeholder="https://www.instagram.com/yourprofile"
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 font-mono text-xs text-ink-100"
            />
          </div>
          <div>
            <label htmlFor="socialWhatsAppUrl" className="text-sm text-ink-300">
              WhatsApp
            </label>
            <input
              id="socialWhatsAppUrl"
              name="socialWhatsAppUrl"
              type="url"
              inputMode="url"
              maxLength={500}
              defaultValue={s.socialWhatsAppUrl ?? ""}
              placeholder="https://wa.me/919876543210"
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 font-mono text-xs text-ink-100"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-ink-800 bg-ink-900/30 p-5">
          <legend className="text-sm font-medium text-ink-200">
            Author submissions
          </legend>
          <label className="flex items-center gap-3 text-sm text-ink-300">
            <input
              type="checkbox"
              name="dailyPostLimitEnabled"
              value="true"
              defaultChecked={s.dailyPostLimitEnabled}
              className="rounded border-ink-600 bg-ink-900 text-ember-500 focus:ring-ember-500/40"
            />
            Enable daily post limit per user (UTC day)
          </label>
          <div>
            <label htmlFor="dailyPostLimitCount" className="text-sm text-ink-300">
              Max posts per user per day
            </label>
            <input
              id="dailyPostLimitCount"
              name="dailyPostLimitCount"
              type="number"
              min={1}
              max={100}
              defaultValue={s.dailyPostLimitCount}
              className="mt-1 w-32 rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-ink-100"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-ink-800 bg-ink-900/30 p-5">
          <legend className="text-sm font-medium text-ink-200">
            Payment gateways
          </legend>
          <p className="text-xs text-ink-500">
            Turn on each processor you want to support at checkout. Put API keys and
            secrets only in <code className="text-ink-300">.env</code> — never in the
            database. This UI is configuration only until you wire payment routes.
          </p>
          <ul className="space-y-2 text-xs text-ink-500">
            <li>
              <strong className="text-ink-400">Stripe:</strong>{" "}
              <code className="text-ink-400">{PAYMENT_GATEWAY_ENV_HINTS.stripe}</code>
            </li>
            <li>
              <strong className="text-ink-400">Razorpay:</strong>{" "}
              <code className="text-ink-400">{PAYMENT_GATEWAY_ENV_HINTS.razorpay}</code>
            </li>
            <li>
              <strong className="text-ink-400">Google Pay:</strong>{" "}
              {PAYMENT_GATEWAY_ENV_HINTS.googlePay}
            </li>
            <li>
              <strong className="text-ink-400">Paytm:</strong>{" "}
              <code className="text-ink-400">{PAYMENT_GATEWAY_ENV_HINTS.paytm}</code>
            </li>
            <li>
              <strong className="text-ink-400">PayPhone:</strong>{" "}
              {PAYMENT_GATEWAY_ENV_HINTS.payPhone}
            </li>
            <li>
              <strong className="text-ink-400">PayPal:</strong>{" "}
              <code className="text-ink-400">{PAYMENT_GATEWAY_ENV_HINTS.payPal}</code>
            </li>
          </ul>
          <div className="mt-4 space-y-3 border-t border-ink-800/80 pt-4">
            <label className="flex items-center gap-3 text-sm text-ink-300">
              <input
                type="checkbox"
                name="paymentStripeEnabled"
                value="true"
                defaultChecked={s.paymentStripeEnabled}
                className="rounded border-ink-600 bg-ink-900 text-ember-500 focus:ring-ember-500/40"
              />
              Stripe
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-300">
              <input
                type="checkbox"
                name="paymentRazorpayEnabled"
                value="true"
                defaultChecked={s.paymentRazorpayEnabled}
                className="rounded border-ink-600 bg-ink-900 text-ember-500 focus:ring-ember-500/40"
              />
              Razorpay
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-300">
              <input
                type="checkbox"
                name="paymentGooglePayEnabled"
                value="true"
                defaultChecked={s.paymentGooglePayEnabled}
                className="rounded border-ink-600 bg-ink-900 text-ember-500 focus:ring-ember-500/40"
              />
              Google Pay / Google for Business
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-300">
              <input
                type="checkbox"
                name="paymentPaytmEnabled"
                value="true"
                defaultChecked={s.paymentPaytmEnabled}
                className="rounded border-ink-600 bg-ink-900 text-ember-500 focus:ring-ember-500/40"
              />
              Paytm
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-300">
              <input
                type="checkbox"
                name="paymentPayPhoneEnabled"
                value="true"
                defaultChecked={s.paymentPayPhoneEnabled}
                className="rounded border-ink-600 bg-ink-900 text-ember-500 focus:ring-ember-500/40"
              />
              PayPhone
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-300">
              <input
                type="checkbox"
                name="paymentPayPalEnabled"
                value="true"
                defaultChecked={s.paymentPayPalEnabled}
                className="rounded border-ink-600 bg-ink-900 text-ember-500 focus:ring-ember-500/40"
              />
              PayPal
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-ink-800 bg-ink-900/30 p-5">
          <legend className="text-sm font-medium text-ink-200">
            Paid products (ads & subscriptions)
          </legend>
          <p className="text-xs text-ink-500">
            These control whether public{" "}
            <Link href="/advertise" className="text-ember-500 hover:underline">
              /advertise
            </Link>{" "}
            and{" "}
            <Link href="/subscribe" className="text-ember-500 hover:underline">
              /subscribe
            </Link>{" "}
            pages are available. Combine with gateways above when you implement
            checkout.
          </p>
          <label className="flex items-center gap-3 text-sm text-ink-300">
            <input
              type="checkbox"
              name="paymentAdsEnabled"
              value="true"
              defaultChecked={s.paymentAdsEnabled}
              className="rounded border-ink-600 bg-ink-900 text-ember-500 focus:ring-ember-500/40"
            />
            Accept advertisement purchases (off by default)
          </label>
          <label className="flex items-center gap-3 text-sm text-ink-300">
            <input
              type="checkbox"
              name="paymentSubscriptionsEnabled"
              value="true"
              defaultChecked={s.paymentSubscriptionsEnabled}
              className="rounded border-ink-600 bg-ink-900 text-ember-500 focus:ring-ember-500/40"
            />
            Accept reader subscriptions (off by default)
          </label>
        </fieldset>

        <button
          type="submit"
          className="rounded-full bg-ember-500 px-8 py-2.5 text-sm font-semibold text-white hover:bg-ember-600"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
