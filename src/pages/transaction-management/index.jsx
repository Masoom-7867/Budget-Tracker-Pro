import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { budgetService } from '../../services/budgetService';
import Header from '../../components/ui/Header';
import TransactionForm from './components/TransactionForm';
import TransactionFilters from './components/TransactionFilters';
import TransactionTable from './components/TransactionTable';
import EditTransactionModal from './components/EditTransactionModal';

const TransactionManagement = () => {
  const { user } = useAuth();
  
  // Remove hardcoded mock data - replace with state
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter and sort state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    dateFrom: '',
    dateTo: ''
  });

  const [sortConfig, setSortConfig] = useState({
    field: 'date',
    direction: 'desc'
  });

  // Edit modal state
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
      
      // Set up real-time subscription
      const unsubscribe = budgetService?.subscribeToTransactions(
        user?.id,
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          switch (eventType) {
            case 'INSERT':
              if (newRecord?.user_id === user?.id) {
                // Reload data to get category information
                loadData();
              }
              break;
            case 'UPDATE':
              if (newRecord?.user_id === user?.id) {
                loadData();
              }
              break;
            case 'DELETE':
              setTransactions(prev => 
                prev?.filter(t => t?.id !== oldRecord?.id)
              );
              break;
          }
        }
      );

      return () => unsubscribe?.();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      const [transactionsData, categoriesData] = await Promise.all([
        budgetService?.getTransactions(user?.id),
        budgetService?.getCategories(user?.id)
      ]);

      setTransactions(transactionsData || []);
      setCategories(categoriesData || []);

    } catch (error) {
      setError(error?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    if (!transactions?.length) return [];
    
    let filtered = [...transactions];

    // Search filter
    if (filters?.search) {
      filtered = filtered?.filter(transaction =>
        transaction?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      );
    }

    // Type filter
    if (filters?.type) {
      filtered = filtered?.filter(transaction => transaction?.type === filters?.type);
    }

    // Category filter
    if (filters?.category) {
      filtered = filtered?.filter(transaction => transaction?.category_id === filters?.category);
    }

    // Date range filter
    if (filters?.dateFrom) {
      filtered = filtered?.filter(transaction => transaction?.date >= filters?.dateFrom);
    }

    if (filters?.dateTo) {
      filtered = filtered?.filter(transaction => transaction?.date <= filters?.dateTo);
    }

    return filtered;
  }, [transactions, filters]);

  // Sort filtered transactions
  const sortedTransactions = useMemo(() => {
    if (!filteredTransactions?.length) return [];
    
    const sorted = [...filteredTransactions];
    
    sorted?.sort((a, b) => {
      let aValue = a?.[sortConfig?.field];
      let bValue = b?.[sortConfig?.field];

      // Handle different data types
      if (sortConfig?.field === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortConfig?.field === 'amount') {
        aValue = parseFloat(aValue || 0);
        bValue = parseFloat(bValue || 0);
      } else if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredTransactions, sortConfig]);

  // Calculate total filtered amount
  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions?.reduce((total, transaction) => {
      return total + (transaction?.type === 'income' 
        ? parseFloat(transaction?.amount || 0) 
        : -parseFloat(transaction?.amount || 0)
      );
    }, 0);
  }, [filteredTransactions]);

  // Handle adding new transaction
  const handleAddTransaction = async (newTransactionData) => {
    try {
      await budgetService?.createTransaction({
        ...newTransactionData,
        user_id: user?.id
      });
      // Real-time subscription will handle the update
    } catch (error) {
      setError(error?.message || 'Failed to add transaction');
    }
  };

  // Handle editing transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // Handle saving edited transaction
  const handleSaveTransaction = async (updatedTransactionData) => {
    try {
      await budgetService?.updateTransaction(editingTransaction?.id, updatedTransactionData);
      setIsEditModalOpen(false);
      setEditingTransaction(null);
      // Real-time subscription will handle the update
    } catch (error) {
      setError(error?.message || 'Failed to update transaction');
    }
  };

  // Handle deleting transaction
  const handleDeleteTransaction = async (transactionId) => {
    if (window?.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await budgetService?.deleteTransaction(transactionId);
        // Real-time subscription will handle the update
      } catch (error) {
        setError(error?.message || 'Failed to delete transaction');
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle sort changes
  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
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
                <p className="text-muted-foreground">Loading transactions...</p>
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
      <main className="pt-16 lg:pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Transaction Management</h1>
            <p className="text-muted-foreground">
              Add new transactions and manage your financial history with advanced filtering and sorting capabilities.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={() => setError('')}
                className="text-red-600 text-sm mt-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Transaction Form */}
          <div className="mb-8">
            <TransactionForm
              onAddTransaction={handleAddTransaction}
              categories={categories}
            />
          </div>

          {/* Transaction History Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Transaction History</h2>
              <p className="text-muted-foreground">
                View, filter, and manage all your financial transactions in one place.
              </p>
            </div>

            {/* Filters */}
            <TransactionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
              totalFilteredAmount={totalFilteredAmount}
              filteredCount={filteredTransactions?.length}
              totalCount={transactions?.length}
            />

            {/* Transaction Table */}
            <TransactionTable
              transactions={sortedTransactions}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
        </div>
      </main>
      
      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
      />
    </div>
  );
};

export default TransactionManagement;