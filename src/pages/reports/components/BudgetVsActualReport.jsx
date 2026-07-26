import React, { useMemo } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';

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

const BudgetVsActualReport = ({ budgetGoals }) => {
  const data = useMemo(() => {
    return (budgetGoals || []).map((goal) => ({
      name: goal.categories?.name || goal.name,
      budgeted: Number(goal.budgeted_amount) || 0,
      actual: Number(goal.spent_amount) || 0,
      overBudget: (Number(goal.spent_amount) || 0) > (Number(goal.budgeted_amount) || 0)
    }));
  }, [budgetGoals]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-foreground">Budget vs Actual</h3>
          <p className="text-xs text-muted-foreground">Variance by category this month</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-error inline-block" /> Over budget</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> Under budget</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-56">
          <div className="text-center">
            <Icon name="Scale" size={40} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No budget goals set up yet.</p>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: Math.max(280, data.length * 50) }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                type="number"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(v) => formatCurrency(v, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              />
              <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="budgeted" name="Budgeted" fill="var(--color-muted-foreground)" opacity={0.4} radius={[0, 3, 3, 0]} />
              <Bar dataKey="actual" name="Actual" radius={[0, 3, 3, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.overBudget ? 'var(--color-error)' : 'var(--color-success)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default BudgetVsActualReport;
