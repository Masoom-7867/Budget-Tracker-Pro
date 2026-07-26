import React, { useState, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS_PER_WINDOW = 6;
const CURRENT_YEAR = new Date().getFullYear();

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

const CashFlowReport = ({ transactions }) => {
  const [granularity, setGranularity] = useState('monthly'); // 'monthly' | 'annual'
  const [year, setYear] = useState(CURRENT_YEAR);
  const [windowEndYear, setWindowEndYear] = useState(CURRENT_YEAR);

  const monthlyData = useMemo(() => {
    const months = MONTH_LABELS.map((label) => ({ period: label, income: 0, expenses: 0, net: 0 }));
    (transactions || []).forEach((t) => {
      const date = new Date(t.date);
      if (date.getFullYear() !== year) return;
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') months[date.getMonth()].income += amount;
      else months[date.getMonth()].expenses += amount;
    });
    months.forEach((m) => { m.net = m.income - m.expenses; });
    return months;
  }, [transactions, year]);

  const annualData = useMemo(() => {
    const startYear = windowEndYear - YEARS_PER_WINDOW + 1;
    const years = Array.from({ length: YEARS_PER_WINDOW }, (_, i) => startYear + i);
    const byYear = new Map(years.map((y) => [y, { period: String(y), income: 0, expenses: 0, net: 0 }]));

    (transactions || []).forEach((t) => {
      const y = new Date(t.date).getFullYear();
      if (!byYear.has(y)) return;
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') byYear.get(y).income += amount;
      else byYear.get(y).expenses += amount;
    });

    const result = Array.from(byYear.values());
    result.forEach((r) => { r.net = r.income - r.expenses; });
    return result;
  }, [transactions, windowEndYear]);

  const data = granularity === 'monthly' ? monthlyData : annualData;
  const oldestTransactionYear = useMemo(() => {
    if (!transactions?.length) return CURRENT_YEAR;
    return transactions.reduce((min, t) => {
      const y = new Date(t.date).getFullYear();
      return y < min ? y : min;
    }, CURRENT_YEAR);
  }, [transactions]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Income vs. Expense (Cash Flow)</h3>
          <p className="text-xs text-muted-foreground">Net surplus or deficit over time</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setGranularity('monthly')}
              className={`px-3 py-1.5 text-xs font-medium ${granularity === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setGranularity('annual')}
              className={`px-3 py-1.5 text-xs font-medium ${granularity === 'annual' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'}`}
            >
              Annual
            </button>
          </div>

          {granularity === 'monthly' ? (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)} disabled={year <= oldestTransactionYear} aria-label="Previous year">
                <Icon name="ChevronLeft" size={18} />
              </Button>
              <span className="font-medium text-foreground w-14 text-center">{year}</span>
              <Button variant="ghost" size="icon" onClick={() => setYear((y) => y + 1)} disabled={year >= CURRENT_YEAR} aria-label="Next year">
                <Icon name="ChevronRight" size={18} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setWindowEndYear((y) => y - YEARS_PER_WINDOW)} aria-label="Previous years">
                <Icon name="ChevronLeft" size={18} />
              </Button>
              <span className="font-medium text-foreground w-28 text-center text-sm">
                {windowEndYear - YEARS_PER_WINDOW + 1}–{windowEndYear}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWindowEndYear((y) => y + YEARS_PER_WINDOW)}
                disabled={windowEndYear >= CURRENT_YEAR}
                aria-label="Next years"
              >
                <Icon name="ChevronRight" size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="period" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              width={90}
              tickFormatter={(v) => formatCurrency(v, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--color-error)" radius={[3, 3, 0, 0]} />
            <Line dataKey="net" name="Net" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowReport;
