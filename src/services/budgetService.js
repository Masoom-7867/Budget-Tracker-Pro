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

  async createBudgetGoal(budgetGoalData) {
    try {
      console.log('Creating budget goal with data:', budgetGoalData);
      
      // Use budgeted_amount instead of amount to match your schema
      const dataToInsert = {
        ...budgetGoalData,
        budgeted_amount: parseFloat(budgetGoalData.amount || budgetGoalData.budgeted_amount) || 0,
        name: budgetGoalData.name || 'Budget Goal', // Ensure name is always provided
        start_date: budgetGoalData.start_date || new Date().toISOString().split('T')[0],
        end_date: budgetGoalData.end_date || this.calculateEndDate(budgetGoalData.period)
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

  // Savings Transactions
  async getSavingsTransactions(userId) {
    try {
      const { data, error } = await supabase
        .from('savings_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching savings transactions:', error);
      throw new Error('Failed to load savings transactions');
    }
  },

  async createSavingsTransaction(transactionData) {
    try {
      console.log('Creating savings transaction with data:', transactionData);
      
      const { data, error } = await supabase
        .from('savings_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating savings transaction:', error);
        throw error;
      }
      
      console.log('Savings transaction created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating savings transaction:', error);
      throw new Error('Failed to create savings transaction: ' + error.message);
    }
  },

  async deleteSavingsTransaction(transactionId) {
    try {
      const { error } = await supabase
        .from('savings_transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting savings transaction:', error);
      throw new Error('Failed to delete savings transaction');
    }
  },

  // Savings Goals
  async getSavingsGoals(userId) {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      throw new Error('Failed to load savings goals');
    }
  },

  async createSavingsGoal(goalData) {
    try {
      console.log('Creating savings goal with data:', goalData);
      
      // Use the correct column names including monthly_contribution
      const dataToInsert = {
        user_id: goalData.user_id,
        name: goalData.name,
        description: goalData.description || '',
        target_amount: parseFloat(goalData.target_amount) || 0,
        current_amount: 0, // Always start at 0
        monthly_contribution: parseFloat(goalData.monthly_contribution) || 0,
        icon: goalData.icon || 'Target'
      };

      console.log('Processed savings goal data for insertion:', dataToInsert);

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating savings goal:', error);
        console.error('Error details:', error.details, error.hint, error.message);
        throw error;
      }
      
      console.log('Savings goal created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating savings goal:', error);
      throw new Error('Failed to create savings goal: ' + error.message);
    }
  },

  async updateSavingsGoal(goalId, updates) {
    try {
      console.log('Updating savings goal:', goalId, 'with data:', updates);
      
      // Process numeric fields including monthly_contribution
      const dataToUpdate = {};
      if (updates.name !== undefined) dataToUpdate.name = updates.name;
      if (updates.description !== undefined) dataToUpdate.description = updates.description;
      if (updates.target_amount !== undefined) dataToUpdate.target_amount = parseFloat(updates.target_amount) || 0;
      if (updates.current_amount !== undefined) dataToUpdate.current_amount = parseFloat(updates.current_amount) || 0;
      if (updates.monthly_contribution !== undefined) dataToUpdate.monthly_contribution = parseFloat(updates.monthly_contribution) || 0;
      if (updates.icon !== undefined) dataToUpdate.icon = updates.icon;

      const { data, error } = await supabase
        .from('savings_goals')
        .update(dataToUpdate)
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating savings goal:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw new Error('Failed to update savings goal: ' + error.message);
    }
  },

  async deleteSavingsGoal(goalId) {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      throw new Error('Failed to delete savings goal');
    }
  },

  // Helper function to calculate end date
  calculateEndDate(period) {
    const endDate = new Date();
    
    switch (period) {
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
        endDate.setMonth(endDate.getMonth() + 1);
    }
    
    return endDate.toISOString().split('T')[0];
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
  },

  subscribeToSavingsTransactions(userId, callback) {
    const subscription = supabase
      .channel('savings-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'savings_transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return () => subscription.unsubscribe();
  },

  subscribeToSavingsGoals(userId, callback) {
    const subscription = supabase
      .channel('savings-goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'savings_goals',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }
};