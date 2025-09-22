import React from 'react';
import Icon from '../../../components/AppIcon';

const BudgetSummaryCard = ({ totalBudget, totalSpent, remainingBalance, completionPercentage }) => {
  const getProgressColor = () => {
    if (completionPercentage <= 60) return 'bg-success';
    if (completionPercentage <= 80) return 'bg-warning';
    return 'bg-error';
  };

  const getProgressTextColor = () => {
    if (completionPercentage <= 60) return 'text-success';
    if (completionPercentage <= 80) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Budget Overview</h2>
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="Target" size={20} color="var(--color-primary)" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-foreground">${totalBudget?.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-foreground">${totalSpent?.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Remaining</p>
          <p className={`text-2xl font-bold ${remainingBalance >= 0 ? 'text-success' : 'text-error'}`}>
            ${Math.abs(remainingBalance)?.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className={`text-sm font-semibold ${getProgressTextColor()}`}>
            {completionPercentage?.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {remainingBalance >= 0 
            ? `You have $${remainingBalance?.toLocaleString()} remaining in your budget`
            : `You are $${Math.abs(remainingBalance)?.toLocaleString()} over budget`
          }
        </p>
      </div>
    </div>
  );
};

export default BudgetSummaryCard;