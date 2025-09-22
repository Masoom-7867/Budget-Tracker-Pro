import React from 'react';
import Icon from '../../../components/AppIcon';

const CategoryBreakdown = ({ categories }) => {
  const totalSpent = categories?.reduce((sum, category) => sum + category?.spent, 0);

  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    })?.format(value);
  };

  const getPercentage = (amount) => {
    return totalSpent > 0 ? ((amount / totalSpent) * 100)?.toFixed(1) : 0;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Expense Categories</h2>
        <div className="text-sm text-muted-foreground">
          Total: {formatAmount(totalSpent)}
        </div>
      </div>
      <div className="space-y-4">
        {categories?.map((category) => (
          <div key={category?.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${category?.color}`}>
                  <Icon name={category?.icon} size={20} color="white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{category?.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {getPercentage(category?.spent)}% of total spending
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">
                  {formatAmount(category?.spent)}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {formatAmount(category?.budget)}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  category?.spent > category?.budget ? 'bg-error' : category?.color?.replace('bg-', 'bg-')
                }`}
                style={{
                  width: `${Math.min((category?.spent / category?.budget) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdown;