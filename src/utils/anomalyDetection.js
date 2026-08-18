const average = (values) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0);
const stdDev = (values, mean) => Math.sqrt(average(values.map((v) => (v - mean) ** 2)));

// The 3 calendar months immediately before the reference month/year.
const getPriorMonths = (month, year, count = 3) => {
  const months = [];
  let m = month;
  let y = year;
  for (let i = 0; i < count; i++) {
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    months.push({ month: m, year: y });
  }
  return months;
};

const inMonth = (date, month, year) => {
  const d = new Date(date);
  return d.getMonth() + 1 === month && d.getFullYear() === year;
};

/**
 * Compares each category's spend in the reference month against its
 * average over the 3 prior months. Flags a category when the deviation is
 * both statistically notable (relative to that category's own volatility)
 * and large enough in absolute/relative terms to matter - a category that
 * always costs ~R50 jumping to R80 isn't worth flagging, even if that's a
 * big percentage change.
 */
export const detectCategoryAnomalies = (transactions, month, year) => {
  const priorMonths = getPriorMonths(month, year);
  const expenseTxns = (transactions || []).filter((t) => t.type === 'expense');

  const categories = new Set(expenseTxns.map((t) => t.category_name || 'Uncategorized'));
  const results = [];

  categories.forEach((category) => {
    const priorTotals = priorMonths.map(({ month: m, year: y }) =>
      expenseTxns
        .filter((t) => (t.category_name || 'Uncategorized') === category && inMonth(t.date, m, y))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    );

    // Need at least one prior month with actual spend to have a baseline
    if (priorTotals.every((v) => v === 0)) return;

    const avg = average(priorTotals);
    const sd = stdDev(priorTotals, avg);

    const currentTotal = expenseTxns
      .filter((t) => (t.category_name || 'Uncategorized') === category && inMonth(t.date, month, year))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const absoluteDiff = currentTotal - avg;
    const percentDiff = avg > 0 ? (absoluteDiff / avg) * 100 : 0;

    const statisticallyNotable = sd > 0 ? Math.abs(absoluteDiff) > 1.5 * sd : Math.abs(percentDiff) > 30;
    const meaningfulSize = Math.abs(absoluteDiff) > 200 || Math.abs(percentDiff) > 30;

    if (statisticallyNotable && meaningfulSize) {
      results.push({
        category,
        currentTotal,
        averageTotal: avg,
        percentDiff,
        direction: absoluteDiff > 0 ? 'spike' : 'drop'
      });
    }
  });

  return results.sort((a, b) => Math.abs(b.percentDiff) - Math.abs(a.percentDiff));
};

/**
 * Flags individual transactions in the reference month that are unusually
 * large compared to the typical transaction size in their own category,
 * based on the trailing 3 months of history for that category.
 */
export const detectTransactionAnomalies = (transactions, month, year) => {
  const priorMonths = getPriorMonths(month, year);
  const expenseTxns = (transactions || []).filter((t) => t.type === 'expense');

  const byCategory = new Map();
  expenseTxns.forEach((t) => {
    const category = t.category_name || 'Uncategorized';
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(t);
  });

  const results = [];

  byCategory.forEach((txns, category) => {
    const priorAmounts = txns
      .filter((t) => priorMonths.some(({ month: m, year: y }) => inMonth(t.date, m, y)))
      .map((t) => Number(t.amount) || 0);

    if (priorAmounts.length < 2) return; // not enough history to know what's "typical"

    const avg = average(priorAmounts);
    const sd = stdDev(priorAmounts, avg);
    if (sd === 0) return; // perfectly uniform amounts - nothing to compare against

    const currentTxns = txns.filter((t) => inMonth(t.date, month, year));

    currentTxns.forEach((t) => {
      const amount = Number(t.amount) || 0;
      if (amount > avg + 2 * sd && amount > 100) {
        results.push({
          id: t.id,
          date: t.date,
          description: t.description,
          category,
          amount,
          typicalAmount: avg
        });
      }
    });
  });

  return results.sort((a, b) => new Date(b.date) - new Date(a.date));
};
