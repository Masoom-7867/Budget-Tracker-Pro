import { supabase } from '../lib/supabase';

export const budgetService = {
  // Categories
  async getCategories(userId) {
    try {
      console.log('🔄 budgetService.getCategories: Fetching for user', userId);
      
      const { data, error, count } = await supabase
        .from('categories')
        .select('*', { count: 'exact' }) // Get count for debugging
        .eq('user_id', userId)
        .order('name');

      console.log('📊 Supabase raw response:', { data, error, count });
      
      if (error) {
        console.error('❌ Supabase error in getCategories:', error);
        throw error;
      }

      console.log('✅ budgetService.getCategories: Success, found', data?.length, 'categories');
      console.log('📋 Categories data sample:', data?.slice(0, 2));
      
      return data || [];
    } catch (error) {
      console.error('❌ Error in budgetService.getCategories:', error);
      throw new Error('Failed to load categories: ' + error.message);
    }
  },

  // Test function to directly query categories
  async testCategoriesQuery(userId) {
    try {
      console.log('🧪 TEST: Direct categories query for user', userId);
      
      // Test 1: Basic query
      const { data: data1, error: error1 } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);
      
      console.log('🧪 Test 1 - Basic query:', { data1, error1 });

      // Test 2: Count only
      const { count, error: error2 } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      console.log('🧪 Test 2 - Count query:', { count, error2 });

      // Test 3: Without user filter (to see all categories)
      const { data: data3, error: error3 } = await supabase
        .from('categories')
        .select('*')
        .limit(5);
      
      console.log('🧪 Test 3 - All categories (limit 5):', { data3, error3 });

      return {
        basicQuery: { data: data1, error: error1 },
        count: count,
        allCategoriesSample: { data: data3, error: error3 }
      };
    } catch (error) {
      console.error('🧪 Test failed:', error);
      throw error;
    }
  },

  // ... rest of your budgetService methods remain the same
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
  }
};