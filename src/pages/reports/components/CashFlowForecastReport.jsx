import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';
import { generateCashFlowForecast } from '../../../utils/cashFlowForecast';

const HORIZONS = [30, 60, 90];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm max-w-[220px]">
      <p className="font-medium text-foreground mb-1">
        {new Date(label).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
      <p className={point.balance < 0 ? 'text-error' : 'text-primary'}>{formatCurrency(point.balance)}</p>
      {point.events?.length > 0 && (
        <div className="mt-1 pt-1 border-t border-border space-y-0.5">
          {point.events.map((e, i) => (
            <p key={i} className={e.type === 'income' ? 'text-success' : 'text-error'}>
              {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)} {e.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

const CashFlowForecastReport = ({ transactions, accounts, savingsBalance }) => {
  const [horizon, setHorizon] = useState(30);

  const currentBalance = useMemo(() => {
    return (accounts || []).reduce((sum, acc) => {
      return sum + (acc.type === 'savings' ? savingsBalance : Number(acc.balance) || 0);
    }, 0);
  }, [accounts, savingsBalance]);

  const forecast = useMemo(
    () => generateCashFlowForecast(transactions, currentBalance, horizon),
    [transactions, currentBalance, horizon]
  );

  const endBalance = forecast.points[forecast.points.length - 1]?.balance ?? currentBalance;
  const dipsNegative = forecast.points.some((p) => p.balance < 0);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Cash Flow Forecast</h3>
          <p className="text-xs text-muted-foreground">
            Projected from detected recurring income/bills plus your average recent spending - an estimate, not a guarantee
          </p>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {HORIZONS.map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 text-xs font-medium ${horizon === h ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'}`}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-muted/40 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Starting Balance</p>
          <p className="font-semibold text-foreground">{formatCurrency(currentBalance)}</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Projected in {horizon} Days</p>
          <p className={`font-semibold ${endBalance < 0 ? 'text-error' : 'text-foreground'}`}>{formatCurrency(endBalance)}</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Est. Daily Other Spend</p>
          <p className="font-semibold text-foreground">{formatCurrency(forecast.dailyDiscretionary)}</p>
        </div>
      </div>

      {dipsNegative && (
        <div className="mb-4 flex items-center gap-2 bg-error/10 rounded-lg p-3">
          <Icon name="AlertTriangle" size={16} className="text-error shrink-0" />
          <p className="text-sm text-error">This forecast dips below R0 within the {horizon}-day window.</p>
        </div>
      )}

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={forecast.points} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              interval={Math.max(0, Math.floor(horizon / 8))}
              tickFormatter={(v) => new Date(v).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              width={90}
              tickFormatter={(v) => formatCurrency(v, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="var(--color-error)" strokeDasharray="4 4" />
            <Area dataKey="balance" name="Projected Balance" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {forecast.upcomingEvents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-2">Recognized upcoming items in this window</p>
          <div className="flex flex-wrap gap-2">
            {forecast.upcomingEvents.slice(0, 10).map((e, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-full ${e.type === 'income' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}
              >
                {new Date(e.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} · {e.name} · {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowForecastReport;
