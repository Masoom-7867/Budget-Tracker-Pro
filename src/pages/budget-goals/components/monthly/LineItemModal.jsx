import React, { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';
import { BUCKET_CONFIG } from '../../../../utils/monthlyBudget';

const LineItemModal = ({ isOpen, onClose, onSave, editingItem, bucket, categories, saving }) => {
  const [formData, setFormData] = useState({
    name: '',
    planned_amount: '',
    category_id: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        planned_amount: editingItem.planned_amount?.toString() || '',
        category_id: editingItem.category_id || ''
      });
    } else {
      setFormData({ name: '', planned_amount: '', category_id: '' });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const categoryOptions = (categories || [])
    .filter((cat) => cat.type === 'expense')
    .map((cat) => ({ value: cat.id, label: cat.name }));

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.planned_amount || Number(formData.planned_amount) <= 0) {
      newErrors.planned_amount = 'Enter an amount greater than 0';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSave({
      name: formData.name.trim(),
      planned_amount: Number(formData.planned_amount),
      category_id: formData.category_id || null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingItem ? 'Edit Line Item' : `Add Item to ${BUCKET_CONFIG[bucket]?.label}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Name"
            type="text"
            placeholder="e.g. Rent, Netflix, Vodacom"
            value={formData.name}
            onChange={(e) => handleChange('name', e?.target?.value)}
            error={errors.name}
            required
          />

          <Input
            label="Planned Amount (R)"
            type="number"
            placeholder="Enter planned amount"
            value={formData.planned_amount}
            onChange={(e) => handleChange('planned_amount', e?.target?.value)}
            error={errors.planned_amount}
            required
            min="0"
            step="0.01"
          />

          <Select
            label="Category (optional)"
            description="Used to auto-match this item against your transactions to find the paid date"
            placeholder="Select a category"
            options={categoryOptions}
            value={formData.category_id}
            onChange={(value) => handleChange('category_id', value)}
            clearable
            searchable
          />

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={saving}>
              {saving ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LineItemModal;
