import React from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

const RecentTransactions = ({ transactions = [] }) => {
  const navigate = useNavigate();

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  if (safeTransactions.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
          <Icon name="Receipt" size={20} color="var(--color-muted-foreground)" />
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Icon name="Receipt" size={32} color="var(--color-muted-foreground)" className="mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground mb-3">No recent transactions</p>
            <button 
              onClick={() => navigate('/transaction-management')}
              className="text-primary hover:underline text-sm"
            >
              Add your first transaction
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatAmount = (amount, type) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(type === 'income' ? numAmount : -numAmount);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
        <button 
          onClick={() => navigate('/transaction-management')}
          className="text-primary hover:underline text-sm flex items-center space-x-1"
        >
          <span>View All</span>
          <Icon name="ArrowRight" size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {safeTransactions.slice(0, 5).map((transaction) => {
          const amount = parseFloat(transaction.amount) || 0;
          const type = transaction.type || 'expense';
          
          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  type === 'income' ? 'bg-success/10' : 'bg-error/10'
                }`}>
                  <Icon 
                    name={transaction.category_icon || 'DollarSign'} 
                    size={16} 
                    color={type === 'income' ? 'var(--color-success)' : 'var(--color-error)'} 
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {transaction.description || 'No description'}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center space-x-2">
                    <span>{transaction.category_name || 'Uncategorized'}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>
              
              <div className={`text-sm font-semibold ${
                type === 'income' ? 'text-success' : 'text-error'
              }`}>
                {formatAmount(amount, type)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;