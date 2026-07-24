import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const TransactionForm = ({ onAddTransaction, categories, accounts = [] }) => {
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    category_id: '',
    account_id: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transactionTypes = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  // Reset category when type changes
  useEffect(() => {
    if (formData.type) {
      setFormData(prev => ({
        ...prev,
        category_id: ''
      }));
    }
  }, [formData.type]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'Transaction type is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    // Category is optional - a transaction can be logged now and
    // categorized later from the "Needs Categorization" list

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const newTransaction = {
          type: formData.type,
          amount: parseFloat(formData.amount),
          category_id: formData.category_id || null,
          account_id: formData.account_id || null,
          date: formData.date,
          description: formData.description.trim()
        };

        await onAddTransaction(newTransaction);
        handleClear();
      } catch (error) {
        console.error('Error adding transaction:', error);
        setErrors({ submit: error.message || 'Failed to add transaction' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClear = () => {
    setFormData({
      type: '',
      amount: '',
      category_id: '',
      account_id: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setErrors({});
  };

  // Filter categories based on selected type
  const filteredCategories = categories.filter(cat => {
    if (!formData.type) return true; // Show all if no type selected
    return cat.type === formData.type;
  });

  // Create category options with ID as value
  const categoryOptions = filteredCategories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const hasCategories = categories.length > 0;
  const hasFilteredCategories = filteredCategories.length > 0;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="Plus" size={20} color="var(--color-primary)" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Add New Transaction</h2>
          <p className="text-sm text-muted-foreground">Record your income or expense transaction</p>
        </div>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} color="var(--color-error)" />
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Transaction Type"
            placeholder="Select transaction type"
            options={transactionTypes}
            value={formData.type}
            onChange={(value) => handleInputChange('type', value)}
            error={errors.type}
            required
          />

          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            error={errors.amount}
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select
              label="Category (optional)"
              placeholder={!formData.type ? "Select transaction type first" : 
                         !hasFilteredCategories ? "No categories available for this type" : 
                         "Select category"}
              options={categoryOptions}
              value={formData.category_id}
              onChange={(value) => handleInputChange('category_id', value)}
              error={errors.category_id}
              disabled={!formData.type || !hasFilteredCategories}
              clearable
            />
            {formData.type && !hasFilteredCategories && hasCategories && (
              <p className="mt-1 text-xs text-warning">
                No {formData.type} categories found. Create {formData.type} categories in the Category Manager.
              </p>
            )}
            {!formData.category_id && formData.type && (
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank to categorize later from "Needs Categorization"
              </p>
            )}
          </div>

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Account (optional)"
            placeholder="Which account is this going from/into?"
            options={accounts.map((acc) => ({ value: acc.id, label: acc.name }))}
            value={formData.account_id}
            onChange={(value) => handleInputChange('account_id', value)}
            clearable
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description <span className="text-error">*</span>
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            rows="3"
            placeholder="Enter transaction description..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-error">{errors.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            variant="default"
            iconName="Save"
            iconPosition="left"
            className="flex-1 sm:flex-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Transaction'}
          </Button>
          <Button
            type="button"
            variant="outline"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={handleClear}
            className="flex-1 sm:flex-none"
            disabled={isSubmitting}
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;