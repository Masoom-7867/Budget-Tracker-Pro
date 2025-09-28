import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import BudgetSummaryCard from './components/BudgetSummaryCard';
import BudgetCategoryCard from './components/BudgetCategoryCard';
import BudgetModal from './components/BudgetModal';
import BudgetFilters from './components/BudgetFilters';

const BudgetGoals = () => {
  const [budgetGoals, setBudgetGoals] = useState([]);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    sortBy: 'name-asc'
  });

  // Mock categories data
  const mockCategories = [
    { id: 1, name: 'Groceries', type: 'Expense', icon: 'ShoppingCart', color: '#059669' },
    { id: 2, name: 'Transportation', type: 'Expense', icon: 'Car', color: '#2563EB' },
    { id: 3, name: 'Entertainment', type: 'Expense', icon: 'Film', color: '#7C3AED' },
    { id: 4, name: 'Utilities', type: 'Expense', icon: 'Zap', color: '#D97706' },
    { id: 5, name: 'Healthcare', type: 'Expense', icon: 'Heart', color: '#DC2626' },
    { id: 6, name: 'Dining Out', type: 'Expense', icon: 'Coffee', color: '#0F766E' },
    { id: 7, name: 'Shopping', type: 'Expense', icon: 'ShoppingBag', color: '#BE185D' },
    { id: 8, name: 'Education', type: 'Expense', icon: 'BookOpen', color: '#1D4ED8' }
  ];

  // Mock budget goals data
  const mockBudgetGoals = [
    // {
    //   id: 1,
    //   categoryId: 1,
    //   name: 'Groceries',
    //   budgetedAmount: 800,
    //   spentAmount: 520,
    //   timePeriod: 'monthly',
    //   icon: 'ShoppingCart',
    //   color: '#059669'
    // },
    // {
    //   id: 2,
    //   categoryId: 2,
    //   name: 'Transportation',
    //   budgetedAmount: 400,
    //   spentAmount: 280,
    //   timePeriod: 'monthly',
    //   icon: 'Car',
    //   color: '#2563EB'
    // },
    // {
    //   id: 3,
    //   categoryId: 3,
    //   name: 'Entertainment',
    //   budgetedAmount: 300,
    //   spentAmount: 350,
    //   timePeriod: 'monthly',
    //   icon: 'Film',
    //   color: '#7C3AED'
    // },
    // {
    //   id: 4,
    //   categoryId: 4,
    //   name: 'Utilities',
    //   budgetedAmount: 250,
    //   spentAmount: 220,
    //   timePeriod: 'monthly',
    //   icon: 'Zap',
    //   color: '#D97706'
    // },
    // {
    //   id: 5,
    //   categoryId: 5,
    //   name: 'Healthcare',
    //   budgetedAmount: 200,
    //   spentAmount: 150,
    //   timePeriod: 'monthly',
    //   icon: 'Heart',
    //   color: '#DC2626'
    // },
    // {
    //   id: 6,
    //   categoryId: 6,
    //   name: 'Dining Out',
    //   budgetedAmount: 400,
    //   spentAmount: 480,
    //   timePeriod: 'monthly',
    //   icon: 'Coffee',
    //   color: '#0F766E'
    // }
  ];

  useEffect(() => {
    setBudgetGoals(mockBudgetGoals);
  }, []);

  const calculateTotals = () => {
    const totalBudget = budgetGoals?.reduce((sum, goal) => sum + goal?.budgetedAmount, 0);
    const totalSpent = budgetGoals?.reduce((sum, goal) => sum + goal?.spentAmount, 0);
    const remainingBalance = totalBudget - totalSpent;
    const completionPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return { totalBudget, totalSpent, remainingBalance, completionPercentage };
  };

  const getFilteredAndSortedBudgets = () => {
    let filtered = [...budgetGoals];

    // Apply category filter
    if (filters?.category) {
      filtered = filtered?.filter(budget => budget?.categoryId?.toString() === filters?.category);
    }

    // Apply status filter
    if (filters?.status) {
      filtered = filtered?.filter(budget => {
        const progressPercentage = (budget?.spentAmount / budget?.budgetedAmount) * 100;
        switch (filters?.status) {
          case 'on-track':
            return progressPercentage <= 60;
          case 'warning':
            return progressPercentage > 60 && progressPercentage <= 80;
          case 'over-budget':
            return progressPercentage > 80;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'name-asc':
          return a?.name?.localeCompare(b?.name);
        case 'name-desc':
          return b?.name?.localeCompare(a?.name);
        case 'budget-asc':
          return a?.budgetedAmount - b?.budgetedAmount;
        case 'budget-desc':
          return b?.budgetedAmount - a?.budgetedAmount;
        case 'spent-asc':
          return a?.spentAmount - b?.spentAmount;
        case 'spent-desc':
          return b?.spentAmount - a?.spentAmount;
        case 'progress-asc':
          return (a?.spentAmount / a?.budgetedAmount) - (b?.spentAmount / b?.budgetedAmount);
        case 'progress-desc':
          return (b?.spentAmount / b?.budgetedAmount) - (a?.spentAmount / a?.budgetedAmount);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleToggleExpand = (budgetId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet?.has(budgetId)) {
        newSet?.delete(budgetId);
      } else {
        newSet?.add(budgetId);
      }
      return newSet;
    });
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget goal?')) {
      setBudgetGoals(prev => prev?.filter(budget => budget?.id !== budgetId));
      setExpandedCards(prev => {
        const newSet = new Set(prev);
        newSet?.delete(budgetId);
        return newSet;
      });
    }
  };

  const handleSaveBudget = (budgetData) => {
    const category = mockCategories?.find(cat => cat?.id?.toString() === budgetData?.categoryId);
    
    if (editingBudget) {
      setBudgetGoals(prev => prev?.map(budget => 
        budget?.id === editingBudget?.id 
          ? {
              ...budget,
              ...budgetData,
              name: category?.name || budget?.name,
              icon: category?.icon || budget?.icon,
              color: category?.color || budget?.color
            }
          : budget
      ));
    } else {
      const newBudget = {
        ...budgetData,
        id: Date.now(),
        name: category?.name || 'Unknown Category',
        spentAmount: 0,
        icon: category?.icon || 'Target',
        color: category?.color || '#6B7280'
      };
      setBudgetGoals(prev => [...prev, newBudget]);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      status: '',
      sortBy: 'name-asc'
    });
  };

  const { totalBudget, totalSpent, remainingBalance, completionPercentage } = calculateTotals();
  const filteredBudgets = getFilteredAndSortedBudgets();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 lg:pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Budget Goals</h1>
              <p className="text-muted-foreground mt-2">
                Track your spending against budget targets and achieve your financial goals
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                variant="default" 
                iconName="Plus" 
                iconPosition="left"
                onClick={handleAddBudget}
              >
                Add Budget Goal
              </Button>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="mb-8">
            <BudgetSummaryCard
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              remainingBalance={remainingBalance}
              completionPercentage={completionPercentage}
            />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <BudgetFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              categories={mockCategories}
            />
          </div>

          {/* Budget Categories */}
          <div className="space-y-4">
            {filteredBudgets?.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                  <Icon name="Target" size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Budget Goals Found</h3>
                <p className="text-muted-foreground mb-6">
                  {budgetGoals?.length === 0 
                    ? "Get started by creating your first budget goal to track your spending." :"No budget goals match your current filters. Try adjusting your search criteria."
                  }
                </p>
                {budgetGoals?.length === 0 ? (
                  <Button 
                    variant="default" 
                    iconName="Plus" 
                    iconPosition="left"
                    onClick={handleAddBudget}
                  >
                    Create Budget Goal
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    iconName="X" 
                    iconPosition="left"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredBudgets?.map((budget) => (
                <BudgetCategoryCard
                  key={budget?.id}
                  category={budget}
                  isExpanded={expandedCards?.has(budget?.id)}
                  onToggleExpand={() => handleToggleExpand(budget?.id)}
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                />
              ))
            )}
          </div>

          {/* Results Summary */}
          {filteredBudgets?.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBudgets?.length} of {budgetGoals?.length} budget goals
              </p>
            </div>
          )}
        </div>
      </main>
      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBudget}
        editingBudget={editingBudget}
        categories={mockCategories}
      />
    </div>
  );
};

export default BudgetGoals;