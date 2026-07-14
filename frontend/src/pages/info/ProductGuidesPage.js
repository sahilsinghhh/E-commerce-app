import React from 'react';
import InfoPageLayout from '../../components/layout/InfoPageLayout';

const ProductGuidesPage = () => {
return (
<InfoPageLayout title="Product Guides" lastUpdated="July 14, 2026" >
<div className="space-y-8 font-sans">
{/* Finding Product Information */}
<section className="animate-fade-up rounded-2xl border border-ink-100 bg-white p-6 shadow-premium">
<h2 className="mb-3 font-display text-2xl font-semibold text-ink-900">
Finding Product Information
</h2>

      <p className="text-base leading-7 text-ink-500">
        Detailed product information is available directly on each product
        page, making it easy to find accurate and relevant details for the
        item you are viewing. This may include product features,
        specifications, dimensions, compatibility, usage information, and
        other important details provided by the seller or manufacturer.
      </p>
    </section>

    {/* Product Manuals & Documentation */}
    <section className="animate-fade-up rounded-2xl border border-ink-100 bg-ink-50 p-6">
      <h2 className="mb-3 font-display text-2xl font-semibold text-ink-900">
        Product Manuals & Documentation
      </h2>

      <p className="text-base leading-7 text-ink-500">
        For eligible products such as electronics, appliances, and other
        technical items, you may find user manuals, installation
        instructions, setup requirements, safety information, and warranty
        details on the product page or included with the product packaging.
      </p>
    </section>

    {/* Buying Guides */}
    <section className="animate-fade-up rounded-2xl border border-brand-400/30 bg-brand-400/5 p-6 shadow-glow">
      <h2 className="mb-3 font-display text-2xl font-semibold text-ink-900">
        Buying Guides & Product Selection
      </h2>

      <p className="text-base leading-7 text-ink-500">
        ShopHub provides product descriptions, specifications, customer
        reviews, ratings, and comparison information to help you make an
        informed purchase decision. Always review the complete product
        details and compatibility requirements before placing your order.
      </p>
    </section>

    {/* Quick Tip */}
    <div className="rounded-xl border border-aurora-400/30 bg-aurora-400/10 p-5">
      <p className="text-sm leading-6 text-ink-700">
        <span className="font-semibold text-aurora-500">
          Quick Tip:
        </span>{' '}
        Check the product description, specifications, warranty information,
        and customer reviews before purchasing to make sure the product
        meets your requirements.
      </p>
    </div>
  </div>
</InfoPageLayout>

);
};

export default ProductGuidesPage;