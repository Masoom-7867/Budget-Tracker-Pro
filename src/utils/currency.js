/**
 * Shared currency formatter used across the whole app.
 * Centralized here so the currency only ever needs to change in one place.
 */
export const formatCurrency = (amount, options = {}) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
};
