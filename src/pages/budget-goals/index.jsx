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
import MonthlyBudgetTab from './components/monthly/MonthlyBudgetTab';

const BudgetGoals = () => {
  const { user } = useAuth();
  const [budgetGoals, setBudgetGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'monthly'
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
      setError(''); // Clear error when starting to load
      
      // Load categories and budget goals concurrently
      const [categoriesData, budgetGoalsData] = await Promise.all([
        budgetService.getCategories(user.id),
        budgetService.getBudgetGoals(user.id)
      ]);

      setCategories(categoriesData || []);
      setBudgetGoals(budgetGoalsData || []);

    } catch (error) {
      console.error('Error loading budget data:', error);
      setError('Failed to load budget data: ' + error.message);
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
      const aName = a.name || a.categories?.name || 'Uncategorized';
      const bName = b.name || b.categories?.name || 'Uncategorized';

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
    console.log('Opening budget modal for adding new budget');
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget) => {
    console.log('Opening budget modal for editing:', budget);
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget goal?')) {
      try {
        await budgetService.deleteBudgetGoal(budgetId);
      } catch (error) {
        console.error('Error deleting budget goal:', error);
        setError('Failed to delete budget goal: ' + error.message);
      } finally {
        await loadBudgetData();
      }
    }
  };

  const handleSaveBudget = async (budgetData) => {
    console.log('Save budget called with data:', budgetData);
    
    try {
      setSaving(true);
      setError(''); // Clear previous errors
      
      // Validate required fields
      if (!budgetData.category_id || !budgetData.amount || !budgetData.period) {
        throw new Error('Please fill in all required fields');
      }

      // Find the category to generate a name
      const category = categories.find(cat => cat.id === budgetData.category_id);
      const budgetName = budgetData.name || `${category?.name || 'Category'} Budget`;

      // Set start_date to current date and calculate end_date based on period
      const startDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      let endDate = new Date();
      
      switch (budgetData.period) {
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
      }
      
      const endDateString = endDate.toISOString().split('T')[0];

      const budgetWithUser = {
        ...budgetData,
        user_id: user.id,
        // The service will convert 'amount' to 'budgeted_amount'
        amount: parseFloat(budgetData.amount),
        category_id: budgetData.category_id,
        period: budgetData.period,
        name: budgetName,
        start_date: startDate,
        end_date: endDateString
      };

      console.log('Saving budget goal with data:', budgetWithUser);

      if (editingBudget) {
        await budgetService.updateBudgetGoal(editingBudget.id, budgetWithUser);
        console.log('Budget goal updated successfully');
      } else {
        await budgetService.createBudgetGoal(budgetWithUser);
        console.log('Budget goal created successfully');
      }
      
      setIsModalOpen(false);
      setEditingBudget(null);
    } catch (error) {
      console.error('Error saving budget goal:', error);
      setError('Failed to save budget goal: ' + error.message);
    } finally {
      // Always reload, even on error: the insert/update can succeed in the
      // database but still throw here (e.g. the response's embedded
      // categories join failing) - in that case the goal is actually saved,
      // so without an unconditional reload here it would only show up after
      // a full browser refresh, not immediately in the list.
      await loadBudgetData();
      setSaving(false);
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

  // Format budget data for display
  const getBudgetDisplayData = (budget) => {
    const category = categories.find(cat => cat.id === budget.category_id);
    const budgetAmount = parseFloat(budget.budgeted_amount) || 0;
    const spentAmount = parseFloat(budget.spent_amount) || 0;
    
    return {
      id: budget.id,
      categoryId: budget.category_id,
      name: budget.name || category?.name || 'Uncategorized',
      budgetedAmount: budgetAmount,
      spentAmount: spentAmount,
      timePeriod: budget.period || 'monthly',
      icon: category?.icon || 'Target',
      color: category?.color || '#6B7280',
      category: category, // Include full category data
      startDate: budget.start_date,
      endDate: budget.end_date
    };
  };

  const { totalBudget, totalSpent, remainingBalance, completionPercentage } = calculateTotals();
  const filteredBudgets = getFilteredAndSortedBudgets();

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
              {activeTab === 'list' && (
                <Button 
                  variant="default" 
                  iconName="Plus" 
                  iconPosition="left"
                  onClick={handleAddBudget}
                >
                  Add Budget Goal
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'list' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Budget List
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'monthly' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly Breakdown (50/30/20)
            </button>
          </div>

          {activeTab === 'list' && (
          <>
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
                Showing {filteredBudgets.length} of {budgetGoals.length} budget goal{filteredBudgets.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          </>
          )}

          {activeTab === 'monthly' && (
            <MonthlyBudgetTab userId={user?.id} categories={categories} />
          )}
        </div>
      </main>

      {/* Budget Modal */}
      {isModalOpen && (
        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => {
            console.log('Closing budget modal');
            setIsModalOpen(false);
            setEditingBudget(null);
            setError(''); // Clear errors when closing
          }}
          onSave={handleSaveBudget}
          editingBudget={editingBudget}
          categories={categories}
          saving={saving}
        />
      )}
    </div>
  );
};

export default BudgetGoals;