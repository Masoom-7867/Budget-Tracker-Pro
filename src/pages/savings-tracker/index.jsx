import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { budgetService } from '../../services/budgetService';
import Header from '../../components/ui/Header';
import SavingsBalanceCard from './components/SavingsBalanceCard';
import SavingsActions from './components/SavingsActions';
import SavingsHistory from './components/SavingsHistory';
import SavingsGoals from './components/SavingsGoals';

const SavingsTracker = () => {
  const { user } = useAuth();
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadSavingsData();
      
      // Set up real-time subscriptions
      const unsubscribeTransactions = budgetService.subscribeToSavingsTransactions?.(
        user.id,
        (payload) => {
          console.log('Savings transactions changed:', payload);
          loadSavingsData();
        }
      );

      const unsubscribeGoals = budgetService.subscribeToSavingsGoals?.(
        user.id,
        (payload) => {
          console.log('Savings goals changed:', payload);
          loadSavingsData();
        }
      );

      return () => {
        if (unsubscribeTransactions) unsubscribeTransactions();
        if (unsubscribeGoals) unsubscribeGoals();
      };
    }
  }, [user?.id]);

  const loadSavingsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      // Load savings transactions and goals concurrently
      const [transactionsData, goalsData] = await Promise.all([
        budgetService.getSavingsTransactions(user.id),
        budgetService.getSavingsGoals(user.id)
      ]);

      console.log('Loaded transactions:', transactionsData);
      console.log('Loaded goals:', goalsData);

      setTransactions(transactionsData || []);
      setSavingsGoals(goalsData || []);

      // Calculate current balance from transactions
      const balance = calculateCurrentBalance(transactionsData || []);
      setSavingsBalance(balance);

    } catch (error) {
      console.error('Error loading savings data:', error);
      setError('Failed to load savings data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentBalance = (transactions) => {
    return transactions.reduce((balance, transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      return transaction.type === 'deposit' ? balance + amount : balance - amount;
    }, 0);
  };

  const handleAddMoney = async (amount) => {
    try {
      setError('');

      const transactionData = {
        user_id: user.id,
        type: 'deposit',
        amount: parseFloat(amount),
        description: 'Manual deposit',
        date: new Date().toISOString()
      };

      console.log('Creating deposit transaction:', transactionData);
      await budgetService.createSavingsTransaction(transactionData);
      // The real-time subscription will update the data automatically
      
    } catch (error) {
      console.error('Error adding money:', error);
      setError('Failed to add money: ' + error.message);
    }
  };

  const handleSubtractMoney = async (amount) => {
    try {
      setError('');

      // Check if there's enough balance
      if (amount > savingsBalance) {
        throw new Error('Insufficient funds for this withdrawal');
      }

      const transactionData = {
        user_id: user.id,
        type: 'withdrawal',
        amount: parseFloat(amount),
        description: 'Manual withdrawal',
        date: new Date().toISOString()
      };

      console.log('Creating withdrawal transaction:', transactionData);
      await budgetService.createSavingsTransaction(transactionData);
      // The real-time subscription will update the data automatically
      
    } catch (error) {
      console.error('Error subtracting money:', error);
      setError('Failed to subtract money: ' + error.message);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      setError('');
      await budgetService.deleteSavingsTransaction(transactionId);
      // The real-time subscription will update the data automatically
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction: ' + error.message);
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      setError('');
      console.log('Creating savings goal with data:', goalData);

      const goalWithUser = {
        ...goalData,
        user_id: user.id,
        target_amount: parseFloat(goalData.target_amount),
        current_amount: 0, // Always start at 0
        monthly_contribution: parseFloat(goalData.monthly_contribution) || 0,
        icon: goalData.icon || 'Target'
      };

      console.log('Processed goal data for creation:', goalWithUser);
      await budgetService.createSavingsGoal(goalWithUser);
      // The real-time subscription will update the data automatically
      
    } catch (error) {
      console.error('Error creating savings goal:', error);
      setError('Failed to create savings goal: ' + error.message);
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      setError('');
      console.log('Updating savings goal:', goalId, 'with data:', updates);

      const updatesWithNumbers = {
        ...updates,
        target_amount: updates.target_amount ? parseFloat(updates.target_amount) : undefined,
        current_amount: updates.current_amount ? parseFloat(updates.current_amount) : undefined,
        monthly_contribution: updates.monthly_contribution ? parseFloat(updates.monthly_contribution) : undefined
      };

      await budgetService.updateSavingsGoal(goalId, updatesWithNumbers);
      // The real-time subscription will update the data automatically
      
    } catch (error) {
      console.error('Error updating savings goal:', error);
      setError('Failed to update savings goal: ' + error.message);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      setError('');
      await budgetService.deleteSavingsGoal(goalId);
      // The real-time subscription will update the data automatically
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      setError('Failed to delete savings goal: ' + error.message);
    }
  };

  // Update page title
  useEffect(() => {
    document.title = 'Savings Tracker - BudgetTracker Pro';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading savings data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content */}
      <main className="pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Savings Tracker</h1>
            <p className="text-muted-foreground">
              Manage your savings account and track your progress toward financial goals
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-800 text-sm">{error}</p>
                <button 
                  onClick={() => setError('')}
                  className="text-red-600 text-xs hover:underline ml-4"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Savings Balance Card */}
          <div className="mb-8">
            <SavingsBalanceCard balance={savingsBalance} />
          </div>

          {/* Savings Actions */}
          <div className="mb-8">
            <SavingsActions 
              onAddMoney={handleAddMoney}
              onSubtractMoney={handleSubtractMoney}
              currentBalance={savingsBalance}
            />
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Savings Goals */}
            <div>
              <SavingsGoals 
                goals={savingsGoals}
                currentBalance={savingsBalance}
                onCreateGoal={handleCreateGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            </div>

            {/* Transaction History */}
            <div>
              <SavingsHistory 
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavingsTracker;