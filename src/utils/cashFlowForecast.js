import { detectRecurringExpenses, detectRecurringIncome } from './recurringExpenses';

const DAY_MS = 1000 * 60 * 60 * 24;
const toISODate = (date) => date.toISOString().split('T')[0];

// Average daily "everything else" spend: total expenses over the last 90
// days, minus whatever is already explained by detected recurring bills
// (so a subscription isn't counted twice - once as a scheduled item, once
// smeared into the daily average).
const estimateDailyDiscretionarySpend = (transactions, recurringExpenses, asOf) => {
  const windowStart = new Date(asOf.getTime() - 90 * DAY_MS);
  const recentExpenses = (transactions || []).filter((t) => {
    if (t.type !== 'expense') return false;
    const d = new Date(t.date);
    return d >= windowStart && d <= asOf;
  });
  const totalRecent = recentExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const recurringContribution = recurringExpenses.reduce((sum, item) => sum + item.monthlyEquivalent * 3, 0);

  const discretionaryTotal = Math.max(0, totalRecent - recurringContribution);
  return discretionaryTotal / 90;
};

// Returns every date within [windowStart, windowEnd] that a recurring item
// (income or expense) is expected to land on, starting from its own
// nextExpectedDate and repeating every avgIntervalDays after that.
const scheduledOccurrences = (item, windowStart, windowEnd) => {
  const dates = [];
  let occurrence = new Date(item.nextExpectedDate);
  // Recurring items detected from history can have a next-expected date
  // that's already slightly in the past relative to "today" - fast-forward
  // to the first occurrence inside the forecast window.
  while (occurrence < windowStart) {
    occurrence = new Date(occurrence.getTime() + item.avgIntervalDays * DAY_MS);
  }
  while (occurrence <= windowEnd) {
    dates.push(toISODate(occurrence));
    occurrence = new Date(occurrence.getTime() + item.avgIntervalDays * DAY_MS);
  }
  return dates;
};

/**
 * Projects a starting balance forward day-by-day for `horizonDays`, using:
 * - detected recurring income (salary, etc.) landing on its expected dates
 * - detected recurring bills/subscriptions landing on their expected dates
 * - a smoothed daily estimate for everything else, from recent history
 *
 * This is a pattern-based estimate, not a guarantee - it has no idea about
 * one-off future expenses that don't yet have a history to detect from.
 */
export const generateCashFlowForecast = (transactions, currentBalance, horizonDays = 30) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowEnd = new Date(today.getTime() + horizonDays * DAY_MS);

  const recurringExpenses = detectRecurringExpenses(transactions);
  const recurringIncome = detectRecurringIncome(transactions);
  const dailyDiscretionary = estimateDailyDiscretionarySpend(transactions, recurringExpenses, today);

  // Pre-compute which recurring items land on which day, so the day loop
  // below is a simple lookup rather than re-scanning every item each day.
  const incomeByDate = new Map();
  recurringIncome.forEach((item) => {
    scheduledOccurrences(item, today, windowEnd).forEach((date) => {
      if (!incomeByDate.has(date)) incomeByDate.set(date, []);
      incomeByDate.get(date).push(item);
    });
  });

  const expensesByDate = new Map();
  recurringExpenses.forEach((item) => {
    scheduledOccurrences(item, today, windowEnd).forEach((date) => {
      if (!expensesByDate.has(date)) expensesByDate.set(date, []);
      expensesByDate.get(date).push(item);
    });
  });

  const points = [{ date: toISODate(today), balance: currentBalance, events: [] }];
  let runningBalance = currentBalance;

  for (let i = 1; i <= horizonDays; i++) {
    const date = toISODate(new Date(today.getTime() + i * DAY_MS));
    const events = [];

    (incomeByDate.get(date) || []).forEach((item) => {
      runningBalance += item.avgAmount;
      events.push({ name: item.name, amount: item.avgAmount, type: 'income' });
    });
    (expensesByDate.get(date) || []).forEach((item) => {
      runningBalance -= item.avgAmount;
      events.push({ name: item.name, amount: item.avgAmount, type: 'expense' });
    });

    runningBalance -= dailyDiscretionary;

    points.push({ date, balance: runningBalance, events });
  }

  const upcomingEvents = points
    .flatMap((p) => p.events.map((e) => ({ ...e, date: p.date })))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return { points, dailyDiscretionary, upcomingEvents };
};
