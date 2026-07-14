import React from "react";
import InfoPageLayout from "../../components/layout/InfoPageLayout";

const shippingFeatures = [
  {
    number: "01",
    title: "Track Your Order",
    description:
      "Follow your order from confirmation to delivery. Visit the Orders section of your account to view the latest shipment status and estimated delivery date.",
  },
  {
    number: "02",
    title: "Manage Your Delivery",
    description:
      "For eligible orders, you may be able to update the delivery address or manage delivery preferences before the order is dispatched.",
  },
  {
    number: "03",
    title: "Delivery Updates",
    description:
      "We may send important order and delivery updates through your registered email address, mobile number, or ShopHub account.",
  },
];

const ShippingPolicyPage = () => {
  return (
    <InfoPageLayout title="Shipping Policy" lastUpdated="July 14, 2026">
      {" "}
      <div className="space-y-12 font-sans">
        {/* Intro Banner */}{" "}
        <section className="overflow-hidden rounded-3xl border border-ink-100 bg-gradient-to-r from-ink-900 to-ink-700 p-7 text-white shadow-premium sm:p-10">
          {" "}
          <div className="max-w-3xl">
            {" "}
            <span className="mb-4 inline-flex rounded-full bg-brand-400/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
              Shipping & Delivery{" "}
            </span>
            <h2 className="mb-4 font-display text-2xl font-semibold sm:text-3xl">
              From Our Sellers to Your Doorstep
            </h2>
            <p className="leading-7 text-ink-200">
              ShopHub works with sellers and delivery partners to provide
              reliable shipping across supported locations. Delivery times,
              charges, and available shipping options may vary depending on the
              product, seller, and delivery address.
            </p>
          </div>
        </section>
        {/* Tracking & Management */}
        <section>
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Order Management
            </p>

            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900">
              Track & Manage Your Shipment
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-ink-500">
              Stay informed throughout the delivery process and manage eligible
              delivery options directly from your ShopHub account.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {shippingFeatures.map((feature) => (
              <div
                key={feature.number}
                className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:shadow-glow"
              >
                <span className="mb-6 block font-display text-4xl font-semibold text-ink-100 transition-colors group-hover:text-brand-400/30">
                  {feature.number}
                </span>

                <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
                  {feature.title}
                </h3>

                <p className="text-sm leading-7 text-ink-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        {/* Delivery Types */}
        <section className="rounded-3xl border border-ink-100 bg-ink-50 p-6 sm:p-8">
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-aurora-500">
              Delivery Options
            </p>

            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900">
              Choose the Delivery That Works for You
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6">
              <div className="mb-4 inline-flex rounded-lg bg-brand-400/10 px-3 py-1 text-xs font-semibold text-brand-600">
                STANDARD
              </div>

              <h3 className="mb-2 font-display text-lg font-semibold text-ink-900">
                Standard Delivery
              </h3>

              <p className="text-sm leading-7 text-ink-500">
                Available for eligible products across supported locations in
                India. The estimated delivery date and any applicable shipping
                charges are displayed before you place your order.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6">
              <div className="mb-4 inline-flex rounded-lg bg-aurora-400/10 px-3 py-1 text-xs font-semibold text-aurora-500">
                EXPRESS
              </div>

              <h3 className="mb-2 font-display text-lg font-semibold text-ink-900">
                ShopHub Quick
              </h3>

              <p className="text-sm leading-7 text-ink-500">
                Faster delivery may be available for selected products and
                serviceable pin codes. Availability and estimated delivery time
                will be shown during checkout when ShopHub Quick is available.
              </p>
            </div>
          </div>
        </section>
        {/* Important Note */}
        <div className="flex items-start gap-4 rounded-2xl border border-brand-400/30 bg-brand-400/5 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-400/15 font-semibold text-brand-600">
            i
          </div>

          <div>
            <h3 className="mb-1 font-display font-semibold text-ink-900">
              Delivery Times May Vary
            </h3>

            <p className="text-sm leading-6 text-ink-500">
              Estimated delivery dates may change due to weather conditions,
              high order volumes, public holidays, logistics disruptions, or
              other circumstances beyond our control. Check your Orders section
              for the latest delivery updates.
            </p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
};

export default ShippingPolicyPage;
