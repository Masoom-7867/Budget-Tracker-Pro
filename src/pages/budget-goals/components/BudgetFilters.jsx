import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BudgetFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  categories = [] 
}) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'on-track', label: 'On Track' },
    { value: 'warning', label: 'Warning' },
    { value: 'over-budget', label: 'Over Budget' }
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'budget-asc', label: 'Budget (Low to High)' },
    { value: 'budget-desc', label: 'Budget (High to Low)' },
    { value: 'spent-asc', label: 'Spent (Low to High)' },
    { value: 'spent-desc', label: 'Spent (High to Low)' },
    { value: 'progress-asc', label: 'Progress (Low to High)' },
    { value: 'progress-desc', label: 'Progress (High to Low)' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories?.map(category => ({
      value: category?.id,
      label: category?.name
    }))
  ];

  const hasActiveFilters = filters?.category || filters?.status || filters?.sortBy !== 'name-asc';

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground flex items-center">
          <Icon name="Filter" size={18} className="mr-2" />
          Filters & Sorting
        </h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            iconName="X" 
            iconPosition="left"
            onClick={onClearFilters}
          >
            Clear All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Category"
          placeholder="Filter by category"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => onFilterChange('category', value)}
          clearable
        />

        <Select
          label="Status"
          placeholder="Filter by status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
          clearable
        />

        <Select
          label="Sort By"
          placeholder="Sort budgets"
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => onFilterChange('sortBy', value)}
        />
      </div>
    </div>
  );
};

export default BudgetFilters;