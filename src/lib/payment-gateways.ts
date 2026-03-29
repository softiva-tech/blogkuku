import type { SiteSettings } from "@prisma/client";

/** Admin toggles — map to labels for checkout UI copy. */
export function enabledPaymentGatewayLabels(s: SiteSettings): string[] {
  const pairs: [boolean, string][] = [
    [s.paymentStripeEnabled, "Stripe"],
    [s.paymentRazorpayEnabled, "Razorpay"],
    [s.paymentGooglePayEnabled, "Google Pay"],
    [s.paymentPaytmEnabled, "Paytm"],
    [s.paymentPayPhoneEnabled, "PayPhone"],
    [s.paymentPayPalEnabled, "PayPal"],
  ];
  return pairs.filter(([on]) => on).map(([, label]) => label);
}

export const PAYMENT_GATEWAY_ENV_HINTS: Record<
  | "stripe"
  | "razorpay"
  | "googlePay"
  | "paytm"
  | "payPhone"
  | "payPal",
  string
> = {
  stripe: "STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  razorpay: "RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET",
  googlePay: "Google Pay / Google Pay for Business (merchant config + gateway credentials)",
  paytm: "PAYTM_MERCHANT_ID, PAYTM_MERCHANT_KEY",
  payPhone: "PAYPHONE_MERCHANT_ID / provider API keys (per your processor)",
  payPal: "PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET",
};
