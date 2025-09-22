import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TransactionTable = ({ 
  transactions, 
  onEditTransaction, 
  onDeleteTransaction,
  sortConfig,
  onSort 
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSort = (field) => {
    const direction = sortConfig?.field === field && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction });
  };

  const getSortIcon = (field) => {
    if (sortConfig?.field !== field) {
      return <Icon name="ArrowUpDown" size={16} className="opacity-50" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={16} />
      : <Icon name="ArrowDown" size={16} />;
  };

  const handleDeleteClick = (transaction) => {
    setDeleteConfirm(transaction?.id);
  };

  const handleDeleteConfirm = (transactionId) => {
    onDeleteTransaction(transactionId);
    setDeleteConfirm(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount, type) => {
    const formattedAmount = Math.abs(amount)?.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return type === 'income' ? `+$${formattedAmount}` : `-$${formattedAmount}`;
  };

  if (transactions?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
            <Icon name="Receipt" size={24} color="var(--color-muted-foreground)" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Transactions Found</h3>
            <p className="text-muted-foreground">
              No transactions match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Date</span>
                  {getSortIcon('date')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('description')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Description</span>
                  {getSortIcon('description')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Category</span>
                  {getSortIcon('category')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Type</span>
                  {getSortIcon('type')}
                </button>
              </th>
              <th className="text-right p-4">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center justify-end space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors w-full"
                >
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </button>
              </th>
              <th className="text-center p-4">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((transaction) => (
              <tr key={transaction?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <span className="text-sm text-foreground">{formatDate(transaction?.date)}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground font-medium">{transaction?.description}</span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                    {transaction?.category}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction?.type === 'income' ?'bg-success/10 text-success' :'bg-error/10 text-error'
                  }`}>
                    {transaction?.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className={`text-sm font-semibold ${
                    transaction?.type === 'income' ? 'text-success' : 'text-error'
                  }`}>
                    {formatAmount(transaction?.amount, transaction?.type)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center space-x-2">
                    {deleteConfirm === transaction?.id ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => handleDeleteConfirm(transaction?.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={handleDeleteCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditTransaction(transaction)}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(transaction)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-4 p-4">
        {transactions?.map((transaction) => (
          <div key={transaction?.id} className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">{transaction?.description}</h4>
                <p className="text-sm text-muted-foreground">{formatDate(transaction?.date)}</p>
              </div>
              <span className={`text-lg font-semibold ${
                transaction?.type === 'income' ? 'text-success' : 'text-error'
              }`}>
                {formatAmount(transaction?.amount, transaction?.type)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                  {transaction?.category}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  transaction?.type === 'income' ?'bg-success/10 text-success' :'bg-error/10 text-error'
                }`}>
                  {transaction?.type === 'income' ? 'Income' : 'Expense'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {deleteConfirm === transaction?.id ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleDeleteConfirm(transaction?.id)}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleDeleteCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditTransaction(transaction)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(transaction)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionTable;