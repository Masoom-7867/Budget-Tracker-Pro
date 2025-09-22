import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import CategoryStats from './components/CategoryStats';
import CategorySection from './components/CategorySection';

const CategoryManager = () => {
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeSearchTerm, setIncomeSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');

  // Mock data for categories
  useEffect(() => {
    const mockIncomeCategories = [
      {
        id: 1,
        name: 'Salary',
        description: 'Monthly salary from employment',
        icon: 'Briefcase',
        type: 'income',
        transactionCount: 12,
        lastUsed: '2 days ago'
      },
      {
        id: 2,
        name: 'Freelance',
        description: 'Income from freelance projects',
        icon: 'Laptop',
        type: 'income',
        transactionCount: 8,
        lastUsed: '1 week ago'
      },
      {
        id: 3,
        name: 'Investment Returns',
        description: 'Dividends and capital gains',
        icon: 'TrendingUp',
        type: 'income',
        transactionCount: 5,
        lastUsed: '3 days ago'
      },
      {
        id: 4,
        name: 'Side Business',
        description: 'Income from side business ventures',
        icon: 'Store',
        type: 'income',
        transactionCount: 15,
        lastUsed: '1 day ago'
      },
      {
        id: 5,
        name: 'Rental Income',
        description: 'Monthly rental from properties',
        icon: 'Home',
        type: 'income',
        transactionCount: 6,
        lastUsed: '5 days ago'
      }
    ];

    const mockExpenseCategories = [
      {
        id: 6,
        name: 'Food & Dining',
        description: 'Groceries, restaurants, and food delivery',
        icon: 'Utensils',
        type: 'expense',
        transactionCount: 45,
        lastUsed: '1 hour ago'
      },
      {
        id: 7,
        name: 'Transportation',
        description: 'Gas, public transport, and ride-sharing',
        icon: 'Car',
        type: 'expense',
        transactionCount: 28,
        lastUsed: '3 hours ago'
      },
      {
        id: 8,
        name: 'Housing',
        description: 'Rent, mortgage, and utilities',
        icon: 'Home',
        type: 'expense',
        transactionCount: 18,
        lastUsed: '2 days ago'
      },
      {
        id: 9,
        name: 'Entertainment',
        description: 'Movies, games, and recreational activities',
        icon: 'Gamepad2',
        type: 'expense',
        transactionCount: 22,
        lastUsed: '4 hours ago'
      },
      {
        id: 10,
        name: 'Healthcare',
        description: 'Medical expenses and insurance',
        icon: 'Heart',
        type: 'expense',
        transactionCount: 12,
        lastUsed: '1 week ago'
      },
      {
        id: 11,
        name: 'Shopping',
        description: 'Clothing, electronics, and personal items',
        icon: 'ShoppingBag',
        type: 'expense',
        transactionCount: 35,
        lastUsed: '6 hours ago'
      },
      {
        id: 12,
        name: 'Education',
        description: 'Courses, books, and learning materials',
        icon: 'BookOpen',
        type: 'expense',
        transactionCount: 8,
        lastUsed: '3 days ago'
      },
      {
        id: 13,
        name: 'Travel',
        description: 'Vacation and business travel expenses',
        icon: 'Plane',
        type: 'expense',
        transactionCount: 6,
        lastUsed: '2 weeks ago'
      }
    ];

    setIncomeCategories(mockIncomeCategories);
    setExpenseCategories(mockExpenseCategories);
  }, []);

  const handleAddCategory = (categoryData) => {
    const newCategory = {
      id: Date.now(),
      ...categoryData,
      icon: categoryData?.type === 'income' ? 'DollarSign' : 'Minus',
      transactionCount: 0,
      lastUsed: 'Never'
    };

    if (categoryData?.type === 'income') {
      setIncomeCategories(prev => [...prev, newCategory]);
    } else {
      setExpenseCategories(prev => [...prev, newCategory]);
    }
  };

  const handleEditCategory = (id, updatedData) => {
    const updateCategories = (categories) =>
      categories?.map(cat =>
        cat?.id === id ? { ...cat, ...updatedData } : cat
      );

    setIncomeCategories(prev => updateCategories(prev));
    setExpenseCategories(prev => updateCategories(prev));
  };

  const handleDeleteCategory = (id) => {
    setIncomeCategories(prev => prev?.filter(cat => cat?.id !== id));
    setExpenseCategories(prev => prev?.filter(cat => cat?.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content */}
      <main className="pt-16 lg:pt-20 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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