import React from "react";
import InfoPageLayout from "../../components/layout/InfoPageLayout";

const RefundPolicyPage = () => {
  return (
    <InfoPageLayout title="Refund Policy" lastUpdated="July 14, 2026">
      {" "}
      <div className="space-y-10 font-sans">
        {/* Intro */}{" "}
        <div className="relative overflow-hidden rounded-3xl border border-brand-400/30 bg-gradient-to-br from-brand-400/10 via-white to-aurora-400/10 p-6 sm:p-8">
          {" "}
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="relative">
            <span className="mb-4 inline-flex rounded-full bg-brand-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
              Refund Information
            </span>

            <h2 className="mb-3 font-display text-2xl font-semibold text-ink-900">
              Simple and Transparent Refunds
            </h2>

            <p className="max-w-3xl text-base leading-7 text-ink-500">
              Refund eligibility depends on the product category, the reason for
              the return, and the applicable return or replacement policy. We
              recommend reviewing the return details shown on the product page
              before placing your order.
            </p>
          </div>
        </div>
        {/* Refund Categories */}
        <section>
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-600">
              Eligibility
            </p>

            <h2 className="font-display text-2xl font-semibold text-ink-900">
              Refund Guidelines by Product Category
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Electronics */}
            <div className="group rounded-2xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:shadow-glow">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400/10 text-xl">
                📱
              </div>

              <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
                Electronics & Mobiles
              </h3>

              <p className="text-sm leading-7 text-ink-500">
                Eligible electronics and mobile devices may be covered under a
                replacement policy. A refund may be issued when a replacement
                cannot be provided or when the product qualifies for a refund
                under the applicable return policy.
              </p>
            </div>

            {/* General Merchandise */}
            <div className="group rounded-2xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-aurora-400/40 hover:shadow-premium">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-aurora-400/10 text-xl">
                🛍️
              </div>

              <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
                Lifestyle, Books & General Merchandise
              </h3>

              <p className="text-sm leading-7 text-ink-500">
                Eligible products may be returned within the return window shown
                on the product page. A refund can be processed after the item
                successfully passes the required return verification.
              </p>
            </div>
          </div>
        </section>
        {/* Refund Conditions */}
        <section className="rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-400">
              Before You Return
            </p>

            <h2 className="font-display text-2xl font-semibold">
              Conditions for Processing a Refund
            </h2>
          </div>

          <p className="mb-6 max-w-3xl leading-7 text-ink-200">
            Before a refund is approved, the returned product may be inspected
            to confirm that it meets the applicable return conditions.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Product should be unused and undamaged",
              "Original packaging should be retained",
              "Tags, accessories, and freebies must be included",
              "Electronic devices should be unlocked and reset",
            ].map((condition) => (
              <div
                key={condition}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aurora-400/20 text-sm text-aurora-400">
                  ✓
                </span>

                <p className="text-sm leading-6 text-ink-100">{condition}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Important Note */}
        <div className="flex items-start gap-4 rounded-2xl border border-brand-400/30 bg-brand-400/5 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-400/15 font-semibold text-brand-600">
            i
          </div>

          <div>
            <h3 className="mb-1 font-display font-semibold text-ink-900">
              Important to Know
            </h3>

            <p className="text-sm leading-6 text-ink-500">
              Return windows and refund eligibility may vary by product, seller,
              and category. Always check the return policy displayed on the
              product page or in your order details for the most relevant
              information.
            </p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
};

export default RefundPolicyPage;
