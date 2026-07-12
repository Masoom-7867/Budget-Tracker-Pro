import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';

const MonthlyYearlyReport = ({ transactions = [], financialData = {} }) => {
  const [activeTab, setActiveTab] = useState('monthly');

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeFinancialData = financialData || {};

  // Calculate monthly and yearly totals
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const monthlyData = safeTransactions.filter(t => {
    try {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    } catch (e) {
      return false;
    }
  });

  const yearlyData = safeTransactions.filter(t => {
    try {
      const date = new Date(t.date);
      return date.getFullYear() === currentYear;
    } catch (e) {
      return false;
    }
  });

  const monthlyIncome = monthlyData
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const monthlyExpenses = monthlyData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const yearlyIncome = yearlyData
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const yearlyExpenses = yearlyData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const data = activeTab === 'monthly' ? {
    income: monthlyIncome,
    expenses: monthlyExpenses,
    balance: monthlyIncome - monthlyExpenses
  } : {
    income: yearlyIncome,
    expenses: yearlyExpenses,
    balance: yearlyIncome - yearlyExpenses
  };

  const formatAmount = (value) => {
    return formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          {activeTab === 'monthly' ? 'Monthly Report' : 'Yearly Report'}
        </h2>
        <Icon name="FileText" size={20} color="var(--color-muted-foreground)" />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'monthly'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setActiveTab('yearly')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'yearly'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Report Data */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-success/10 rounded-lg">
          <div className="text-2xl font-bold text-success mb-1">
            {formatAmount(data.income)}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Income
          </div>
        </div>
        
        <div className="text-center p-4 bg-error/10 rounded-lg">
          <div className="text-2xl font-bold text-error mb-1">
            {formatAmount(data.expenses)}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Expenses
          </div>
        </div>
        
        <div className={`text-center p-4 rounded-lg ${
          data.balance >= 0 ? 'bg-primary/10' : 'bg-error/10'
        }`}>
          <div className={`text-2xl font-bold mb-1 ${
            data.balance >= 0 ? 'text-primary' : 'text-error'
          }`}>
            {formatAmount(Math.abs(data.balance))}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            {data.balance >= 0 ? 'Net Savings' : 'Net Loss'}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground mb-1">
            {activeTab === 'monthly' ? monthlyData.length : yearlyData.length}
          </div>
          <div className="text-xs text-muted-foreground">Total Transactions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground mb-1">
            {data.income > 0 ? ((data.balance / data.income) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-muted-foreground">Savings Rate</div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyYearlyReport;