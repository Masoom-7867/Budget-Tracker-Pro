import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BudgetOverview = ({ budgetGoals = [] }) => {
  // Safe data access with defaults
  const safeBudgetGoals = Array.isArray(budgetGoals) ? budgetGoals : [];

  const formatAmount = (value) => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const getProgressPercentage = (spent, budget) => {
    const spentNum = parseFloat(spent) || 0;
    const budgetNum = parseFloat(budget) || 0;
    return budgetNum > 0 ? Math.min((spentNum / budgetNum) * 100, 100) : 0;
  };

  const getProgressColor = (spent, budget) => {
    const percentage = getProgressPercentage(spent, budget);
    if (percentage >= 100) return 'bg-error';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  // Calculate totals with safe defaults
  const totalBudget = safeBudgetGoals.reduce((sum, goal) => {
    const budget = parseFloat(goal?.budget) || 0;
    return sum + budget;
  }, 0);

  const totalSpent = safeBudgetGoals.reduce((sum, goal) => {
    const spent = parseFloat(goal?.spent) || 0;
    return sum + spent;
  }, 0);

  const totalRemaining = totalBudget - totalSpent;
  const progressPercentage = getProgressPercentage(totalSpent, totalBudget);

  // Get category name safely
  const getCategoryName = (goal) => {
    return goal?.name || goal?.category || 'Uncategorized';
  };

  // Get category icon safely
  const getCategoryIcon = (goal) => {
    return goal?.icon || 'Folder';
  };

  // Get category color safely
  const getCategoryColor = (goal) => {
    return goal?.color || 'var(--color-primary)';
  };

  if (safeBudgetGoals.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Budget Goals Overview</h2>
          <Link to="/budget-goals">
            <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
              Set Budget
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Icon name="Target" size={24} color="var(--color-muted-foreground)" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Budget Goals Set</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Set up budget goals to track your spending and stay on top of your finances.
          </p>
          <Link to="/budget-goals">
            <Button variant="default" iconName="Plus">
              Create Budget Goal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>{progressPercentage.toFixed(1)}% used</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Individual Budget Goals */}
      <div className="space-y-4">
        {safeBudgetGoals.slice(0, 4).map((goal) => {
          const categoryName = getCategoryName(goal);
          const categoryIcon = getCategoryIcon(goal);
          const categoryColor = getCategoryColor(goal);
          const spent = parseFloat(goal?.spent) || 0;
          const budget = parseFloat(goal?.budget) || 0;
          const progressPercentage = getProgressPercentage(spent, budget);

          return (
            <div key={goal?.id || goal?.category_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${categoryColor}20` }}
                >
                  <Icon 
                    name={categoryIcon} 
                    size={16} 
                    color={categoryColor}
                    strokeWidth={2} 
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{categoryName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatAmount(spent)} of {formatAmount(budget)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-20 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(spent, budget)}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs font-medium text-muted-foreground min-w-[40px] text-right">
                  {progressPercentage.toFixed(0)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {safeBudgetGoals.length > 4 && (
        <div className="mt-4 text-center">
          <Link to="/budget-goals">
            <Button variant="ghost" size="sm">
              View {safeBudgetGoals.length - 4} more budget goals
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;