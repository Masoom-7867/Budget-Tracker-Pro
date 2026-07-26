import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';

// A distinct, readable palette cycled across however many categories exist
const COLORS = [
  '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5'
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-foreground">{entry.name}</p>
      <p className="text-muted-foreground">{formatCurrency(entry.value)}</p>
    </div>
  );
};

const CategoryBreakdownReport = ({ transactions, month, year }) => {
  const data = useMemo(() => {
    const totals = new Map();

    (transactions || []).forEach((t) => {
      if (t.type !== 'expense') return;
      const date = new Date(t.date);
      if (date.getMonth() + 1 !== month || date.getFullYear() !== year) return;

      const name = t.category_name || 'Uncategorized';
      totals.set(name, (totals.get(name) || 0) + (Number(t.amount) || 0));
    });

    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, month, year]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Category Breakdown</h3>
        <p className="text-xs text-muted-foreground">Spending distribution across categories this month</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-56">
          <div className="text-center">
            <Icon name="PieChart" size={40} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No expenses recorded for this month.</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {data.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-foreground">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{formatCurrency(entry.value)}</span>
                  <span className="w-12 text-right">{total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryBreakdownReport;
