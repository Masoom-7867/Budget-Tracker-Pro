import React from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import { formatCurrency } from '../../../../utils/currency';
import { BUCKET_CONFIG, getBucketAllocation, getLineItemStatus } from '../../../../utils/monthlyBudget';

const STATUS_STYLES = {
  paid: { label: 'On Track', className: 'bg-success/10 text-success' },
  over: { label: 'Over Budget', className: 'bg-error/10 text-error' },
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' }
};

const BudgetBucketSection = ({
  bucket,
  monthlyIncome,
  lineItems,
  transactions,
  onAddItem,
  onEditItem,
  onDeleteItem
}) => {
  const config = BUCKET_CONFIG[bucket];
  const allocation = getBucketAllocation(monthlyIncome, bucket);
  const plannedTotal = lineItems.reduce((sum, item) => sum + (Number(item.planned_amount) || 0), 0);
  const outstanding = allocation - plannedTotal;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-muted/40">
        <h3 className="font-semibold text-foreground">{config.label}</h3>
        <span className="font-semibold text-foreground">{formatCurrency(allocation)}</span>
      </div>

      <div className="divide-y divide-border">
        {lineItems.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No items yet in this bucket.</p>
        ) : (
          lineItems.map((item) => {
            const { paidAmount, datePaid, status } = getLineItemStatus(item, transactions);
            const statusStyle = STATUS_STYLES[status];

            return (
              <div key={item.id} className="flex items-center justify-between p-4 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle.className}`}>
                      {statusStyle.label}
                    </span>
                    {datePaid && (
                      <span className="text-xs text-muted-foreground">
                        Paid {new Date(datePaid).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-foreground">{formatCurrency(item.planned_amount)}</p>
                  {status !== 'pending' && (
                    <p className="text-xs text-muted-foreground">Actual: {formatCurrency(paidAmount)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => onEditItem(item)}>
                    <Icon name="Pencil" size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteItem(item.id)}>
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between p-4 bg-muted/20 border-t border-border">
        <span className="text-sm font-semibold text-foreground">TOTAL OS</span>
        <span className={`text-sm font-semibold ${outstanding < 0 ? 'text-error' : 'text-foreground'}`}>
          {formatCurrency(outstanding)}
        </span>
      </div>

      <div className="p-3 border-t border-border">
        <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" onClick={onAddItem} className="w-full">
          Add Item
        </Button>
      </div>
    </div>
  );
};

export default BudgetBucketSection;
