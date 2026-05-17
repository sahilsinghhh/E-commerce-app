/**
 * Formats a numeric price into INR currency format (e.g. ₹1,50,000.00)
 * @param {number|string} price - The price value to format
 * @returns {string} The formatted price string
 */
export const formatPrice = (price) => {
  const numericPrice = Number(price) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
};
