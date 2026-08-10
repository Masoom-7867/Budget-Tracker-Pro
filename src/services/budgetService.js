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
          ),
          accounts (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Normalize the data to include category and account information
      return (data || []).map(transaction => ({
        ...transaction,
        category_name: transaction.categories?.name,
        category_icon: transaction.categories?.icon,
        category_type: transaction.categories?.type,
        account_name: transaction.accounts?.name,
        account_icon: transaction.accounts?.icon,
        account_color: transaction.accounts?.color
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
  async getBudgetGoals(userId, month, year) {
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

      // Default to the current calendar month so "spent" reflects this
      // month's activity, not the category's entire transaction history.
      const now = new Date();
      const targetMonth = month || now.getMonth() + 1;
      const targetYear = year || now.getFullYear();
      const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(targetYear, targetMonth, 0).getDate();
      const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // Calculate spent amount for each budget goal, scoped to that month
      const budgetGoalsWithSpent = await Promise.all(
        (data || []).map(async (budget) => {
          // Get this month's transactions for this category to calculate spent amount
          const { data: transactions } = await supabase
            .from('transactions')
            .select('amount')
            .eq('category_id', budget.category_id)
            .eq('user_id', userId)
            .eq('type', 'expense')
            .gte('date', startDate)
            .lte('date', endDate);

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

  // Bulk insert used by CSV import - one round trip instead of one per row.
  async createTransactionsBulk(transactionsData) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionsData)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error bulk creating transactions:', error);
      throw error;
    }
  },



  // =====================================
  // Accounts
  // =====================================

  async getAccounts(userId) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new Error('Failed to load accounts');
    }
  },

  // Ensures the special single 'savings' account always exists for a user,
  // since it represents the existing Savings Tracker feature rather than
  // something the user creates themselves. Returns it either way.
  async ensureSavingsAccount(userId) {
    try {
      const { data: existing, error: findError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'savings')
        .maybeSingle();

      if (findError) throw findError;
      if (existing) return existing;

      const { data: created, error: createError } = await supabase
        .from('accounts')
        .insert([{ user_id: userId, name: 'Savings', type: 'savings', icon: 'PiggyBank', color: '#059669' }])
        .select()
        .single();

      if (createError) throw createError;
      return created;
    } catch (error) {
      console.error('Error ensuring savings account:', error);
      throw new Error('Failed to load savings account');
    }
  },

  async createAccount(accountData) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating account:', error);
      throw new Error('Failed to create account');
    }
  },

  async updateAccount(id, updates) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating account:', error);
      throw new Error('Failed to update account');
    }
  },

  async deleteAccount(id) {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Failed to delete account');
    }
  },

  async getMonthlyBudget(userId, month, year) {
    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (error) throw error;
      return data; // null if this month hasn't been set up yet
    } catch (error) {
      console.error('Error fetching monthly budget:', error);
      throw error;
    }
  },

  async upsertMonthlyBudget(userId, month, year, monthlyIncome) {
    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .upsert(
          { user_id: userId, month, year, monthly_income: monthlyIncome },
          { onConflict: 'user_id,month,year' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving monthly budget:', error);
      throw error;
    }
  },

  async getBudgetLineItems(monthlyBudgetId) {
    try {
      const { data, error } = await supabase
        .from('budget_line_items')
        .select('*')
        .eq('monthly_budget_id', monthlyBudgetId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching budget line items:', error);
      throw error;
    }
  },

  async createBudgetLineItem(lineItem) {
    try {
      const { data, error } = await supabase
        .from('budget_line_items')
        .insert([lineItem])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating budget line item:', error);
      throw error;
    }
  },

  async updateBudgetLineItem(id, updates) {
    try {
      const { data, error } = await supabase
        .from('budget_line_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating budget line item:', error);
      throw error;
    }
  },

  async deleteBudgetLineItem(id) {
    try {
      const { error } = await supabase
        .from('budget_line_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting budget line item:', error);
      throw error;
    }
  },

  // Transactions within a given calendar month, used to auto-match line
  // items against what's actually been paid (for "date paid" + on-track).
  async getTransactionsByMonth(userId, month, year) {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions for month:', error);
      throw error;
    }
  },

  // =====================================
  // Net Worth Trend (account balance snapshots)
  // =====================================

  // Captures/updates this month's balance snapshot for every account the
  // user has, so a trend line can be built over time. Safe to call
  // repeatedly - upserts on (account_id, year, month), so calling it again
  // within the same month just keeps that month's figure current rather
  // than creating duplicates.
  async ensureCurrentMonthSnapshots(userId) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const accounts = await this.getAccounts(userId);
      if (!accounts.length) return;

      // The Savings account's `balance` column is intentionally never kept
      // in sync (see ensureSavingsAccount) - its real balance always comes
      // from savings_transactions, so compute that here rather than using
      // the stale column value.
      let savingsBalance = null;
      const hasSavingsAccount = accounts.some((a) => a.type === 'savings');
      if (hasSavingsAccount) {
        const savingsTransactions = await this.getSavingsTransactions(userId);
        savingsBalance = (savingsTransactions || []).reduce((bal, t) => {
          const amount = parseFloat(t.amount) || 0;
          return t.type === 'deposit' ? bal + amount : bal - amount;
        }, 0);
      }

      const snapshots = accounts.map((account) => ({
        user_id: userId,
        account_id: account.id,
        year,
        month,
        balance: account.type === 'savings' ? savingsBalance : (Number(account.balance) || 0)
      }));

      const { error } = await supabase
        .from('account_balance_snapshots')
        .upsert(snapshots, { onConflict: 'account_id,year,month' });

      if (error) throw error;
    } catch (error) {
      // Non-fatal: the Net Worth report just has a gap for this month if
      // this fails, so don't block the rest of the Reports page over it.
      console.error('Error capturing account balance snapshots:', error);
    }
  },

  async getBalanceSnapshots(userId) {
    try {
      const { data, error } = await supabase
        .from('account_balance_snapshots')
        .select(`
          *,
          accounts (
            id,
            name,
            type
          )
        `)
        .eq('user_id', userId)
        .order('year', { ascending: true })
        .order('month', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching balance snapshots:', error);
      throw new Error('Failed to load net worth history');
    }
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