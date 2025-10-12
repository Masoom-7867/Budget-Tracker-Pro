import React from 'react';
import Icon from '../../../components/AppIcon';

const MonthlyChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Monthly Overview</h2>
          <Icon name="BarChart3" size={20} color="var(--color-muted-foreground)" />
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Icon name="BarChart3" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No data available for chart</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => Math.max(item.income, item.expenses))) * 1.1;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Monthly Overview</h2>
        <Icon name="BarChart3" size={20} color="var(--color-muted-foreground)" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-error rounded-full"></div>
            <span className="text-muted-foreground">Expenses</span>
          </div>
        </div>

        <div className="flex items-end justify-between h-48 space-x-2">
          {data.map((month, index) => (
            <div key={index} className="flex flex-col items-center flex-1 space-y-1">
              <div className="flex items-end justify-center space-x-1 w-full" style={{ height: '120px' }}>
                {/* Income Bar */}
                <div 
                  className="w-4 bg-success rounded-t transition-all duration-500 hover:opacity-80"
                  style={{ height: `${(month.income / maxValue) * 100}%` }}
                  title={`Income: $${month.income.toLocaleString()}`}
                ></div>
                {/* Expenses Bar */}
                <div 
                  className="w-4 bg-error rounded-t transition-all duration-500 hover:opacity-80"
                  style={{ height: `${(month.expenses / maxValue) * 100}%` }}
                  title={`Expenses: $${month.expenses.toLocaleString()}`}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground mt-2">{month.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyChart;