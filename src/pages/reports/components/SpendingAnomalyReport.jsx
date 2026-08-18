import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';
import { detectCategoryAnomalies, detectTransactionAnomalies } from '../../../utils/anomalyDetection';

const SpendingAnomalyReport = ({ transactions, month, year }) => {
  const categoryAnomalies = useMemo(
    () => detectCategoryAnomalies(transactions, month, year),
    [transactions, month, year]
  );
  const transactionAnomalies = useMemo(
    () => detectTransactionAnomalies(transactions, month, year),
    [transactions, month, year]
  );

  const hasAnomalies = categoryAnomalies.length > 0 || transactionAnomalies.length > 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Spending Anomaly Detector</h3>
        <p className="text-xs text-muted-foreground">Compared against your 3-month rolling average, for the selected month</p>
      </div>

      {!hasAnomalies ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <Icon name="ShieldCheck" size={40} className="mx-auto mb-2 text-success opacity-70" />
            <p className="text-sm text-muted-foreground">Nothing unusual detected - this month looks consistent with your recent habits.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryAnomalies.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Category totals that stand out</p>
              <div className="space-y-2">
                {categoryAnomalies.map((a) => (
                  <div key={a.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Icon
                        name={a.direction === 'spike' ? 'TrendingUp' : 'TrendingDown'}
                        size={16}
                        className={a.direction === 'spike' ? 'text-error' : 'text-success'}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(a.currentTotal)} vs avg {formatCurrency(a.averageTotal)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${a.direction === 'spike' ? 'text-error' : 'text-success'}`}>
                      {a.percentDiff > 0 ? '+' : ''}{a.percentDiff.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {transactionAnomalies.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Unusually large transactions</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Description</th>
                      <th className="pb-2 font-medium">Category</th>
                      <th className="pb-2 font-medium text-right">Amount</th>
                      <th className="pb-2 font-medium text-right">Typical</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactionAnomalies.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2.5 text-muted-foreground">
                          {new Date(t.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-2.5 font-medium text-foreground">{t.description}</td>
                        <td className="py-2.5 text-muted-foreground">{t.category}</td>
                        <td className="py-2.5 text-right text-error font-medium">{formatCurrency(t.amount)}</td>
                        <td className="py-2.5 text-right text-muted-foreground">{formatCurrency(t.typicalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpendingAnomalyReport;
