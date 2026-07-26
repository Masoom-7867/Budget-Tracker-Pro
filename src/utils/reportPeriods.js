const pad = (n) => String(n).padStart(2, '0');

// Occurrences per year for each budget_goals.period value, used to convert
// a goal's per-period budgeted amount into an annual figure.
export const PERIOD_OCCURRENCES_PER_YEAR = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  yearly: 1
};

export const getMonthRange = (month, year) => {
  const dateFrom = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const dateTo = `${year}-${pad(month)}-${pad(lastDay)}`;
  return { dateFrom, dateTo };
};

export const getYearRange = (year) => ({
  dateFrom: `${year}-01-01`,
  dateTo: `${year}-12-31`
});

export const getPeriodRange = (viewMode, month, year) =>
  viewMode === 'monthly' ? getMonthRange(month, year) : getYearRange(year);

export const formatPeriodLabel = (viewMode, month, year) => {
  if (viewMode === 'monthly') {
    return new Date(year, month - 1, 1).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  }
  return String(year);
};

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
