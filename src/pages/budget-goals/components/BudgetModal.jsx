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
  categories = [] 
}) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    budgetedAmount: '',
    timePeriod: 'monthly'
  });
  const [errors, setErrors] = useState({});

  const timePeriodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        categoryId: editingBudget?.categoryId || '',
        budgetedAmount: editingBudget?.budgetedAmount?.toString(),
        timePeriod: editingBudget?.timePeriod || 'monthly'
      });
    } else {
      setFormData({
        categoryId: '',
        budgetedAmount: '',
        timePeriod: 'monthly'
      });
    }
    setErrors({});
  }, [editingBudget, isOpen]);

  const handleInputChange = (field, value) => {
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

    if (!formData?.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData?.budgetedAmount) {
      newErrors.budgetedAmount = 'Please enter a budget amount';
    } else if (isNaN(formData?.budgetedAmount) || parseFloat(formData?.budgetedAmount) <= 0) {
      newErrors.budgetedAmount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    const budgetData = {
      ...formData,
      budgetedAmount: parseFloat(formData?.budgetedAmount),
      id: editingBudget?.id || Date.now()
    };

    onSave(budgetData);
    onClose();
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
            value={formData?.categoryId}
            onChange={(value) => handleInputChange('categoryId', value)}
            error={errors?.categoryId}
            required
            searchable
          />

          <Input
            label="Budget Amount"
            type="number"
            placeholder="Enter budget amount"
            value={formData?.budgetedAmount}
            onChange={(e) => handleInputChange('budgetedAmount', e?.target?.value)}
            error={errors?.budgetedAmount}
            required
            min="0"
            step="0.01"
          />

          <Select
            label="Time Period"
            placeholder="Select time period"
            options={timePeriodOptions}
            value={formData?.timePeriod}
            onChange={(value) => handleInputChange('timePeriod', value)}
            required
          />

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              {editingBudget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;