import React from 'react';
import Icon from '../../../components/AppIcon';

const SummaryCard = ({ title, amount, type, icon, trend }) => {
  const getCardStyles = () => {
    switch (type) {
      case 'income':
        return 'bg-success/10 border-success/20';
      case 'expense':
        return 'bg-error/10 border-error/20';
      case 'balance':
        return amount >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-error/10 border-error/20';
      default:
        return 'bg-card border-border';
    }
  };

  const getAmountColor = () => {
    switch (type) {
      case 'income':
        return 'text-success';
      case 'expense':
        return 'text-error';
      case 'balance':
        return amount >= 0 ? 'text-primary' : 'text-error';
      default:
        return 'text-foreground';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'income':
        return 'var(--color-success)';
      case 'expense':
        return 'var(--color-error)';
      case 'balance':
        return amount >= 0 ? 'var(--color-primary)' : 'var(--color-error)';
      default:
        return 'var(--color-foreground)';
    }
  };

  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    })?.format(Math.abs(value));
  };

  return (
    <div className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${getCardStyles()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white/50">
            <Icon name={icon} size={24} color={getIconColor()} strokeWidth={2} />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </h3>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-medium ${
            trend?.direction === 'up' ? 'text-success' : 'text-error'
          }`}>
            <Icon 
              name={trend?.direction === 'up' ? 'TrendingUp' : 'TrendingDown'} 
              size={16} 
            />
            <span>{trend?.percentage}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className={`text-3xl font-bold ${getAmountColor()}`}>
          {type === 'balance' && amount < 0 ? '-' : ''}
          {formatAmount(amount)}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            {trend?.direction === 'up' ? '+' : ''}{formatAmount(trend?.amount)} from last month
          </p>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;