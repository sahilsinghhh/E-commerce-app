import React, { useState } from "react";
import InfoPageLayout from "../../components/layout/InfoPageLayout";

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "Go to Account > My Orders and select your order to view its current status, estimated delivery date, and tracking details.",
  },
  {
    question: "How can I cancel my order?",
    answer:
      "Go to My Orders, select the order you want to cancel, and choose the Cancel Order option. Cancellation availability depends on the order status.",
  },
  {
    question: "How do I return a product?",
    answer:
      "Go to My Orders, select the eligible product, and choose the Return or Replace option. Follow the instructions to complete your request.",
  },
  {
    question: "When will I receive my refund?",
    answer:
      "Once your refund is approved, it is usually processed within 5–10 business days. The actual time may vary depending on your bank or payment provider.",
  },
  {
    question: "What payment methods does ShopHub accept?",
    answer:
      "ShopHub supports eligible credit cards, debit cards, UPI, net banking, digital wallets, and Cash on Delivery.",
  },
  {
    question: "Can I change my delivery address after placing an order?",
    answer:
      "You may be able to update the delivery address before the order is dispatched. Check your order details to see whether this option is available.",
  },
  {
    question: "How can I contact ShopHub Customer Support?",
    answer:
      "Go to Account > Help Center and select the issue you need help with. Available support options may include self-service assistance, chat, or a callback.",
  },
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <InfoPageLayout
      title="Frequently Asked Questions"
      lastUpdated="July 14, 2026"
    >
      {" "}
      <div className="space-y-3 font-sans">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-brand-400/40 bg-brand-400/5 shadow-glow"
                  : "border-ink-100 bg-white hover:border-brand-400/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                aria-expanded={isOpen}
              >
                <span className="font-display text-base font-semibold text-ink-900 sm:text-lg">
                  {faq.question}
                </span>

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isOpen
                      ? "rotate-45 bg-brand-500 text-white"
                      : "bg-ink-50 text-ink-700"
                  }`}
                >
                  +
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 leading-7 text-ink-500 sm:px-6 sm:pb-6">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </InfoPageLayout>
  );
};

export default FaqPage;
