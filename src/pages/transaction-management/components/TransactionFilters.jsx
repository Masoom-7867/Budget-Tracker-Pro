import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { formatCurrency } from '../../../utils/currency';

const TransactionFilters = ({ 
  filters, 
  onFilterChange, 
  categories, 
  totalFilteredAmount,
  filteredCount,
  totalCount 
}) => {
  const transactionTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  // Use category IDs instead of names
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }))
  ];

  const handleFilterChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      type: '',
      category: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
            <Icon name="Filter" size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Filter Transactions</h3>
            <p className="text-sm text-muted-foreground">
              Showing {filteredCount} of {totalCount} transactions
            </p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Input
          label="Search"
          type="search"
          placeholder="Search descriptions..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <Select
          label="Transaction Type"
          options={transactionTypeOptions}
          value={filters.type}
          onChange={(value) => handleFilterChange('type', value)}
        />

        <Select
          label="Category"
          options={categoryOptions}
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          label="From Date"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        />

        <Input
          label="To Date"
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
        />
      </div>
      {/* Filter Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2 sm:mb-0">
          <span>Results: {filteredCount} transactions</span>
          {totalFilteredAmount !== null && (
            <span className={`font-medium ${
              totalFilteredAmount >= 0 ? 'text-success' : 'text-error'
            }`}>
              Total: {totalFilteredAmount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalFilteredAmount))}
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center space-x-2 text-sm text-accent">
            <Icon name="FilterX" size={16} />
            <span>Filters applied</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionFilters;