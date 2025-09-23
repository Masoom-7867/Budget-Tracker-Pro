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
  
  // Remove mock data - replace with state
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
      const unsubscribeTransactions = budgetService?.subscribeToTransactions(
        user?.id,
        (payload) => {
          loadDashboardData(); // Reload all data when transactions change
        }
      );

      return () => {
        unsubscribeTransactions?.();
      };
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      // Load all data concurrently
      const [transactionsData, budgetGoalsData, categoriesData] = await Promise.all([
        budgetService?.getTransactions(user?.id, { 
          date_from: new Date(new Date().getFullYear(), 0, 1)?.toISOString()?.split('T')?.[0] // This year
        }),
        budgetService?.getBudgetGoals(user?.id),
        budgetService?.getCategories(user?.id)
      ]);

      setTransactions(transactionsData?.slice(0, 8) || []); // Recent 8 transactions
      setBudgetGoals(budgetGoalsData || []);
      setCategories(categoriesData || []);

      // Calculate financial summary
      const currentMonth = new Date()?.getMonth();
      const currentYear = new Date()?.getFullYear();
      
      const thisMonthTransactions = transactionsData?.filter(t => {
        const transactionDate = new Date(t?.date);
        return transactionDate?.getMonth() === currentMonth && 
               transactionDate?.getFullYear() === currentYear;
      }) || [];

      const totalIncome = thisMonthTransactions
        ?.filter(t => t?.type === 'income')
        ?.reduce((sum, t) => sum + parseFloat(t?.amount || 0), 0);

      const totalExpenses = thisMonthTransactions
        ?.filter(t => t?.type === 'expense')
        ?.reduce((sum, t) => sum + parseFloat(t?.amount || 0), 0);

      setFinancialData({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        trends: {
          income: { direction: 'up', percentage: 12.5, amount: totalIncome * 0.125 },
          expenses: { direction: 'up', percentage: 8.3, amount: totalExpenses * 0.083 },
          balance: { direction: totalIncome > totalExpenses ? 'up' : 'down', percentage: 18.7, amount: (totalIncome - totalExpenses) * 0.187 }
        }
      });

    } catch (error) {
      setError(error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Generate monthly chart data from transactions
  const getMonthlyData = () => {
    if (!transactions?.length) return [];

    const monthlyData = {};
    const currentYear = new Date()?.getFullYear();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, new Date().getMonth() - i, 1);
      const monthKey = date?.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 };
    }

    // Aggregate transaction data
    transactions?.forEach(transaction => {
      const transactionDate = new Date(transaction?.date);
      if (transactionDate?.getFullYear() === currentYear) {
        const monthKey = transactionDate?.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyData?.[monthKey]) {
          if (transaction?.type === 'income') {
            monthlyData[monthKey].income += parseFloat(transaction?.amount || 0);
          } else {
            monthlyData[monthKey].expenses += parseFloat(transaction?.amount || 0);
          }
        }
      }
    });

    return Object.values(monthlyData);
  };

  // Generate category breakdown from transactions and budget goals
  const getCategoryData = () => {
    if (!transactions?.length || !budgetGoals?.length) return [];

    return budgetGoals?.map(budget => {
      const categoryTransactions = transactions?.filter(t => 
        t?.category_id === budget?.category_id && t?.type === 'expense'
      );
      
      const spent = categoryTransactions?.reduce((sum, t) => sum + parseFloat(t?.amount || 0), 0);
      
      return {
        id: budget?.id,
        name: budget?.category?.name || budget?.name,
        spent: spent,
        budget: parseFloat(budget?.budgeted_amount || 0),
        icon: budget?.category?.icon || 'Target',
        color: budget?.category?.color || '#6B7280'
      };
    });
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
                onClick={() => loadDashboardData()}
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

          {/* Monthly & Yearly Report */}
          <div className="mb-8">
            <MonthlyYearlyReport />
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <MonthlyChart data={getMonthlyData()} />
            <CategoryBreakdown categories={getCategoryData()} />
          </div>

          {/* Budget Overview and Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <BudgetOverview budgetGoals={getCategoryData()} />
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
                  {transactions?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Recent Transactions
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success mb-1">
                  {categories?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Active Categories
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent mb-1">
                  {budgetGoals?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Budget Goals
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary mb-1">
                  {financialData?.totalIncome > 0 
                    ? ((financialData?.totalIncome - financialData?.totalExpenses) / financialData?.totalIncome * 100)?.toFixed(1)
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