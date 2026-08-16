import React, { useMemo } from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';

const TOTAL_INCOME_NODE = 'Total Income';

const groupSum = (items, keyFn) => {
  const totals = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    totals.set(key, (totals.get(key) || 0) + (Number(item.amount) || 0));
  });
  return totals;
};

const CashFlowSankeyReport = ({ transactions, savingsTransactions, accounts, month, year }) => {
  const { data, totalIncome } = useMemo(() => {
    const savingsAccountId = (accounts || []).find((a) => a.type === 'savings')?.id;

    const monthTxns = (transactions || []).filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const incomeTxns = monthTxns.filter((t) => t.type === 'income');
    // Exclude transfers to the Savings account here - they're represented
    // via the dedicated savings_transactions flow below instead, so
    // counting them here too would double the flow out of income.
    const expenseTxns = monthTxns.filter((t) => t.type === 'expense' && t.account_id !== savingsAccountId);

    const incomeByCategory = groupSum(incomeTxns, (t) => t.category_name || 'Other Income');
    const expenseByCategory = groupSum(expenseTxns, (t) => t.category_name || 'Uncategorized');

    const totalIncomeValue = Array.from(incomeByCategory.values()).reduce((s, v) => s + v, 0);
    const totalExpensesValue = Array.from(expenseByCategory.values()).reduce((s, v) => s + v, 0);

    const monthSavings = (savingsTransactions || []).filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    const savingsNet = monthSavings.reduce((sum, t) => {
      const amount = Number(t.amount) || 0;
      return t.type === 'deposit' ? sum + amount : sum - amount;
    }, 0);
    const savingsFlow = Math.max(0, savingsNet);

    const unallocated = Math.max(0, totalIncomeValue - totalExpensesValue - savingsFlow);

    const nodeNames = [];
    const nodeIndex = (name) => {
      let idx = nodeNames.indexOf(name);
      if (idx === -1) {
        nodeNames.push(name);
        idx = nodeNames.length - 1;
      }
      return idx;
    };

    const links = [];

    incomeByCategory.forEach((value, name) => {
      if (value <= 0) return;
      links.push({ source: nodeIndex(name), target: nodeIndex(TOTAL_INCOME_NODE), value });
    });

    expenseByCategory.forEach((value, name) => {
      if (value <= 0) return;
      links.push({ source: nodeIndex(TOTAL_INCOME_NODE), target: nodeIndex(name), value });
    });

    if (savingsFlow > 0) {
      links.push({ source: nodeIndex(TOTAL_INCOME_NODE), target: nodeIndex('Savings'), value: savingsFlow });
    }
    if (unallocated > 0) {
      links.push({ source: nodeIndex(TOTAL_INCOME_NODE), target: nodeIndex('Unallocated'), value: unallocated });
    }

    return {
      data: { nodes: nodeNames.map((name) => ({ name })), links },
      totalIncome: totalIncomeValue
    };
  }, [transactions, savingsTransactions, accounts, month, year]);

  const hasData = totalIncome > 0 && data.links.length > 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Cash Flow Visualizer</h3>
        <p className="text-xs text-muted-foreground">
          Where this month's income came from, and where it went - categories and savings
        </p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-56">
          <div className="text-center">
            <Icon name="Waves" size={40} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No income recorded for this month yet.</p>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer>
            <Sankey
              data={data}
              nodePadding={24}
              margin={{ top: 10, right: 100, bottom: 10, left: 100 }}
              node={{ stroke: 'var(--color-border)', strokeWidth: 1, fill: 'var(--color-primary)' }}
              link={{ stroke: 'var(--color-primary)', strokeOpacity: 0.25 }}
            >
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </Sankey>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CashFlowSankeyReport;
