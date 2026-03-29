import Link from "next/link";
import { enabledPaymentGatewayLabels } from "@/lib/payment-gateways";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdvertisePage() {
  const s = await getSiteSettings();

  if (!s.paymentAdsEnabled) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl text-ink-50">Advertise</h1>
        <p className="mt-4 text-sm text-ink-400">
          Sponsored placements are not available right now.
        </p>
        <Link href="/" className="mt-8 inline-block text-ember-500 hover:underline">
          ← Home
        </Link>
      </div>
    );
  }

  const gateways = enabledPaymentGatewayLabels(s);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
      <h1 className="font-display text-2xl text-ink-50">Advertise with us</h1>
      <p className="mt-4 text-sm text-ink-400">
        Ad sales are enabled. Wire your checkout (and env keys); this page is still
        a placeholder until you connect a payment flow.
      </p>
      {gateways.length > 0 ? (
        <p className="mt-3 text-sm text-ink-500">
          <span className="text-ink-400">Gateways marked on in admin:</span>{" "}
          {gateways.join(", ")}
        </p>
      ) : (
        <p className="mt-3 text-xs text-amber-200/90">
          No payment gateways are enabled yet — turn them on under Admin → Settings
          → Payment gateways.
        </p>
      )}
      <button
        type="button"
        disabled
        className="mt-8 w-full cursor-not-allowed rounded-full border border-ink-700 py-3 text-sm text-ink-500"
      >
        Start ad booking (coming soon)
      </button>
      <Link href="/" className="mt-10 inline-block text-sm text-ember-500 hover:underline">
        ← Home
      </Link>
    </div>
  );
}
