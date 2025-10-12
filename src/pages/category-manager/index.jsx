import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import CategoryStats from './components/CategoryStats';
import CategorySection from './components/CategorySection';
import { supabase } from '../../lib/supabase';

const CategoryManager = () => {
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

  // Fetch categories from Supabase
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const normalizedData = data.map(normalizeCategory);
        const income = normalizedData.filter(cat => cat.type === 'income');
        const expense = normalizedData.filter(cat => cat.type === 'expense');
        
        setIncomeCategories(income);
        setExpenseCategories(expense);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories: ' + err.message);
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
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || null, // Use null instead of empty string
        icon: categoryData.icon || (categoryData.type === 'income' ? 'DollarSign' : 'Minus'),
        type: categoryData.type,
        transaction_count: 0,
        last_used: null
      };

      console.log('Sending to Supabase:', newCategory);

      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Category added successfully:', data);

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
      setError('Failed to add category: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEditCategory = async (id, updatedData) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .update({
          name: updatedData.name,
          description: updatedData.description
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

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
      setError('Failed to update category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIncomeCategories(prev => prev.filter(cat => cat.id !== id));
      setExpenseCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category: ' + err.message);
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