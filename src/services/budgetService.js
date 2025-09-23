import { supabase } from '../lib/supabase';

export const budgetService = {
  // Categories
  async getCategories(userId, type = null) {
    try {
      let query = supabase?.from('categories')?.select('*')?.eq('user_id', userId)?.order('name');

      if (type) {
        query = query?.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async createCategory(categoryData) {
    try {
      const { data, error } = await supabase?.from('categories')?.insert(categoryData)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async updateCategory(categoryId, updates) {
    try {
      const { data, error } = await supabase?.from('categories')?.update(updates)?.eq('id', categoryId)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async deleteCategory(categoryId) {
    try {
      const { error } = await supabase?.from('categories')?.delete()?.eq('id', categoryId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Transactions
  async getTransactions(userId, filters = {}) {
    try {
      let query = supabase?.from('transactions')?.select(`
          *,
          category:categories(id, name, type, icon, color)
        `)?.eq('user_id', userId)?.order('date', { ascending: false });

      // Apply filters
      if (filters?.type) {
        query = query?.eq('type', filters?.type);
      }
      if (filters?.category_id) {
        query = query?.eq('category_id', filters?.category_id);
      }
      if (filters?.date_from) {
        query = query?.gte('date', filters?.date_from);
      }
      if (filters?.date_to) {
        query = query?.lte('date', filters?.date_to);
      }
      if (filters?.search) {
        query = query?.ilike('description', `%${filters?.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async createTransaction(transactionData) {
    try {
      const { data, error } = await supabase?.from('transactions')?.insert(transactionData)?.select(`
          *,
          category:categories(id, name, type, icon, color)
        `)?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async updateTransaction(transactionId, updates) {
    try {
      const { data, error } = await supabase?.from('transactions')?.update(updates)?.eq('id', transactionId)?.select(`
          *,
          category:categories(id, name, type, icon, color)
        `)?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async deleteTransaction(transactionId) {
    try {
      const { error } = await supabase?.from('transactions')?.delete()?.eq('id', transactionId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Budget Goals
  async getBudgetGoals(userId) {
    try {
      const { data, error } = await supabase?.from('budget_goals')?.select(`
          *,
          category:categories(id, name, type, icon, color)
        `)?.eq('user_id', userId)?.order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async createBudgetGoal(budgetGoalData) {
    try {
      const { data, error } = await supabase?.from('budget_goals')?.insert(budgetGoalData)?.select(`
          *,
          category:categories(id, name, type, icon, color)
        `)?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async updateBudgetGoal(budgetGoalId, updates) {
    try {
      const { data, error } = await supabase?.from('budget_goals')?.update(updates)?.eq('id', budgetGoalId)?.select(`
          *,
          category:categories(id, name, type, icon, color)
        `)?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async deleteBudgetGoal(budgetGoalId) {
    try {
      const { error } = await supabase?.from('budget_goals')?.delete()?.eq('id', budgetGoalId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Savings Goals
  async getSavingsGoals(userId) {
    try {
      const { data, error } = await supabase?.from('savings_goals')?.select('*')?.eq('user_id', userId)?.order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async createSavingsGoal(savingsGoalData) {
    try {
      const { data, error } = await supabase?.from('savings_goals')?.insert(savingsGoalData)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async updateSavingsGoal(savingsGoalId, updates) {
    try {
      const { data, error } = await supabase?.from('savings_goals')?.update(updates)?.eq('id', savingsGoalId)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async deleteSavingsGoal(savingsGoalId) {
    try {
      const { error } = await supabase?.from('savings_goals')?.delete()?.eq('id', savingsGoalId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Savings Transactions
  async getSavingsTransactions(userId, savingsGoalId = null) {
    try {
      let query = supabase?.from('savings_transactions')?.select(`
          *,
          savings_goal:savings_goals(id, name, icon, color)
        `)?.eq('user_id', userId)?.order('date', { ascending: false });

      if (savingsGoalId) {
        query = query?.eq('savings_goal_id', savingsGoalId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  async createSavingsTransaction(savingsTransactionData) {
    try {
      const { data, error } = await supabase?.from('savings_transactions')?.insert(savingsTransactionData)?.select(`
          *,
          savings_goal:savings_goals(id, name, icon, color)
        `)?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Real-time subscriptions
  subscribeToTransactions(userId, callback) {
    const channel = supabase?.channel('transactions_changes')?.on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  },

  subscribeToSavingsTransactions(userId, callback) {
    const channel = supabase?.channel('savings_transactions_changes')?.on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'savings_transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }
};