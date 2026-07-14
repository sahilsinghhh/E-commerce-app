import React from "react";
import InfoPageLayout from "../../components/layout/InfoPageLayout";

const returnCategories = [
  {
    title: "Electronics & Mobiles",
    label: "Replacement",
    description:
      "Eligible electronics and mobile devices may come with a replacement window. Refunds may be available when a replacement cannot be provided or when permitted under the applicable return policy.",
  },
  {
    title: "Large Appliances",
    label: "Service Support",
    description:
      "Large appliances may be eligible for repair, replacement, or authorized service support depending on the product, brand, and issue reported.",
  },
  {
    title: "Lifestyle, Books & General Merchandise",
    label: "Return Eligible",
    description:
      "Eligible products may offer return, replacement, exchange, or refund options within the return window displayed on the product page.",
  },
  {
    title: "Open Box Delivery",
    label: "Check at Delivery",
    description:
      "For eligible Open Box Delivery orders, inspect the product carefully before accepting it. Claims related to visible damage, missing items, or incorrect products may not be accepted after delivery confirmation.",
  },
];

const returnConditions = [
  "The product should be unused and undamaged.",
  "The original packaging should be retained.",
  "All tags, accessories, manuals, and freebies should be included.",
  "The product should match the condition in which it was delivered.",
  "Electronic devices should be unlocked and personal accounts removed.",
  "The product may be inspected before the return is approved.",
];

const ReturnPolicyPage = () => {
  return (
    <InfoPageLayout title="Return Policy" lastUpdated="July 14, 2026">
      {" "}
      <div className="space-y-12 font-sans">
        {/* Introduction */}{" "}
        <section className="relative overflow-hidden rounded-3xl bg-ink-900 p-7 text-white sm:p-10">
          {" "}
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />{" "}
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-aurora-400/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
              Easy Returns
            </span>

            <h2 className="mb-4 font-display text-2xl font-semibold sm:text-3xl">
              Return Options Designed Around Your Purchase
            </h2>

            <p className="leading-7 text-ink-200">
              Return eligibility, available options, and return windows may vary
              depending on the product category, seller, and reason for return.
              Check the return policy shown on the product page or in your order
              details for information specific to your purchase.
            </p>
          </div>
        </section>
        {/* Category Policies */}
        <section>
          <div className="mb-7">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Category Guidelines
            </span>

            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900">
              Return Policies by Product Category
            </h2>
          </div>

          <div className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-premium">
            {returnCategories.map((category, index) => (
              <div
                key={category.title}
                className="group grid gap-4 p-6 transition-colors duration-300 hover:bg-ink-50 sm:grid-cols-[48px_1fr] sm:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-400/10 font-display text-lg font-semibold text-brand-600">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-lg font-semibold text-ink-900">
                      {category.title}
                    </h3>

                    <span className="rounded-full bg-aurora-400/10 px-3 py-1 text-xs font-semibold text-aurora-500">
                      {category.label}
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-ink-500">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Return Conditions */}
        <section>
          <div className="mb-7">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Return Checklist
            </span>

            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900">
              Conditions for a Successful Return
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-ink-500">
              To help us process your return smoothly, please make sure the
              product meets the applicable return conditions before handing it
              over for pickup.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {returnConditions.map((condition, index) => (
              <div
                key={condition}
                className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-ink-50 p-5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aurora-400/15 font-semibold text-aurora-500">
                  ✓
                </div>

                <p className="text-sm leading-6 text-ink-700">{condition}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Device Notice */}
        <section className="rounded-2xl border-l-4 border-brand-500 bg-brand-400/5 p-6">
          <h3 className="mb-2 font-display text-lg font-semibold text-ink-900">
            Returning an Electronic Device?
          </h3>

          <p className="text-sm leading-7 text-ink-500">
            Before returning a mobile phone, laptop, tablet, or other personal
            electronic device, back up your important data, remove personal
            accounts, disable screen locks and device protection features, and
            reset the device when required. ShopHub is not responsible for
            personal data left on a returned device.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
};

export default ReturnPolicyPage;
