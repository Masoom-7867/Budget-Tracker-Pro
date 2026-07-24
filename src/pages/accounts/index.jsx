import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { budgetService } from '../../services/budgetService';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/currency';
import { calculateSavingsBalance } from '../../utils/savingsBalance';
import AccountCard from './components/AccountCard';
import AccountModal from './components/AccountModal';

const Accounts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadAccounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError('');

      // Make sure the Savings account always exists so it's always shown
      await budgetService.ensureSavingsAccount(user.id);

      const [accountsData, savingsTransactions] = await Promise.all([
        budgetService.getAccounts(user.id),
        budgetService.getSavingsTransactions(user.id)
      ]);

      setAccounts(accountsData);
      setSavingsBalance(calculateSavingsBalance(savingsTransactions));
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const openAddModal = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (formData) => {
    try {
      setSaving(true);
      setError('');

      if (editingAccount) {
        await budgetService.updateAccount(editingAccount.id, formData);
      } else {
        await budgetService.createAccount({ ...formData, user_id: user.id });
      }
      setIsModalOpen(false);
      setEditingAccount(null);
    } catch (err) {
      setError(err.message || 'Failed to save account');
    } finally {
      setSaving(false);
      await loadAccounts();
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Delete this account? Transactions tagged to it will keep their history but show no account.')) return;
    try {
      setError('');
      await budgetService.deleteAccount(id);
    } catch (err) {
      setError(err.message || 'Failed to delete account');
    } finally {
      await loadAccounts();
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => {
    const balance = acc.type === 'savings' ? savingsBalance : (Number(acc.balance) || 0);
    return sum + balance;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading accounts...</p>
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Accounts</h1>
              <p className="text-muted-foreground">
                Keep track of your bank, cash, and savings balances in one place.
              </p>
            </div>
            <Button variant="default" iconName="Plus" iconPosition="left" onClick={openAddModal}>
              Add Account
            </Button>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3 mb-6">
            <Icon name="Info" size={18} className="text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              There's no live connection to Nedbank, Capitec, or any other bank - balances for
              bank/cash accounts are entered and updated by you. The Savings account is the
              exception: its balance is always calculated from your Savings Tracker activity.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border p-5 mb-6">
            <p className="text-sm text-muted-foreground">Total Across All Accounts</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalBalance)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                balance={account.type === 'savings' ? savingsBalance : account.balance}
                onEdit={openEditModal}
                onDelete={handleDeleteAccount}
                onViewSavings={() => navigate('/savings-tracker')}
              />
            ))}
          </div>

          <AccountModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingAccount(null);
            }}
            onSave={handleSaveAccount}
            editingAccount={editingAccount}
            saving={saving}
          />
        </div>
      </main>
    </div>
  );
};

export default Accounts;
