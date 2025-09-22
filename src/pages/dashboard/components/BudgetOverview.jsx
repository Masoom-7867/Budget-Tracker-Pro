import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BudgetOverview = ({ budgetGoals }) => {
  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    })?.format(value);
  };

  const getProgressPercentage = (spent, budget) => {
    return budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  };

  const getProgressColor = (spent, budget) => {
    const percentage = getProgressPercentage(spent, budget);
    if (percentage >= 100) return 'bg-error';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  const totalBudget = budgetGoals?.reduce((sum, goal) => sum + goal?.budget, 0);
  const totalSpent = budgetGoals?.reduce((sum, goal) => sum + goal?.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Budget Goals Overview</h2>
        <Link to="/budget-goals">
          <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </Link>
      </div>
      {/* Overall Budget Summary */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{formatAmount(totalBudget)}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Budget</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-error">{formatAmount(totalSpent)}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Spent</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-success' : 'text-error'}`}>
              {formatAmount(totalRemaining)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(totalSpent, totalBudget)}`}
              style={{ width: `${getProgressPercentage(totalSpent, totalBudget)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>{getProgressPercentage(totalSpent, totalBudget)?.toFixed(1)}% used</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      {/* Individual Budget Goals */}
      <div className="space-y-4">
        {budgetGoals?.slice(0, 4)?.map((goal) => (
          <div key={goal?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${goal?.color}`}>
                <Icon name={goal?.icon} size={16} color="white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{goal?.category}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatAmount(goal?.spent)} of {formatAmount(goal?.budget)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-20 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal?.spent, goal?.budget)}`}
                  style={{ width: `${getProgressPercentage(goal?.spent, goal?.budget)}%` }}
                />
              </div>
              <div className="text-xs font-medium text-muted-foreground min-w-[40px] text-right">
                {getProgressPercentage(goal?.spent, goal?.budget)?.toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      {budgetGoals?.length > 4 && (
        <div className="mt-4 text-center">
          <Link to="/budget-goals">
            <Button variant="ghost" size="sm">
              View {budgetGoals?.length - 4} more budget goals
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;