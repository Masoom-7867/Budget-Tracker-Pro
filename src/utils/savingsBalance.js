// Single source of truth for the Savings account balance: derived from
// savings_transactions, never stored as its own column, so it can never
// drift out of sync with what the Savings Tracker page shows.
export const calculateSavingsBalance = (savingsTransactions) => {
  return (savingsTransactions || []).reduce((balance, transaction) => {
    const amount = parseFloat(transaction.amount) || 0;
    return transaction.type === 'deposit' ? balance + amount : balance - amount;
  }, 0);
};
