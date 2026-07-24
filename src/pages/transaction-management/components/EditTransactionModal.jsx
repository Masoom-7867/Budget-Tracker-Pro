import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const EditTransactionModal = ({ 
  transaction, 
  isOpen, 
  onClose, 
  onSave, 
  categories,
  accounts = []
}) => {
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    category_id: '',
    account_id: '',
    date: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category_id: transaction.category_id || '',
        account_id: transaction.account_id || '',
        date: transaction.date,
        description: transaction.description
      });
    }
  }, [transaction]);

  const transactionTypes = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

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

    // Category is optional here too, consistent with adding a transaction

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
        const updatedTransaction = {
          type: formData.type,
          amount: parseFloat(formData.amount),
          category_id: formData.category_id || null,
          account_id: formData.account_id || null,
          date: formData.date,
          description: formData.description.trim()
        };

        await onSave(updatedTransaction);
        handleClose();
      } catch (error) {
        console.error('Error updating transaction:', error);
        setErrors({ submit: error.message || 'Failed to update transaction' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setErrors({});
    setFormData({
      type: '',
      amount: '',
      category_id: '',
      account_id: '',
      date: '',
      description: ''
    });
    onClose();
  };

  const filteredCategories = categories.filter(cat => 
    formData.type ? cat.type === formData.type : true
  );

  // Use category IDs instead of names
  const categoryOptions = filteredCategories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
              <Icon name="Edit" size={20} color="var(--color-accent)" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Edit Transaction</h2>
              <p className="text-sm text-muted-foreground">Update transaction details</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {errors.submit && (
          <div className="mx-6 mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} color="var(--color-error)" />
              <p className="text-sm text-error">{errors.submit}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
            <Select
              label="Category (optional)"
              placeholder={formData.type ? "Select category" : "Select type first"}
              options={categoryOptions}
              value={formData.category_id}
              onChange={(value) => handleInputChange('category_id', value)}
              error={errors.category_id}
              disabled={!formData.type}
              clearable
            />

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

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              variant="default"
              iconName="Save"
              iconPosition="left"
              className="flex-1 sm:flex-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;