import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const NetWorthTrendReport = ({ snapshots }) => {
  const data = useMemo(() => {
    const totalsByPeriod = new Map(); // "year-month" -> total

    (snapshots || []).forEach((s) => {
      const key = `${s.year}-${String(s.month).padStart(2, '0')}`;
      totalsByPeriod.set(key, (totalsByPeriod.get(key) || 0) + (Number(s.balance) || 0));
    });

    return Array.from(totalsByPeriod.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, total]) => {
        const [year, month] = key.split('-').map(Number);
        return { period: `${MONTH_LABELS[month - 1]} ${year}`, total };
      });
  }, [snapshots]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Net Worth Trend</h3>
        <p className="text-xs text-muted-foreground">
          Total across your bank, cash, and savings accounts.
          {data.length <= 1 && ' Tracking starts this month - check back next month to see the trend build up.'}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-56">
          <div className="text-center">
            <Icon name="TrendingUp" size={40} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No balance history yet.</p>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="period" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                width={90}
                tickFormatter={(v) => formatCurrency(v, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line dataKey="total" name="Net Worth" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default NetWorthTrendReport;
