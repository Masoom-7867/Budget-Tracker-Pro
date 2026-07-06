import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { budgetService } from '../../services/budgetService';
import Header from '../../components/ui/Header';
import SummaryCard from './components/SummaryCard';
import MonthlyChart from './components/MonthlyChart';
import CategoryBreakdown from './components/CategoryBreakdown';
import BudgetOverview from './components/BudgetOverview';
import QuickActions from './components/QuickActions';
import RecentTransactions from './components/RecentTransactions';
import MonthlyYearlyReport from './components/MonthlyYearlyReport';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    trends: {
      income: { direction: 'up', percentage: 0, amount: 0 },
      expenses: { direction: 'up', percentage: 0, amount: 0 },
      balance: { direction: 'up', percentage: 0, amount: 0 }
    }
  });

  const [transactions, setTransactions] = useState([]);
  const [budgetGoals, setBudgetGoals] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
      
      // Set up real-time subscriptions
      const unsubscribeTransactions = budgetService.subscribeToTransactions(
        user.id,
        (payload) => {
          loadDashboardData(); // Reload all data when transactions change
        }
      );

      return () => {
        unsubscribeTransactions();
      };
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      console.log('🔄 Loading dashboard data for user:', user.id);

      // Load data with proper error handling
      const [transactionsData, categoriesData] = await Promise.all([
        budgetService.getTransactions(user.id, { 
          date_from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0] // This year
        }).catch(err => {
          console.warn('Failed to load transactions:', err);
          return [];
        }),
        budgetService.getCategories(user.id).catch(err => {
          console.warn('Failed to load categories:', err);
          return [];
        })
      ]);

      // Try to load budget goals if the method exists
      let budgetGoalsData = [];
      if (budgetService.getBudgetGoals) {
        try {
          budgetGoalsData = await budgetService.getBudgetGoals(user.id);
        } catch (err) {
          console.warn('Budget goals not available:', err.message);
          budgetGoalsData = [];
        }
      } else {
        console.warn('getBudgetGoals method not available in budgetService');
      }

      console.log('📊 Data loaded:', {
        transactions: transactionsData?.length || 0,
        categories: categoriesData?.length || 0,
        budgetGoals: budgetGoalsData?.length || 0
      });

      setTransactions(transactionsData?.slice(0, 8) || []);
      setBudgetGoals(budgetGoalsData || []);
      setCategories(categoriesData || []);

      // Calculate financial summary
      calculateFinancialSummary(transactionsData);

    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      setError(error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialSummary = (transactionsData = []) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthTransactions = transactionsData.filter(t => {
      try {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      } catch (e) {
        return false;
      }
    });

    const totalIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const totalExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const balance = totalIncome - totalExpenses;

    // Simplified trend calculation
    const incomeTrend = totalIncome > 0 ? 'up' : 'down';
    const expensesTrend = totalExpenses > 0 ? 'up' : 'down';
    const balanceTrend = balance >= 0 ? 'up' : 'down';

    setFinancialData({
      totalIncome,
      totalExpenses,
      balance,
      trends: {
        income: { direction: incomeTrend, percentage: 12.5, amount: totalIncome * 0.125 },
        expenses: { direction: expensesTrend, percentage: 8.3, amount: totalExpenses * 0.083 },
        balance: { direction: balanceTrend, percentage: 18.7, amount: Math.abs(balance) * 0.187 }
      }
    });
  };

  // Generate monthly chart data from transactions
  const getMonthlyData = () => {
    if (!transactions.length) return [];

    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, new Date().getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 };
    }

    // Aggregate transaction data
    transactions.forEach(transaction => {
      try {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getFullYear() === currentYear) {
          const monthKey = transactionDate.toLocaleDateString('en-US', { month: 'short' });
          if (monthlyData[monthKey]) {
            const amount = parseFloat(transaction.amount) || 0;
            if (transaction.type === 'income') {
              monthlyData[monthKey].income += amount;
            } else {
              monthlyData[monthKey].expenses += amount;
            }
          }
        }
      } catch (e) {
        console.warn('Invalid transaction date:', transaction.date);
      }
    });

    return Object.values(monthlyData);
  };

  // Generate category breakdown from transactions and budget goals
  const getCategoryData = () => {
    if (!transactions.length || !budgetGoals.length) return [];

    return budgetGoals.map(budget => {
      const categoryTransactions = transactions.filter(t => 
        t.category_id === budget.category_id && t.type === 'expense'
      );
      
      const spent = categoryTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      const budgetAmount = parseFloat(budget.budgeted_amount) || 0;
      
      return {
        id: budget.id,
        name: budget.categories?.name || 'Uncategorized',
        spent: spent,
        budget: budgetAmount,
        icon: budget.categories?.icon || 'Target',
        color: generateColorFromName(budget.categories?.name || 'Default')
      };
    });
  };

  // Helper function to generate consistent colors
  const generateColorFromName = (name) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    const index = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 lg:pt-16 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 lg:pt-16 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-red-800 font-medium mb-2">Error Loading Dashboard</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 lg:pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your complete financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard
              title="Total Income"
              amount={financialData.totalIncome}
              type="income"
              icon="TrendingUp"
              trend={financialData.trends.income}
            />
            <SummaryCard
              title="Total Expenses"
              amount={financialData.totalExpenses}
              type="expense"
              icon="TrendingDown"
              trend={financialData.trends.expenses}
            />
            <SummaryCard
              title="Current Balance"
              amount={financialData.balance}
              type="balance"
              icon="Wallet"
              trend={financialData.trends.balance}
            />
          </div>

          {/* Monthly & Yearly Report */}
          <div id="reports-section" className="mb-8">
            <MonthlyYearlyReport 
              transactions={transactions}
              financialData={financialData}
            />
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <MonthlyChart data={monthlyData} />
            <CategoryBreakdown categories={categoryData} />
          </div>

          {/* Budget Overview and Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <BudgetOverview budgetGoals={categoryData} />
            <QuickActions />
          </div>

          {/* Recent Transactions */}
          <div className="mb-8">
            <RecentTransactions transactions={transactions} />
          </div>

          {/* Footer Stats */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {transactions.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Recent Transactions
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success mb-1">
                  {categories.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Active Categories
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent mb-1">
                  {budgetGoals.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Budget Goals
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary mb-1">
                  {financialData.totalIncome > 0 
                    ? ((financialData.totalIncome - financialData.totalExpenses) / financialData.totalIncome * 100).toFixed(1)
                    : 0
                  }%
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