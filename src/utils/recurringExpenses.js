// Groups expense transactions by description and looks for a regular
// repeating cadence (monthly/quarterly/yearly) in the gaps between them.
// Purely a pattern-detection heuristic over data that already exists -
// no new schema required.

const DAY_MS = 1000 * 60 * 60 * 24;

const CADENCE_RULES = [
  { key: 'monthly', minDays: 25, maxDays: 35, maxStdDev: 10, divisor: 1 },
  { key: 'quarterly', minDays: 80, maxDays: 100, maxStdDev: 15, divisor: 3 },
  { key: 'yearly', minDays: 340, maxDays: 390, maxStdDev: 30, divisor: 12 }
];

const average = (values) => values.reduce((sum, v) => sum + v, 0) / values.length;

const detectCadence = (intervals) => {
  const avgInterval = average(intervals);
  const variance = average(intervals.map((v) => (v - avgInterval) ** 2));
  const stdDev = Math.sqrt(variance);

  return CADENCE_RULES.find(
    (rule) => avgInterval >= rule.minDays && avgInterval <= rule.maxDays && stdDev <= rule.maxStdDev
  );
};

const detectRecurringTransactions = (transactions, type) => {
  const groups = new Map();

  (transactions || [])
    .filter((t) => t.type === type && t.description?.trim())
    .forEach((t) => {
      const key = t.description.trim().toLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    });

  const results = [];

  groups.forEach((txns) => {
    if (txns.length < 2) return; // need at least two data points to see a pattern

    const sorted = [...txns].sort((a, b) => new Date(a.date) - new Date(b.date));
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((new Date(sorted[i].date) - new Date(sorted[i - 1].date)) / DAY_MS);
    }

    const cadenceRule = detectCadence(intervals);
    if (!cadenceRule) return; // irregular spacing - not a subscription-like pattern

    const avgIntervalDays = average(intervals);
    const amounts = sorted.map((t) => Number(t.amount) || 0);
    const avgAmount = average(amounts);
    const lastTxn = sorted[sorted.length - 1];

    const nextExpectedDate = new Date(lastTxn.date);
    nextExpectedDate.setDate(nextExpectedDate.getDate() + Math.round(avgIntervalDays));

    results.push({
      name: lastTxn.description,
      categoryName: lastTxn.category_name || 'Uncategorized',
      cadence: cadenceRule.key,
      occurrences: sorted.length,
      avgAmount,
      avgIntervalDays: Math.round(avgIntervalDays),
      monthlyEquivalent: avgAmount / cadenceRule.divisor,
      totalSpent: amounts.reduce((sum, v) => sum + v, 0),
      lastDate: lastTxn.date,
      nextExpectedDate: nextExpectedDate.toISOString().split('T')[0]
    });
  });

  return results.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);
};

export const detectRecurringExpenses = (transactions) => detectRecurringTransactions(transactions, 'expense');

export const detectRecurringIncome = (transactions) => detectRecurringTransactions(transactions, 'income');
