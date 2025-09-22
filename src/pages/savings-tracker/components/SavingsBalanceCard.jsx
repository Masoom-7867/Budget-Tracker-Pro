import React from 'react';
import Icon from '../../../components/AppIcon';

const SavingsBalanceCard = ({ balance }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 rounded-full p-3">
            <Icon name="PiggyBank" size={32} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-medium opacity-90">Total Savings</h2>
            <p className="text-sm opacity-75">Your accumulated savings</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-lg px-3 py-1">
          <span className="text-sm font-medium">Active</span>
        </div>
      </div>
      
      <div className="text-center py-6">
        <div className="text-5xl font-bold mb-2">
          {formatCurrency(balance)}
        </div>
        <p className="text-emerald-100 text-sm">
          Keep saving to reach your financial goals!
        </p>
      </div>
      
      <div className="flex items-center justify-center space-x-4 pt-4 border-t border-white/20">
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={16} color="white" />
          <span className="text-sm">Growing</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={16} color="white" />
          <span className="text-sm">Secure</span>
        </div>
      </div>
    </div>
  );
};

export default SavingsBalanceCard;