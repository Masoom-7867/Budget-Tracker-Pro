import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import SummaryCard from './components/SummaryCard';
import MonthlyChart from './components/MonthlyChart';
import CategoryBreakdown from './components/CategoryBreakdown';
import BudgetOverview from './components/BudgetOverview';
import QuickActions from './components/QuickActions';
import RecentTransactions from './components/RecentTransactions';

const Dashboard = () => {
  // Mock financial data
  const [financialData, setFinancialData] = useState({
    totalIncome: 8500.00,
    totalExpenses: 6250.75,
    balance: 2249.25,
    trends: {
      income: { direction: 'up', percentage: 12.5, amount: 950.00 },
      expenses: { direction: 'up', percentage: 8.3, amount: 480.25 },
      balance: { direction: 'up', percentage: 18.7, amount: 469.75 }
    }
  });

  // Mock monthly chart data
  const monthlyData = [
    { month: 'Jan', income: 7500, expenses: 5200 },
    { month: 'Feb', income: 8200, expenses: 5800 },
    { month: 'Mar', income: 7800, expenses: 5400 },
    { month: 'Apr', income: 8500, expenses: 6100 },
    { month: 'May', income: 8000, expenses: 5900 },
    { month: 'Jun', income: 8500, expenses: 6250 }
  ];

  // Mock category breakdown data
  const categoryData = [
    {
      id: 1,
      name: 'Food & Dining',
      spent: 1250.50,
      budget: 1500.00,
      icon: 'UtensilsCrossed',
      color: 'bg-orange-500'
    },
    {
      id: 2,
      name: 'Transportation',
      spent: 850.25,
      budget: 1000.00,
      icon: 'Car',
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'Shopping',
      spent: 1100.75,
      budget: 800.00,
      icon: 'ShoppingBag',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'Entertainment',
      spent: 425.00,
      budget: 600.00,
      icon: 'Film',
      color: 'bg-pink-500'
    },
    {
      id: 5,
      name: 'Bills & Utilities',
      spent: 1200.00,
      budget: 1200.00,
      icon: 'Receipt',
      color: 'bg-gray-500'
    },
    {
      id: 6,
      name: 'Healthcare',
      spent: 320.25,
      budget: 500.00,
      icon: 'Heart',
      color: 'bg-red-500'
    }
  ];

  // Mock budget goals data
  const budgetGoalsData = [
    {
      id: 1,
      category: 'Food & Dining',
      budget: 1500.00,
      spent: 1250.50,
      icon: 'UtensilsCrossed',
      color: 'bg-orange-500'
    },
    {
      id: 2,
      category: 'Transportation',
      budget: 1000.00,
      spent: 850.25,
      icon: 'Car',
      color: 'bg-blue-500'
    },
    {
      id: 3,
      category: 'Shopping',
      budget: 800.00,
      spent: 1100.75,
      icon: 'ShoppingBag',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      category: 'Entertainment',
      budget: 600.00,
      spent: 425.00,
      icon: 'Film',
      color: 'bg-pink-500'
    },
    {
      id: 5,
      category: 'Bills & Utilities',
      budget: 1200.00,
      spent: 1200.00,
      icon: 'Receipt',
      color: 'bg-gray-500'
    },
    {
      id: 6,
      category: 'Healthcare',
      budget: 500.00,
      spent: 320.25,
      icon: 'Heart',
      color: 'bg-red-500'
    }
  ];

  // Mock recent transactions data
  const recentTransactions = [
    {
      id: 1,
      description: "Grocery Shopping at Whole Foods",
      amount: 125.50,
      type: 'expense',
      category: 'Food & Dining',
      date: '2025-09-21'
    },
    {
      id: 2,
      description: "Monthly Salary Deposit",
      amount: 4250.00,
      type: 'income',
      category: 'Salary',
      date: '2025-09-20'
    },
    {
      id: 3,
      description: "Gas Station Fill-up",
      amount: 65.75,
      type: 'expense',
      category: 'Transportation',
      date: '2025-09-19'
    },
    {
      id: 4,
      description: "Netflix Subscription",
      amount: 15.99,
      type: 'expense',
      category: 'Entertainment',
      date: '2025-09-18'
    },
    {
      id: 5,
      description: "Freelance Project Payment",
      amount: 850.00,
      type: 'income',
      category: 'Freelance',
      date: '2025-09-17'
    },
    {
      id: 6,
      description: "Online Shopping - Amazon",
      amount: 89.99,
      type: 'expense',
      category: 'Shopping',
      date: '2025-09-16'
    },
    {
      id: 7,
      description: "Restaurant Dinner",
      amount: 75.25,
      type: 'expense',
      category: 'Food & Dining',
      date: '2025-09-15'
    },
    {
      id: 8,
      description: "Investment Dividend",
      amount: 125.00,
      type: 'income',
      category: 'Investment',
      date: '2025-09-14'
    }
  ];

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // This would typically fetch fresh data from an API
      // For demo purposes, we're keeping the data static
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <main className="pt-16 lg:pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your complete financial overview for {new Date()?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard
              title="Total Income"
              amount={financialData?.totalIncome}
              type="income"
              icon="TrendingUp"
              trend={financialData?.trends?.income}
            />
            <SummaryCard
              title="Total Expenses"
              amount={financialData?.totalExpenses}
              type="expense"
              icon="TrendingDown"
              trend={financialData?.trends?.expenses}
            />
            <SummaryCard
              title="Current Balance"
              amount={financialData?.balance}
              type="balance"
              icon="Wallet"
              trend={financialData?.trends?.balance}
            />
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <MonthlyChart data={monthlyData} />
            <CategoryBreakdown categories={categoryData} />
          </div>

          {/* Budget Overview and Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <BudgetOverview budgetGoals={budgetGoalsData} />
            <QuickActions />
          </div>

          {/* Recent Transactions */}
          <div className="mb-8">
            <RecentTransactions transactions={recentTransactions} />
          </div>

          {/* Footer Stats */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {recentTransactions?.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Transactions
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success mb-1">
                  {categoryData?.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Active Categories
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent mb-1">
                  {budgetGoalsData?.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Budget Goals
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary mb-1">
                  {((financialData?.totalIncome - financialData?.totalExpenses) / financialData?.totalIncome * 100)?.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Savings Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;