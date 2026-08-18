import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { budgetService } from '../../services/budgetService';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import PeriodSelector from './components/PeriodSelector';
import CashFlowReport from './components/CashFlowReport';
import CategoryBreakdownReport from './components/CategoryBreakdownReport';
import BudgetVsActualReport from './components/BudgetVsActualReport';
import SavingsRateReport from './components/SavingsRateReport';
import NetWorthTrendReport from './components/NetWorthTrendReport';
import RecurringExpensesReport from './components/RecurringExpensesReport';
import CashFlowSankeyReport from './components/CashFlowSankeyReport';
import CashFlowForecastReport from './components/CashFlowForecastReport';
import SpendingAnomalyReport from './components/SpendingAnomalyReport';
import { calculateSavingsBalance } from '../../utils/savingsBalance';

const Reports = () => {
  const { user } = useAuth();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [transactions, setTransactions] = useState([]);
  const [budgetGoals, setBudgetGoals] = useState([]);
  const [balanceSnapshots, setBalanceSnapshots] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [savingsTransactions, setSavingsTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Transactions are loaded once and filtered per-report/period client-side
  // (Cash Flow needs multiple years' worth at once, so a single month-scoped
  // fetch wouldn't work for it anyway).
  const loadTransactions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await budgetService.getTransactions(user.id);
      setTransactions(data || []);
    } catch (err) {
      console.error('Error loading transactions for reports:', err);
      setError(err.message || 'Failed to load transactions');
    }
  }, [user?.id]);

  // Budget goals are genuinely month-scoped (spent_amount is calculated
  // server-side per month), so this reloads whenever the period changes.
  const loadBudgetGoals = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await budgetService.getBudgetGoals(user.id, month, year);
      setBudgetGoals(data || []);
    } catch (err) {
      console.error('Error loading budget goals for reports:', err);
      setError(err.message || 'Failed to load budget goals');
    }
  }, [user?.id, month, year]);

  // Captures this month's balance snapshot (if not already done today) then
  // loads the full history for the Net Worth Trend chart.
  const loadNetWorthData = useCallback(async () => {
    if (!user?.id) return;
    try {
      await budgetService.ensureCurrentMonthSnapshots(user.id);
      const data = await budgetService.getBalanceSnapshots(user.id);
      setBalanceSnapshots(data || []);
    } catch (err) {
      console.error('Error loading net worth data:', err);
      setError(err.message || 'Failed to load net worth history');
    }
  }, [user?.id]);

  // Powers the Cash Flow Visualizer (Sankey) - needs to know which account
  // is the Savings one, plus the dedicated savings ledger for that flow.
  const loadCashFlowSankeyData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [accountsData, savingsData] = await Promise.all([
        budgetService.getAccounts(user.id),
        budgetService.getSavingsTransactions(user.id)
      ]);
      setAccounts(accountsData || []);
      setSavingsTransactions(savingsData || []);
    } catch (err) {
      console.error('Error loading cash flow visualizer data:', err);
      setError(err.message || 'Failed to load cash flow data');
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTransactions(), loadBudgetGoals(), loadNetWorthData(), loadCashFlowSankeyData()]).finally(() => setLoading(false));
  }, [loadTransactions, loadBudgetGoals, loadNetWorthData, loadCashFlowSankeyData]);

  const handlePeriodChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 lg:pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
            <p className="text-muted-foreground">
              Cash flow, forecasts, net worth, savings rate, category spending, budget performance, recurring charges, income flow, and spending anomalies - all with the ability to look back at previous periods.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} color="var(--color-error)" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Cash Flow has its own independent Monthly/Annual controls */}
            <CashFlowReport transactions={transactions} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NetWorthTrendReport snapshots={balanceSnapshots} />
              <SavingsRateReport transactions={transactions} />
            </div>

            <CashFlowForecastReport
              transactions={transactions}
              accounts={accounts}
              savingsBalance={calculateSavingsBalance(savingsTransactions)}
            />

            {/* Category Breakdown, Budget vs Actual, Cash Flow Visualizer, and Spending Anomaly Detector share one month selector */}
            <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm font-medium text-foreground">Category Breakdown, Budget vs Actual, Cash Flow Visualizer &amp; Anomaly Detector for:</p>
              <PeriodSelector month={month} year={year} onChange={handlePeriodChange} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryBreakdownReport transactions={transactions} month={month} year={year} />
              <BudgetVsActualReport budgetGoals={budgetGoals} />
            </div>

            <SpendingAnomalyReport transactions={transactions} month={month} year={year} />

            <CashFlowSankeyReport
              transactions={transactions}
              savingsTransactions={savingsTransactions}
              accounts={accounts}
              month={month}
              year={year}
            />

            <RecurringExpensesReport transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
