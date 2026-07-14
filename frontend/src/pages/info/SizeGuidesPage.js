import React from "react";
import InfoPageLayout from "../../components/layout/InfoPageLayout";

const SizeGuidesPage = () => {
  return (
    <InfoPageLayout title="Size Guides" lastUpdated="July 14, 2026">
      {" "}
      <div className="space-y-6 font-sans">
        {" "}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-premium">
          {" "}
          <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
            Find the Right Size{" "}
          </h2>{" "}
          <p className="leading-7 text-ink-500">
            Size guides are available directly on eligible product pages, as
            sizing may vary by brand, category, and product.{" "}
          </p>{" "}
        </section>
        <section className="rounded-2xl border border-brand-400/30 bg-brand-400/5 p-6">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
            How to Find the Size Chart
          </h2>
          <p className="leading-7 text-ink-500">
            For apparel and footwear, look for the{" "}
            <span className="font-semibold text-brand-600">Size Chart</span>{" "}
            option near the size selection. Review the product-specific
            measurements before choosing your size.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
};

export default SizeGuidesPage;
