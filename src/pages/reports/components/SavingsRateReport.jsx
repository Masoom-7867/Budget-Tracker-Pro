import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear();

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-primary">Savings Rate: {point.rate === null ? 'No income' : `${point.rate.toFixed(1)}%`}</p>
    </div>
  );
};

const SavingsRateReport = ({ transactions }) => {
  const [year, setYear] = useState(CURRENT_YEAR);

  const oldestTransactionYear = useMemo(() => {
    if (!transactions?.length) return CURRENT_YEAR;
    return transactions.reduce((min, t) => {
      const y = new Date(t.date).getFullYear();
      return y < min ? y : min;
    }, CURRENT_YEAR);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = MONTH_LABELS.map((label) => ({ month: label, income: 0, expenses: 0, rate: null }));
    (transactions || []).forEach((t) => {
      const date = new Date(t.date);
      if (date.getFullYear() !== year) return;
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') months[date.getMonth()].income += amount;
      else months[date.getMonth()].expenses += amount;
    });
    months.forEach((m) => {
      m.rate = m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : null;
    });
    return months;
  }, [transactions, year]);

  const monthsWithIncome = monthlyData.filter((m) => m.rate !== null);
  const averageRate = monthsWithIncome.length
    ? monthsWithIncome.reduce((sum, m) => sum + m.rate, 0) / monthsWithIncome.length
    : null;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Savings Rate Tracker</h3>
          <p className="text-xs text-muted-foreground">
            (Income − Expenses) ÷ Income, per month
            {averageRate !== null && ` · Average this year: ${averageRate.toFixed(1)}%`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)} disabled={year <= oldestTransactionYear} aria-label="Previous year">
            <Icon name="ChevronLeft" size={18} />
          </Button>
          <span className="font-medium text-foreground w-14 text-center">{year}</span>
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y + 1)} disabled={year >= CURRENT_YEAR} aria-label="Next year">
            <Icon name="ChevronRight" size={18} />
          </Button>
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              width={50}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="var(--color-border)" />
            {averageRate !== null && (
              <ReferenceLine
                y={averageRate}
                stroke="var(--color-muted-foreground)"
                strokeDasharray="4 4"
                label={{ value: 'Avg', position: 'right', fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              />
            )}
            <Line
              dataKey="rate"
              name="Savings Rate"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SavingsRateReport;
