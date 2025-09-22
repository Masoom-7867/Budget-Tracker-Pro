import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const TransactionForm = ({ onAddTransaction, categories }) => {
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    category: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    description: ''
  });

  const [errors, setErrors] = useState({});

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
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.type) {
      newErrors.type = 'Transaction type is required';
    }

    if (!formData?.amount || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!formData?.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData?.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (validateForm()) {
      const newTransaction = {
        id: Date.now(),
        type: formData?.type,
        amount: parseFloat(formData?.amount),
        category: formData?.category,
        date: formData?.date,
        description: formData?.description?.trim(),
        timestamp: new Date()?.toISOString()
      };

      onAddTransaction(newTransaction);
      handleClear();
    }
  };

  const handleClear = () => {
    setFormData({
      type: '',
      amount: '',
      category: '',
      date: new Date()?.toISOString()?.split('T')?.[0],
      description: ''
    });
    setErrors({});
  };

  const filteredCategories = categories?.filter(cat => 
    formData?.type ? cat?.type === formData?.type : true
  );

  const categoryOptions = filteredCategories?.map(cat => ({
    value: cat?.name,
    label: cat?.name
  }));

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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Transaction Type"
            placeholder="Select transaction type"
            options={transactionTypes}
            value={formData?.type}
            onChange={(value) => handleInputChange('type', value)}
            error={errors?.type}
            required
          />

          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={formData?.amount}
            onChange={(e) => handleInputChange('amount', e?.target?.value)}
            error={errors?.amount}
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Category"
            placeholder="Select category"
            options={categoryOptions}
            value={formData?.category}
            onChange={(value) => handleInputChange('category', value)}
            error={errors?.category}
            disabled={!formData?.type}
            required
          />

          <Input
            label="Date"
            type="date"
            value={formData?.date}
            onChange={(e) => handleInputChange('date', e?.target?.value)}
            error={errors?.date}
            required
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
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            required
          />
          {errors?.description && (
            <p className="mt-1 text-sm text-error">{errors?.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            variant="default"
            iconName="Save"
            iconPosition="left"
            className="flex-1 sm:flex-none"
          >
            Save Transaction
          </Button>
          <Button
            type="button"
            variant="outline"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={handleClear}
            className="flex-1 sm:flex-none"
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;