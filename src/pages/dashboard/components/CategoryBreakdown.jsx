import React from 'react';
import Icon from '../../../components/AppIcon';

const CategoryBreakdown = ({ categories = [] }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Category Breakdown</h2>
          <Icon name="PieChart" size={20} color="var(--color-muted-foreground)" />
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Icon name="PieChart" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No budget data available</p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Category Breakdown</h2>
        <Icon name="PieChart" size={20} color="var(--color-muted-foreground)" />
      </div>

      <div className="space-y-4">
        {categories.slice(0, 6).map((category, index) => {
          const spent = parseFloat(category?.spent) || 0;
          const budget = parseFloat(category?.budget) || 0;
          const percentage = getProgressPercentage(spent, budget);
          const isOverBudget = percentage > 100;
          
          return (
            <div key={category?.id || index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={category?.icon || 'Folder'} 
                    size={16} 
                    color={category?.color || 'var(--color-primary)'} 
                  />
                  <span className="font-medium text-foreground">
                    {category?.name || 'Uncategorized'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    {formatAmount(spent)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of {formatAmount(budget)}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isOverBudget ? 'bg-error' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{percentage.toFixed(1)}% of budget</span>
                {isOverBudget && (
                  <span className="text-error font-medium">Over budget</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;