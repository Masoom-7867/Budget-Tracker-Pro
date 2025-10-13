import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BudgetModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingBudget = null, 
  categories = [],
  saving = false
}) => {
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'monthly'
  });
  const [errors, setErrors] = useState({});

  const timePeriodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    if (editingBudget) {
      console.log('Editing budget:', editingBudget);
      setFormData({
        category_id: editingBudget.category_id || editingBudget.categoryId || '',
        amount: editingBudget.budgeted_amount?.toString() || editingBudget.budgetedAmount?.toString() || editingBudget.amount?.toString() || '',
        period: editingBudget.period || editingBudget.timePeriod || 'monthly'
      });
    } else {
      setFormData({
        category_id: '',
        amount: '',
        period: 'monthly'
      });
    }
    setErrors({});
  }, [editingBudget, isOpen]);

  const handleInputChange = (field, value) => {
    console.log(`Field ${field} changed to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (!formData?.amount) {
      newErrors.amount = 'Please enter a budget amount';
    } else if (isNaN(formData?.amount) || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    const budgetData = {
      category_id: formData.category_id,
      amount: formData.amount,
      period: formData.period
    };

    console.log('Calling onSave with data:', budgetData);
    onSave(budgetData);
  };

  const categoryOptions = categories?.map(category => ({
    value: category?.id,
    label: category?.name,
    description: category?.type
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingBudget ? 'Edit Budget Goal' : 'Add Budget Goal'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Select
            label="Category"
            placeholder="Select a category"
            options={categoryOptions}
            value={formData?.category_id}
            onChange={(value) => handleInputChange('category_id', value)}
            error={errors?.category_id}
            required
            searchable
          />

          <Input
            label="Budget Amount"
            type="number"
            placeholder="Enter budget amount"
            value={formData?.amount}
            onChange={(e) => handleInputChange('amount', e?.target?.value)}
            error={errors?.amount}
            required
            min="0"
            step="0.01"
          />

          <Select
            label="Time Period"
            placeholder="Select time period"
            options={timePeriodOptions}
            value={formData?.period}
            onChange={(value) => handleInputChange('period', value)}
            required
          />

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={saving}>
              {saving ? 'Saving...' : (editingBudget ? 'Update Budget' : 'Create Budget')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;