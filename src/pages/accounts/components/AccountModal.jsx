import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const TYPE_OPTIONS = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' }
];

const AccountModal = ({ isOpen, onClose, onSave, editingAccount, saving }) => {
  const [formData, setFormData] = useState({ name: '', type: 'bank', balance: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAccount) {
      setFormData({
        name: editingAccount.name || '',
        type: editingAccount.type || 'bank',
        balance: editingAccount.balance?.toString() || '0'
      });
    } else {
      setFormData({ name: '', type: 'bank', balance: '' });
    }
    setErrors({});
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (formData.balance === '' || Number.isNaN(Number(formData.balance))) {
      newErrors.balance = 'Enter a valid balance';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSave({
      name: formData.name.trim(),
      type: formData.type,
      balance: Number(formData.balance)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingAccount ? 'Edit Account' : 'Add Account'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Account Name"
            type="text"
            placeholder="e.g. Nedbank, Capitec, Cash"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e?.target?.value }))}
            error={errors.name}
            required
          />

          <Select
            label="Account Type"
            options={TYPE_OPTIONS}
            value={formData.type}
            onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
          />

          <Input
            label="Current Balance (R)"
            type="number"
            step="0.01"
            placeholder="Enter current balance"
            value={formData.balance}
            onChange={(e) => setFormData((prev) => ({ ...prev, balance: e?.target?.value }))}
            error={errors.balance}
            description="No live bank feed is connected - update this yourself whenever your real balance changes"
            required
          />

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={saving}>
              {saving ? 'Saving...' : (editingAccount ? 'Update Account' : 'Add Account')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;
