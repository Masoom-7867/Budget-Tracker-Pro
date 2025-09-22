import React, { useState, useMemo } from 'react';
import Header from '../../components/ui/Header';
import TransactionForm from './components/TransactionForm';
import TransactionFilters from './components/TransactionFilters';
import TransactionTable from './components/TransactionTable';
import EditTransactionModal from './components/EditTransactionModal';

const TransactionManagement = () => {
  // Mock categories data
  const categories = [
    { id: 1, name: "Salary", type: "income" },
    { id: 2, name: "Freelance", type: "income" },
    { id: 3, name: "Investment Returns", type: "income" },
    { id: 4, name: "Business Income", type: "income" },
    { id: 5, name: "Rental Income", type: "income" },
    { id: 6, name: "Food & Dining", type: "expense" },
    { id: 7, name: "Transportation", type: "expense" },
    { id: 8, name: "Shopping", type: "expense" },
    { id: 9, name: "Entertainment", type: "expense" },
    { id: 10, name: "Bills & Utilities", type: "expense" },
    { id: 11, name: "Healthcare", type: "expense" },
    { id: 12, name: "Education", type: "expense" },
    { id: 13, name: "Travel", type: "expense" },
    { id: 14, name: "Insurance", type: "expense" },
    { id: 15, name: "Miscellaneous", type: "expense" }
  ];

  // Mock transactions data
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: "income",
      amount: 5000.00,
      category: "Salary",
      date: "2025-01-15",
      description: "Monthly salary payment from TechCorp Inc.",
      timestamp: "2025-01-15T09:00:00.000Z"
    },
    {
      id: 2,
      type: "expense",
      amount: 1200.00,
      category: "Bills & Utilities",
      date: "2025-01-14",
      description: "Monthly rent payment for apartment",
      timestamp: "2025-01-14T10:30:00.000Z"
    },
    {
      id: 3,
      type: "expense",
      amount: 85.50,
      category: "Food & Dining",
      date: "2025-01-13",
      description: "Grocery shopping at Whole Foods Market",
      timestamp: "2025-01-13T16:45:00.000Z"
    },
    {
      id: 4,
      type: "income",
      amount: 750.00,
      category: "Freelance",
      date: "2025-01-12",
      description: "Web development project completion payment",
      timestamp: "2025-01-12T14:20:00.000Z"
    },
    {
      id: 5,
      type: "expense",
      amount: 45.00,
      category: "Transportation",
      date: "2025-01-11",
      description: "Gas station fill-up for weekly commute",
      timestamp: "2025-01-11T08:15:00.000Z"
    },
    {
      id: 6,
      type: "expense",
      amount: 299.99,
      category: "Shopping",
      date: "2025-01-10",
      description: "New laptop accessories and office supplies",
      timestamp: "2025-01-10T13:30:00.000Z"
    },
    {
      id: 7,
      type: "income",
      amount: 200.00,
      category: "Investment Returns",
      date: "2025-01-09",
      description: "Quarterly dividend payment from stock portfolio",
      timestamp: "2025-01-09T11:00:00.000Z"
    },
    {
      id: 8,
      type: "expense",
      amount: 65.00,
      category: "Entertainment",
      date: "2025-01-08",
      description: "Movie tickets and dinner with friends",
      timestamp: "2025-01-08T19:45:00.000Z"
    },
    {
      id: 9,
      type: "expense",
      amount: 120.00,
      category: "Healthcare",
      date: "2025-01-07",
      description: "Annual dental checkup and cleaning",
      timestamp: "2025-01-07T15:30:00.000Z"
    },
    {
      id: 10,
      type: "expense",
      amount: 89.99,
      category: "Bills & Utilities",
      date: "2025-01-06",
      description: "Monthly internet and cable service payment",
      timestamp: "2025-01-06T12:00:00.000Z"
    }
  ]);

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

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
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
      filtered = filtered?.filter(transaction => transaction?.category === filters?.category);
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
    const sorted = [...filteredTransactions];
    
    sorted?.sort((a, b) => {
      let aValue = a?.[sortConfig?.field];
      let bValue = b?.[sortConfig?.field];

      // Handle different data types
      if (sortConfig?.field === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortConfig?.field === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
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
      return total + (transaction?.type === 'income' ? transaction?.amount : -transaction?.amount);
    }, 0);
  }, [filteredTransactions]);

  // Handle adding new transaction
  const handleAddTransaction = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Handle editing transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // Handle saving edited transaction
  const handleSaveTransaction = (updatedTransaction) => {
    setTransactions(prev =>
      prev?.map(transaction =>
        transaction?.id === updatedTransaction?.id ? updatedTransaction : transaction
      )
    );
  };

  // Handle deleting transaction
  const handleDeleteTransaction = (transactionId) => {
    setTransactions(prev => prev?.filter(transaction => transaction?.id !== transactionId));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle sort changes
  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
  };

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