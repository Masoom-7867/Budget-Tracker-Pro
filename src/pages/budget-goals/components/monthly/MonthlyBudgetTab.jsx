import React, { useState, useEffect, useCallback } from 'react';
import { budgetService } from '../../../../services/budgetService';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { formatCurrency } from '../../../../utils/currency';
import { BUCKET_ORDER, getBucketAllocation } from '../../../../utils/monthlyBudget';
import MonthSelector from './MonthSelector';
import BudgetBucketSection from './BudgetBucketSection';
import LineItemModal from './LineItemModal';

const MonthlyBudgetTab = ({ userId, categories }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [incomeInput, setIncomeInput] = useState('0');
  const [savingIncome, setSavingIncome] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeBucket, setActiveBucket] = useState('needs');
  const [savingItem, setSavingItem] = useState(false);

  const loadMonthData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError('');

      let budget = await budgetService.getMonthlyBudget(userId, month, year);
      if (!budget) {
        // Ensure a row always exists for the viewed month so line items
        // always have somewhere to attach to, even before income is set.
        budget = await budgetService.upsertMonthlyBudget(userId, month, year, 0);
      }

      const [items, monthTransactions] = await Promise.all([
        budgetService.getBudgetLineItems(budget.id),
        budgetService.getTransactionsByMonth(userId, month, year)
      ]);

      setMonthlyBudget(budget);
      setIncomeInput(budget.monthly_income?.toString() || '0');
      setLineItems(items);
      setTransactions(monthTransactions);
    } catch (err) {
      console.error('Error loading monthly budget:', err);
      setError(err.message || 'Failed to load monthly budget');
    } finally {
      setLoading(false);
    }
  }, [userId, month, year]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  const handleMonthChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleSaveIncome = async () => {
    try {
      setSavingIncome(true);
      setError('');
      await budgetService.upsertMonthlyBudget(userId, month, year, Number(incomeInput) || 0);
    } catch (err) {
      setError(err.message || 'Failed to save income');
    } finally {
      setSavingIncome(false);
      await loadMonthData();
    }
  };

  const openAddItemModal = (bucket) => {
    setActiveBucket(bucket);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setActiveBucket(item.bucket);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (formData) => {
    try {
      setSavingItem(true);
      setError('');

      if (editingItem) {
        await budgetService.updateBudgetLineItem(editingItem.id, formData);
      } else {
        await budgetService.createBudgetLineItem({
          ...formData,
          user_id: userId,
          monthly_budget_id: monthlyBudget.id,
          bucket: activeBucket
        });
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError(err.message || 'Failed to save line item');
    } finally {
      setSavingItem(false);
      await loadMonthData();
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this line item?')) return;
    try {
      setError('');
      await budgetService.deleteBudgetLineItem(id);
    } catch (err) {
      setError(err.message || 'Failed to delete line item');
    } finally {
      await loadMonthData();
    }
  };

  const income = monthlyBudget?.monthly_income || 0;
  const totalForGroceries = BUCKET_ORDER.reduce((sum, bucket) => {
    const allocation = getBucketAllocation(income, bucket);
    const plannedTotal = lineItems
      .filter((item) => item.bucket === bucket)
      .reduce((s, item) => s + (Number(item.planned_amount) || 0), 0);
    return sum + (allocation - plannedTotal);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading monthly budget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MonthSelector month={month} year={year} onChange={handleMonthChange} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} color="var(--color-error)" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-600 text-xs mt-2 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Monthly Income */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Monthly Income (R)"
              type="number"
              min="0"
              step="0.01"
              value={incomeInput}
              onChange={(e) => setIncomeInput(e?.target?.value)}
            />
          </div>
          <Button variant="default" onClick={handleSaveIncome} disabled={savingIncome}>
            {savingIncome ? 'Saving...' : 'Save Income'}
          </Button>
        </div>
      </div>

      {/* 50/30/20 Buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {BUCKET_ORDER.map((bucket) => (
          <BudgetBucketSection
            key={bucket}
            bucket={bucket}
            monthlyIncome={income}
            lineItems={lineItems.filter((item) => item.bucket === bucket)}
            transactions={transactions}
            onAddItem={() => openAddItemModal(bucket)}
            onEditItem={openEditItemModal}
            onDeleteItem={handleDeleteItem}
          />
        ))}
      </div>

      {/* Total for Groceries */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center justify-between">
        <span className="font-semibold text-foreground">Total For Groceries</span>
        <span className="text-xl font-bold text-success">{formatCurrency(totalForGroceries)}</span>
      </div>

      <LineItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        bucket={activeBucket}
        categories={categories}
        saving={savingItem}
      />
    </div>
  );
};

export default MonthlyBudgetTab;
