import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/currency';

const TYPE_LABELS = {
  bank: 'Bank Account',
  savings: 'Savings',
  cash: 'Cash',
  other: 'Other'
};

const AccountCard = ({ account, balance, onEdit, onDelete, onViewSavings, isExpanded, onToggleActivity }) => {
  const isSavings = account.type === 'savings';

  return (
    <div className={`bg-card rounded-xl border p-5 flex flex-col gap-4 transition-colors ${isExpanded ? 'border-primary' : 'border-border'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${account.color}20` }}
          >
            <Icon name={account.icon || 'Landmark'} size={20} color={account.color} />
          </div>
          <div>
            <p className="font-semibold text-foreground">{account.name}</p>
            <p className="text-xs text-muted-foreground">{TYPE_LABELS[account.type] || account.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onToggleActivity} aria-label="Toggle activity chart">
            <Icon name="LineChart" size={14} />
          </Button>
          {!isSavings && (
            <>
              <Button variant="ghost" size="icon" onClick={() => onEdit(account)}>
                <Icon name="Pencil" size={14} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(account.id)}>
                <Icon name="Trash2" size={14} />
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(balance)}</p>
        {isSavings ? (
          <button onClick={onViewSavings} className="text-xs text-primary hover:underline mt-1">
            Managed on the Savings Tracker page &rarr;
          </button>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">Manually updated balance</p>
        )}
      </div>
    </div>
  );
};

export default AccountCard;
