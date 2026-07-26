import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const Y_AXIS_STEP = 5000;

const roundUpToStep = (value) => Math.ceil(value / Y_AXIS_STEP) * Y_AXIS_STEP;
const roundDownToStep = (value) => Math.floor(value / Y_AXIS_STEP) * Y_AXIS_STEP;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

const AccountActivityChart = ({ account, transactions }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const accountTransactions = useMemo(
    () => (transactions || []).filter((t) => t.account_id === account.id),
    [transactions, account.id]
  );

  const earliestYear = useMemo(() => {
    if (accountTransactions.length === 0) return year;
    return accountTransactions.reduce((min, t) => {
      const y = new Date(t.date).getFullYear();
      return y < min ? y : min;
    }, year);
  }, [accountTransactions, year]);

  const monthlyData = useMemo(() => {
    const months = MONTH_LABELS.map((label) => ({ month: label, moneyIn: 0, moneyOut: 0, variance: 0 }));

    accountTransactions.forEach((t) => {
      const date = new Date(t.date);
      if (date.getFullYear() !== year) return;
      const monthIndex = date.getMonth();
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') months[monthIndex].moneyIn += amount;
      else months[monthIndex].moneyOut += amount;
    });

    months.forEach((m) => { m.variance = m.moneyIn - m.moneyOut; });
    return months;
  }, [accountTransactions, year]);

  const { yMin, yMax, ticks } = useMemo(() => {
    const allValues = monthlyData.flatMap((m) => [m.moneyIn, m.moneyOut, m.variance]);
    const max = roundUpToStep(Math.max(Y_AXIS_STEP, ...allValues, 0));
    const min = roundDownToStep(Math.min(0, ...allValues));
    const tickValues = [];
    for (let v = min; v <= max; v += Y_AXIS_STEP) tickValues.push(v);
    return { yMin: min, yMax: max, ticks: tickValues };
  }, [monthlyData]);

  const hasAnyData = accountTransactions.length > 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{account.name} Activity</h3>
          <p className="text-xs text-muted-foreground">Money in, money out, and variance by month</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYear((y) => y - 1)}
            disabled={year <= earliestYear}
            aria-label="Previous year"
          >
            <Icon name="ChevronLeft" size={18} />
          </Button>
          <span className="font-medium text-foreground w-14 text-center">{year}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= new Date().getFullYear()}
            aria-label="Next year"
          >
            <Icon name="ChevronRight" size={18} />
          </Button>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="flex items-center justify-center h-56">
          <div className="text-center">
            <Icon name="BarChart3" size={40} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No transaction history yet for this account.</p>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis
                domain={[yMin, yMax]}
                ticks={ticks}
                tickFormatter={(v) => formatCurrency(v, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="moneyIn" name="Money In" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="moneyOut" name="Money Out" fill="var(--color-error)" radius={[3, 3, 0, 0]} />
              <Line dataKey="variance" name="Variance" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AccountActivityChart;
