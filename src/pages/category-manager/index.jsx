import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import CategoryStats from './components/CategoryStats';
import CategorySection from './components/CategorySection';
import { useAuth } from '../../contexts/AuthContext';
import { budgetService } from '../../services/budgetService';

const CategoryManager = () => {
  const { user } = useAuth();
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeSearchTerm, setIncomeSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format last used date for display
  const formatLastUsed = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch (err) {
      return 'Never';
    }
  };

  // Normalize category data for components
  const normalizeCategory = (category) => ({
    ...category,
    transactionCount: category.transaction_count || 0,
    lastUsed: formatLastUsed(category.last_used)
  });

  // Fetch categories from Supabase (scoped to the signed-in user, via the
  // shared budgetService so every page talks to the DB the same way)
  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await budgetService.getCategories(user.id);

      const normalizedData = (data || []).map(normalizeCategory);
      const income = normalizedData.filter(cat => cat.type === 'income');
      const expense = normalizedData.filter(cat => cat.type === 'expense');

      setIncomeCategories(income);
      setExpenseCategories(expense);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (categoryData) => {
    try {
      setError(null);
      console.log('Adding category:', categoryData);

      // Validate required fields
      if (!categoryData.name || !categoryData.name.trim()) {
        throw new Error('Category name is required');
      }

      if (!categoryData.type) {
        throw new Error('Category type is required');
      }

      const newCategory = {
        user_id: user.id, // required: RLS policy checks user_id = auth.uid()
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || null,
        icon: categoryData.icon || (categoryData.type === 'income' ? 'DollarSign' : 'Minus'),
        type: categoryData.type
        // Note: `transaction_count` / `last_used` are NOT real columns on
        // this table (there's no UI to set them either) - don't send them.
      };

      const data = await budgetService.createCategory(newCategory);

      if (data) {
        const normalizedCategory = normalizeCategory(data);
        if (data.type === 'income') {
          setIncomeCategories(prev => [...prev, normalizedCategory]);
        } else {
          setExpenseCategories(prev => [...prev, normalizedCategory]);
        }
      }
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.message || 'Failed to add category');
    }
  };

  const handleEditCategory = async (id, updatedData) => {
    try {
      setError(null);

      const data = await budgetService.updateCategory(id, {
        name: updatedData.name,
        description: updatedData.description,
        icon: updatedData.icon
      });

      if (data) {
        const normalizedCategory = normalizeCategory(data);
        const updateCategories = (categories) =>
          categories.map(cat =>
            cat.id === id ? { ...cat, ...normalizedCategory } : cat
          );

        setIncomeCategories(prev => updateCategories(prev));
        setExpenseCategories(prev => updateCategories(prev));
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      setError(null);

      await budgetService.deleteCategory(id);

      setIncomeCategories(prev => prev.filter(cat => cat.id !== id));
      setExpenseCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-20 flex justify-center items-center min-h-[200px]">
          <div className="text-lg text-muted-foreground">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content */}
      <main className="pt-16 lg:pt-20 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Category Manager</h1>
            <p className="text-muted-foreground">
              Organize and customize your income and expense categories for better financial tracking.
            </p>
          </div>

          {/* Category Stats */}
          <CategoryStats 
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
          />

          {/* Category Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Income Categories */}
            <CategorySection
              title="Income Categories"
              categories={incomeCategories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              searchTerm={incomeSearchTerm}
              onSearchChange={setIncomeSearchTerm}
              type="income"
            />

            {/* Expense Categories */}
            <CategorySection
              title="Expense Categories"
              categories={expenseCategories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              searchTerm={expenseSearchTerm}
              onSearchChange={setExpenseSearchTerm}
              type="expense"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CategoryManager;