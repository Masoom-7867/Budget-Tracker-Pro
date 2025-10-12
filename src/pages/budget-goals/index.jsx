import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { budgetService } from '../../services/budgetService';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import BudgetSummaryCard from './components/BudgetSummaryCard';
import BudgetCategoryCard from './components/BudgetCategoryCard';
import BudgetModal from './components/BudgetModal';
import BudgetFilters from './components/BudgetFilters';

const BudgetGoals = () => {
  const { user } = useAuth();
  const [budgetGoals, setBudgetGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    sortBy: 'name-asc'
  });

  useEffect(() => {
    if (user?.id) {
      loadBudgetData();
      
      // Set up real-time subscription
      const unsubscribe = budgetService.subscribeToBudgetGoals?.(
        user.id,
        (payload) => {
          loadBudgetData(); // Reload data when budget goals change
        }
      );

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user?.id]);

  const loadBudgetData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      // Load categories and budget goals concurrently
      const [categoriesData, budgetGoalsData] = await Promise.all([
        budgetService.getCategories(user.id),
        budgetService.getBudgetGoals(user.id)
      ]);

      setCategories(categoriesData || []);
      setBudgetGoals(budgetGoalsData || []);

    } catch (error) {
      console.error('Error loading budget data:', error);
      setError(error.message || 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalBudget = budgetGoals.reduce((sum, goal) => {
      const budgetAmount = parseFloat(goal.budgeted_amount) || 0;
      return sum + budgetAmount;
    }, 0);

    const totalSpent = budgetGoals.reduce((sum, goal) => {
      // Calculate spent amount from transactions (you might need to enhance this)
      const spentAmount = parseFloat(goal.spent_amount) || 0;
      return sum + spentAmount;
    }, 0);

    const remainingBalance = totalBudget - totalSpent;
    const completionPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return { totalBudget, totalSpent, remainingBalance, completionPercentage };
  };

  const getFilteredAndSortedBudgets = () => {
    let filtered = [...budgetGoals];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(budget => 
        budget.category_id?.toString() === filters.category
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(budget => {
        const budgetAmount = parseFloat(budget.budgeted_amount) || 0;
        const spentAmount = parseFloat(budget.spent_amount) || 0;
        const progressPercentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
        
        switch (filters.status) {
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
    filtered.sort((a, b) => {
      const aBudget = parseFloat(a.budgeted_amount) || 0;
      const bBudget = parseFloat(b.budgeted_amount) || 0;
      const aSpent = parseFloat(a.spent_amount) || 0;
      const bSpent = parseFloat(b.spent_amount) || 0;
      const aProgress = aBudget > 0 ? (aSpent / aBudget) : 0;
      const bProgress = bBudget > 0 ? (bSpent / bBudget) : 0;
      const aName = a.categories?.name || 'Uncategorized';
      const bName = b.categories?.name || 'Uncategorized';

      switch (filters.sortBy) {
        case 'name-asc':
          return aName.localeCompare(bName);
        case 'name-desc':
          return bName.localeCompare(aName);
        case 'budget-asc':
          return aBudget - bBudget;
        case 'budget-desc':
          return bBudget - aBudget;
        case 'spent-asc':
          return aSpent - bSpent;
        case 'spent-desc':
          return bSpent - aSpent;
        case 'progress-asc':
          return aProgress - bProgress;
        case 'progress-desc':
          return bProgress - aProgress;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleToggleExpand = (budgetId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(budgetId)) {
        newSet.delete(budgetId);
      } else {
        newSet.add(budgetId);
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

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget goal?')) {
      try {
        await budgetService.deleteBudgetGoal(budgetId);
        // The real-time subscription will update the list automatically
      } catch (error) {
        console.error('Error deleting budget goal:', error);
        setError('Failed to delete budget goal: ' + error.message);
      }
    }
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      const budgetWithUser = {
        ...budgetData,
        user_id: user.id
      };

      if (editingBudget) {
        await budgetService.updateBudgetGoal(editingBudget.id, budgetWithUser);
      } else {
        await budgetService.createBudgetGoal(budgetWithUser);
      }
      
      setIsModalOpen(false);
      setEditingBudget(null);
      // The real-time subscription will update the list automatically
    } catch (error) {
      console.error('Error saving budget goal:', error);
      setError('Failed to save budget goal: ' + error.message);
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

  // Format budget data for display
  const getBudgetDisplayData = (budget) => {
    const category = categories.find(cat => cat.id === budget.category_id);
    const budgetAmount = parseFloat(budget.budgeted_amount) || 0;
    const spentAmount = parseFloat(budget.spent_amount) || 0;
    
    return {
      id: budget.id,
      categoryId: budget.category_id,
      name: category?.name || 'Uncategorized',
      budgetedAmount: budgetAmount,
      spentAmount: spentAmount,
      timePeriod: budget.period || 'monthly',
      icon: category?.icon || 'Target',
      color: category?.color || '#6B7280',
      category: category // Include full category data
    };
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
                <p className="text-muted-foreground">Loading budget goals...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 lg:pt-16 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-red-800 font-medium mb-2">Error Loading Budget Goals</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={loadBudgetData}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Try Again
              </button>
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

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} color="var(--color-error)" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="text-red-600 text-xs mt-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

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
              categories={categories}
            />
          </div>

          {/* Budget Categories */}
          <div className="space-y-4">
            {filteredBudgets.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                  <Icon name="Target" size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {budgetGoals.length === 0 ? 'No Budget Goals Yet' : 'No Budget Goals Found'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {budgetGoals.length === 0 
                    ? "Get started by creating your first budget goal to track your spending."
                    : "No budget goals match your current filters. Try adjusting your search criteria."
                  }
                </p>
                {budgetGoals.length === 0 ? (
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
              filteredBudgets.map((budget) => (
                <BudgetCategoryCard
                  key={budget.id}
                  category={getBudgetDisplayData(budget)}
                  isExpanded={expandedCards.has(budget.id)}
                  onToggleExpand={() => handleToggleExpand(budget.id)}
                  onEdit={() => handleEditBudget(budget)}
                  onDelete={() => handleDeleteBudget(budget.id)}
                />
              ))
            )}
          </div>

          {/* Results Summary */}
          {filteredBudgets.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBudgets.length} of {budgetGoals.length} budget goals
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        editingBudget={editingBudget}
        categories={categories}
      />
    </div>
  );
};

export default BudgetGoals;