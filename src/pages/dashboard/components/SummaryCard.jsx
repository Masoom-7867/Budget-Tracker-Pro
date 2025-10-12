import React from 'react';
import Icon from '../../../components/AppIcon';

const SummaryCard = ({ title, amount, type, icon, trend }) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'income': return 'text-success';
      case 'expense': return 'text-error';
      case 'balance': return 'text-primary';
      default: return 'text-foreground';
    }
  };

  const getBgColorClass = (type) => {
    switch (type) {
      case 'income': return 'bg-success/10';
      case 'expense': return 'bg-error/10';
      case 'balance': return 'bg-primary/10';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getBgColorClass(type)}`}>
          <Icon name={icon} size={24} className={getColorClass(type)} />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${
          trend.direction === 'up' ? 'text-success' : 'text-error'
        }`}>
          <Icon 
            name={trend.direction === 'up' ? 'TrendingUp' : 'TrendingDown'} 
            size={16} 
          />
          <span>{trend.percentage.toFixed(1)}%</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          {title}
        </h3>
        <p className={`text-2xl font-bold ${getColorClass(type)}`}>
          {formatAmount(amount)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {trend.direction === 'up' ? 'Up' : 'Down'} by {formatAmount(trend.amount)} from last month
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;