import React from 'react';
import Icon from '../../../components/AppIcon';

const CategoryStats = ({ incomeCategories, expenseCategories }) => {
  const totalIncomeCategories = incomeCategories?.length;
  const totalExpenseCategories = expenseCategories?.length;
  const totalCategories = totalIncomeCategories + totalExpenseCategories;
  
  const totalIncomeTransactions = incomeCategories?.reduce((sum, cat) => sum + cat?.transactionCount, 0);
  const totalExpenseTransactions = expenseCategories?.reduce((sum, cat) => sum + cat?.transactionCount, 0);
  const totalTransactions = totalIncomeTransactions + totalExpenseTransactions;

  const mostUsedIncomeCategory = incomeCategories?.reduce((max, cat) => 
    cat?.transactionCount > (max?.transactionCount || 0) ? cat : max, null
  );
  
  const mostUsedExpenseCategory = expenseCategories?.reduce((max, cat) => 
    cat?.transactionCount > (max?.transactionCount || 0) ? cat : max, null
  );

  const stats = [
    {
      label: 'Total Categories',
      value: totalCategories,
      icon: 'Tags',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Income Categories',
      value: totalIncomeCategories,
      icon: 'TrendingUp',
      color: 'var(--color-success)',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Expense Categories',
      value: totalExpenseCategories,
      icon: 'TrendingDown',
      color: 'var(--color-error)',
      bgColor: 'bg-error/10'
    },
    {
      label: 'Total Transactions',
      value: totalTransactions,
      icon: 'Receipt',
      color: 'var(--color-accent)',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon name="BarChart3" size={20} color="var(--color-primary)" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Category Overview</h2>
          <p className="text-sm text-muted-foreground">Summary of your category usage</p>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats?.map((stat, index) => (
          <div key={index} className="bg-background rounded-lg border border-border p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat?.bgColor}`}>
                <Icon name={stat?.icon} size={20} color={stat?.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
                <p className="text-sm text-muted-foreground">{stat?.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Most Used Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background rounded-lg border border-border p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Trophy" size={16} color="var(--color-success)" />
            <h3 className="font-medium text-foreground">Most Used Income Category</h3>
          </div>
          {mostUsedIncomeCategory ? (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Icon name={mostUsedIncomeCategory?.icon} size={16} color="var(--color-success)" />
              </div>
              <div>
                <p className="font-medium text-foreground">{mostUsedIncomeCategory?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {mostUsedIncomeCategory?.transactionCount} transactions
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No income categories yet</p>
          )}
        </div>

        <div className="bg-background rounded-lg border border-border p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Trophy" size={16} color="var(--color-error)" />
            <h3 className="font-medium text-foreground">Most Used Expense Category</h3>
          </div>
          {mostUsedExpenseCategory ? (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-error/10 rounded-lg">
                <Icon name={mostUsedExpenseCategory?.icon} size={16} color="var(--color-error)" />
              </div>
              <div>
                <p className="font-medium text-foreground">{mostUsedExpenseCategory?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {mostUsedExpenseCategory?.transactionCount} transactions
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No expense categories yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryStats;