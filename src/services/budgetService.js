import { supabase } from '../lib/supabase';

export const budgetService = {
  // Categories
  async getCategories(userId) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to load categories');
    }
  },

  async createCategory(categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  },

  async updateCategory(categoryId, updates) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  },

  async deleteCategory(categoryId) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  },

  // Transactions
  async getTransactions(userId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            type
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Normalize the data to include category information
      return (data || []).map(transaction => ({
        ...transaction,
        category_name: transaction.categories?.name,
        category_icon: transaction.categories?.icon,
        category_type: transaction.categories?.type
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to load transactions');
    }
  },

  async createTransaction(transactionData) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            type
          )
        `)
        .single();

      if (error) throw error;
      
      // Normalize the response
      return {
        ...data,
        category_name: data.categories?.name,
        category_icon: data.categories?.icon,
        category_type: data.categories?.type
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }
  },

  async updateTransaction(transactionId, updates) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            type
          )
        `)
        .single();

      if (error) throw error;
      
      // Normalize the response
      return {
        ...data,
        category_name: data.categories?.name,
        category_icon: data.categories?.icon,
        category_type: data.categories?.type
      };
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw new Error('Failed to update transaction');
    }
  },

  async deleteTransaction(transactionId) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  },

  // Budget Goals
  async getBudgetGoals(userId) {
    try {
      const { data, error } = await supabase
        .from('budget_goals')
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            type,
            color
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Calculate spent amount for each budget goal
      const budgetGoalsWithSpent = await Promise.all(
        (data || []).map(async (budget) => {
          // Get transactions for this category to calculate spent amount
          const { data: transactions } = await supabase
            .from('transactions')
            .select('amount')
            .eq('category_id', budget.category_id)
            .eq('user_id', userId)
            .eq('type', 'expense');

          const spentAmount = transactions?.reduce((sum, transaction) => 
            sum + (parseFloat(transaction.amount) || 0), 0
          ) || 0;

          return {
            ...budget,
            spent_amount: spentAmount
          };
        })
      );

      return budgetGoalsWithSpent;
    } catch (error) {
      console.error('Error fetching budget goals:', error);
      throw new Error('Failed to load budget goals');
    }
  },
// In budgetService.js - update the createBudgetGoal function:

// In budgetService.js - update the createBudgetGoal function:

async createBudgetGoal(budgetGoalData) {
  try {
    console.log('Creating budget goal with data:', budgetGoalData);
    
    // Calculate dates if not provided
    const startDate = budgetGoalData.start_date || new Date().toISOString().split('T')[0];
    let endDate = budgetGoalData.end_date;
    
    if (!endDate) {
      const end = new Date();
      switch (budgetGoalData.period) {
        case 'weekly':
          end.setDate(end.getDate() + 7);
          break;
        case 'monthly':
          end.setMonth(end.getMonth() + 1);
          break;
        case 'yearly':
          end.setFullYear(end.getFullYear() + 1);
          break;
        default:
          end.setMonth(end.getMonth() + 1);
      }
      endDate = end.toISOString().split('T')[0];
    }

    // Use budgeted_amount instead of amount to match your schema
    const dataToInsert = {
      ...budgetGoalData,
      budgeted_amount: parseFloat(budgetGoalData.amount || budgetGoalData.budgeted_amount) || 0,
      name: budgetGoalData.name || 'Budget Goal', // Ensure name is always provided
      start_date: startDate,
      end_date: endDate
    };
    
    // Remove the amount field if it exists to avoid schema errors
    delete dataToInsert.amount;

    const { data, error } = await supabase
      .from('budget_goals')
      .insert([dataToInsert])
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          type,
          color
        )
      `)
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }
    
    console.log('Budget goal created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating budget goal:', error);
    throw new Error('Failed to create budget goal: ' + error.message);
  }
},

  async updateBudgetGoal(goalId, updates) {
    try {
      // Use budgeted_amount instead of amount to match your schema
      const dataToUpdate = { ...updates };
      
      if (dataToUpdate.amount !== undefined) {
        dataToUpdate.budgeted_amount = parseFloat(dataToUpdate.amount) || 0;
        delete dataToUpdate.amount;
      }

      const { data, error } = await supabase
        .from('budget_goals')
        .update(dataToUpdate)
        .eq('id', goalId)
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            type,
            color
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating budget goal:', error);
      throw new Error('Failed to update budget goal');
    }
  },

  async deleteBudgetGoal(goalId) {
    try {
      const { error } = await supabase
        .from('budget_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting budget goal:', error);
      throw new Error('Failed to delete budget goal');
    }
  },

  // Real-time subscriptions
  subscribeToTransactions(userId, callback) {
    const subscription = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return () => subscription.unsubscribe();
  },

  subscribeToCategories(userId, callback) {
    const subscription = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return () => subscription.unsubscribe();
  },

  // Real-time subscription for budget goals
  subscribeToBudgetGoals(userId, callback) {
    const subscription = supabase
      .channel('budget-goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_goals',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }
};