import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentTransactions = ({ transactions }) => {
  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    })?.format(Math.abs(value));
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })?.format(new Date(date));
  };

  const getTransactionIcon = (category) => {
    const iconMap = {
      'Food & Dining': 'UtensilsCrossed',
      'Transportation': 'Car',
      'Shopping': 'ShoppingBag',
      'Entertainment': 'Film',
      'Bills & Utilities': 'Receipt',
      'Healthcare': 'Heart',
      'Salary': 'Briefcase',
      'Freelance': 'Laptop',
      'Investment': 'TrendingUp',
      'Gift': 'Gift'
    };
    return iconMap?.[category] || 'DollarSign';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Food & Dining': 'bg-orange-500',
      'Transportation': 'bg-blue-500',
      'Shopping': 'bg-purple-500',
      'Entertainment': 'bg-pink-500',
      'Bills & Utilities': 'bg-gray-500',
      'Healthcare': 'bg-red-500',
      'Salary': 'bg-green-500',
      'Freelance': 'bg-teal-500',
      'Investment': 'bg-indigo-500',
      'Gift': 'bg-yellow-500'
    };
    return colorMap?.[category] || 'bg-gray-500';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Transactions</h2>
        <Link to="/transaction-management">
          <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {transactions?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Receipt" size={24} color="var(--color-muted-foreground)" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-2">No transactions yet</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Start by adding your first transaction to track your finances
            </p>
            <Link to="/transaction-management">
              <Button variant="default" size="sm" iconName="Plus" iconPosition="left">
                Add Transaction
              </Button>
            </Link>
          </div>
        ) : (
          transactions?.slice(0, 6)?.map((transaction) => (
            <div key={transaction?.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${getCategoryColor(transaction?.category)}`}>
                  <Icon 
                    name={getTransactionIcon(transaction?.category)} 
                    size={18} 
                    color="white" 
                    strokeWidth={2} 
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {transaction?.description}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{transaction?.category}</span>
                    <span>•</span>
                    <span>{formatDate(transaction?.date)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-semibold ${
                  transaction?.type === 'income' ? 'text-success' : 'text-error'
                }`}>
                  {transaction?.type === 'income' ? '+' : '-'}{formatAmount(transaction?.amount)}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {transaction?.type}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {transactions?.length > 6 && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <Link to="/transaction-management">
            <Button variant="ghost" size="sm">
              View {transactions?.length - 6} more transactions
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;