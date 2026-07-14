import React from "react";
import InfoPageLayout from "../../components/layout/InfoPageLayout";

const WarrantyPage = () => {
  return (
    <InfoPageLayout title="Warranty Information" lastUpdated="July 14, 2026">
      {" "}
      <div className="space-y-6 font-sans">
        {" "}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-premium">
          {" "}
          <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
            Manufacturer Warranty{" "}
          </h2>{" "}
          <p className="leading-7 text-ink-500">
            Eligible branded products, including electronics and appliances, may
            be covered by the manufacturer's warranty. After the ShopHub return
            period ends, warranty claims may need to be handled through the
            brand's authorized service center.{" "}
          </p>{" "}
        </section>
        <section className="rounded-2xl border border-brand-400/30 bg-brand-400/5 p-6">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
            Extended Warranty & Protection Plans
          </h2>
          <p className="leading-7 text-ink-500">
            Eligible products may offer optional protection plans with benefits
            such as extended coverage, cashless repairs, and doorstep service.
            Coverage varies by product and selected plan.
          </p>
        </section>
        <section className="rounded-2xl border border-ink-100 bg-ink-50 p-6">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
            Warranty Exclusions
          </h2>
          <p className="leading-7 text-ink-500">
            Warranties may not cover accidental damage, liquid damage, misuse,
            unauthorized repairs, normal wear and tear, or cosmetic damage.
            Please review the applicable warranty terms for complete details.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
};

export default WarrantyPage;
