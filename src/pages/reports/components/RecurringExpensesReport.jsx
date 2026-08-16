import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';
import { detectRecurringExpenses } from '../../../utils/recurringExpenses';

const CADENCE_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' };

const RecurringExpensesReport = ({ transactions }) => {
  const recurring = useMemo(() => detectRecurringExpenses(transactions), [transactions]);
  const totalMonthlyEquivalent = recurring.reduce((sum, r) => sum + r.monthlyEquivalent, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-foreground">Recurring Expenses &amp; Subscription Audit</h3>
          <p className="text-xs text-muted-foreground">
            Detected from your transaction history - charges that repeat on a regular schedule
          </p>
        </div>
        {recurring.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Estimated monthly cost</p>
            <p className="font-semibold text-foreground">{formatCurrency(totalMonthlyEquivalent)}</p>
          </div>
        )}
      </div>

      {recurring.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <Icon name="Repeat" size={40} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No recurring charges detected yet - this needs at least 2 similarly-timed transactions with the same description.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Cadence</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium text-right">Seen</th>
                <th className="pb-2 font-medium">Last Charged</th>
                <th className="pb-2 font-medium">Next Expected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recurring.map((item) => (
                <tr key={item.name}>
                  <td className="py-2.5 font-medium text-foreground">{item.name}</td>
                  <td className="py-2.5 text-muted-foreground">{item.categoryName}</td>
                  <td className="py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {CADENCE_LABELS[item.cadence]}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-foreground">{formatCurrency(item.avgAmount)}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{item.occurrences}x</td>
                  <td className="py-2.5 text-muted-foreground">
                    {new Date(item.lastDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 text-muted-foreground">
                    {new Date(item.nextExpectedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecurringExpensesReport;
