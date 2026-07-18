// Fixed 50/30/20 split - by user's choice this is not editable per month.
export const BUCKET_CONFIG = {
  needs: { label: '50% Needs', percentage: 0.5 },
  wants: { label: '30% Wants', percentage: 0.3 },
  debt_savings: { label: '20% Debt Repayment', percentage: 0.2 }
};

export const BUCKET_ORDER = ['needs', 'wants', 'debt_savings'];

export const getBucketAllocation = (monthlyIncome, bucket) => {
  const income = Number(monthlyIncome) || 0;
  return income * BUCKET_CONFIG[bucket].percentage;
};

/**
 * Find the transaction(s) that most likely correspond to a planned line
 * item, so we can show "date paid" and whether it's on track - without
 * requiring the user to manually link every bill to a transaction.
 *
 * Matches by category first (if the line item has one set), and falls
 * back to a loose name match against the transaction description.
 */
export const matchTransactionsForLineItem = (lineItem, transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  const nameLower = lineItem.name?.trim().toLowerCase();

  return transactions.filter((txn) => {
    if (txn.type !== 'expense') return false;

    if (lineItem.category_id && txn.category_id === lineItem.category_id) {
      return true;
    }

    const descLower = txn.description?.trim().toLowerCase() || '';
    if (!nameLower || !descLower) return false;
    return descLower.includes(nameLower) || nameLower.includes(descLower);
  });
};

/**
 * Given a line item and the month's transactions, work out:
 * - paidAmount: total actually spent against this line item this month
 * - datePaid: the most recent matching transaction's date (or null)
 * - status: 'paid' | 'over' | 'pending'
 */
export const getLineItemStatus = (lineItem, transactions) => {
  const matches = matchTransactionsForLineItem(lineItem, transactions);
  const paidAmount = matches.reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0);
  const datePaid = matches.length
    ? matches.reduce((latest, txn) => (txn.date > latest ? txn.date : latest), matches[0].date)
    : null;

  const plannedAmount = Number(lineItem.planned_amount) || 0;

  let status = 'pending';
  if (matches.length > 0) {
    // Small tolerance so rounding differences don't flag as "over"
    status = paidAmount > plannedAmount * 1.05 ? 'over' : 'paid';
  }

  return { paidAmount, datePaid, status };
};

export const formatMonthYear = (month, year) => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
};
