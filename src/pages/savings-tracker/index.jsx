import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import SavingsBalanceCard from './components/SavingsBalanceCard';
import SavingsActions from './components/SavingsActions';
import SavingsHistory from './components/SavingsHistory';
import SavingsGoals from './components/SavingsGoals';

const SavingsTracker = () => {
  const [savingsBalance, setSavingsBalance] = useState(5250.75);
  const [transactions, setTransactions] = useState([
    {
      type: 'deposit',
      amount: 500.00,
      date: new Date('2024-09-20T14:30:00'),
      runningBalance: 5250.75
    },
    {
      type: 'withdrawal',
      amount: 150.00,
      date: new Date('2024-09-18T10:15:00'),
      runningBalance: 4750.75
    },
    {
      type: 'deposit',
      amount: 1000.00,
      date: new Date('2024-09-15T16:45:00'),
      runningBalance: 4900.75
    },
    {
      type: 'deposit',
      amount: 300.00,
      date: new Date('2024-09-12T09:20:00'),
      runningBalance: 3900.75
    },
    {
      type: 'withdrawal',
      amount: 75.00,
      date: new Date('2024-09-10T13:10:00'),
      runningBalance: 3600.75
    },
    {
      type: 'deposit',
      amount: 800.00,
      date: new Date('2024-09-08T11:30:00'),
      runningBalance: 3675.75
    }
  ]);

  const [savingsGoals] = useState([
    {
      name: 'Emergency Fund',
      description: 'Build a 6-month emergency fund for financial security',
      target: 15000.00,
      monthlyContribution: 500.00,
      icon: 'Shield'
    },
    {
      name: 'Vacation Fund',
      description: 'Save for a dream vacation to Europe',
      target: 8000.00,
      monthlyContribution: 300.00,
      icon: 'Plane'
    },
    {
      name: 'New Car',
      description: 'Down payment for a reliable vehicle',
      target: 12000.00,
      monthlyContribution: 400.00,
      icon: 'Car'
    }
  ]);

  const handleAddMoney = (amount) => {
    const newBalance = savingsBalance + amount;
    const newTransaction = {
      type: 'deposit',
      amount: amount,
      date: new Date(),
      runningBalance: newBalance
    };
    
    setSavingsBalance(newBalance);
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleSubtractMoney = (amount) => {
    const newBalance = savingsBalance - amount;
    const newTransaction = {
      type: 'withdrawal',
      amount: amount,
      date: new Date(),
      runningBalance: newBalance
    };
    
    setSavingsBalance(newBalance);
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Update page title
  useEffect(() => {
    document.title = 'Savings Tracker - BudgetTracker Pro';
  }, []);

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
              />
            </div>

            {/* Transaction History */}
            <div>
              <SavingsHistory transactions={transactions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavingsTracker;