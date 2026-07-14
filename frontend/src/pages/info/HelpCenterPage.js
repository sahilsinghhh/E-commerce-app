import React from "react";
import InfoPageLayout from "../../components/layout/InfoPageLayout";

const HelpCenterPage = () => {
  return (
    <InfoPageLayout title="Help Center" lastUpdated="July 14, 2026">
      {" "}
      <div className="space-y-8 font-sans">
        {/* Accessing Support */}{" "}
        <section className="animate-fade-up rounded-2xl border border-ink-100 bg-white p-6 shadow-premium">
          {" "}
          <h2 className="mb-3 font-display text-2xl font-semibold text-ink-900">
            Accessing Support{" "}
          </h2>
          <p className="text-base leading-7 text-ink-500">
            ShopHub offers 24x7 customer support and self-service assistance.
            You can access the Help Center anytime by going to{" "}
            <span className="font-semibold text-brand-600">
              Account &gt; Help Center
            </span>{" "}
            on the ShopHub app or website.
          </p>
        </section>
        {/* Self-Service FAQs */}
        <section className="animate-fade-up rounded-2xl border border-ink-100 bg-ink-50 p-6">
          <h2 className="mb-3 font-display text-2xl font-semibold text-ink-900">
            Self-Service FAQs
          </h2>

          <p className="text-base leading-7 text-ink-500">
            The Help Center provides quick answers to common questions related
            to order tracking, cancellations, returns, refunds, ShopHub Plus,
            payments, and other account-related issues.
          </p>
        </section>
        {/* Contacting Support */}
        <section className="animate-fade-up rounded-2xl border border-brand-400/30 bg-brand-400/5 p-6 shadow-glow">
          <h2 className="mb-3 font-display text-2xl font-semibold text-ink-900">
            Contacting a Customer Support Representative
          </h2>

          <p className="text-base leading-7 text-ink-500">
            If the self-service options do not resolve your issue, navigate to
            the relevant order and select the{" "}
            <span className="font-semibold text-brand-600">
              &quot;Need Help?&quot;
            </span>{" "}
            option. You can then request a callback or start a chat with a
            customer support representative, depending on availability.
          </p>
        </section>
        {/* Quick Tip */}
        <div className="rounded-xl border border-aurora-400/30 bg-aurora-400/10 p-5">
          <p className="text-sm leading-6 text-ink-700">
            <span className="font-semibold text-aurora-500">Quick Tip:</span>{" "}
            Keep your order ID and registered account details ready when
            contacting customer support to help us assist you faster.
          </p>
        </div>
      </div>
    </InfoPageLayout>
  );
};

export default HelpCenterPage;
