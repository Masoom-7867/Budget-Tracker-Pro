import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const SavingsActions = ({ onAddMoney, onSubtractMoney, currentBalance }) => {
  const [addAmount, setAddAmount] = useState('');
  const [subtractAmount, setSubtractAmount] = useState('');
  const [addError, setAddError] = useState('');
  const [subtractError, setSubtractError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateAmount = (amount, type) => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount greater than 0';
    }
    
    if (type === 'subtract' && numAmount > currentBalance) {
      return 'Cannot withdraw more than current balance';
    }
    
    if (numAmount > 999999.99) {
      return 'Amount cannot exceed $999,999.99';
    }
    
    return '';
  };

  const handleAddMoney = async () => {
    const error = validateAmount(addAmount, 'add');
    setAddError(error);
    
    if (!error) {
      const amount = parseFloat(addAmount);
      if (amount >= 1000) {
        setPendingAction({ type: 'add', amount });
        setShowConfirmDialog(true);
      } else {
        setLoading(true);
        try {
          await onAddMoney(amount);
          setAddAmount('');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleSubtractMoney = async () => {
    const error = validateAmount(subtractAmount, 'subtract');
    setSubtractError(error);
    
    if (!error) {
      const amount = parseFloat(subtractAmount);
      if (amount >= 500) {
        setPendingAction({ type: 'subtract', amount });
        setShowConfirmDialog(true);
      } else {
        setLoading(true);
        try {
          await onSubtractMoney(amount);
          setSubtractAmount('');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const confirmAction = async () => {
    setLoading(true);
    try {
      if (pendingAction?.type === 'add') {
        await onAddMoney(pendingAction?.amount);
        setAddAmount('');
      } else {
        await onSubtractMoney(pendingAction?.amount);
        setSubtractAmount('');
      }
    } finally {
      setShowConfirmDialog(false);
      setPendingAction(null);
      setLoading(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Money Section */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-success/10 rounded-full p-2">
              <Icon name="Plus" size={20} className="text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Add Money</h3>
              <p className="text-sm text-muted-foreground">Deposit funds to your savings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Amount to Add"
              type="number"
              placeholder="0.00"
              value={addAmount}
              onChange={(e) => {
                setAddAmount(e?.target?.value);
                setAddError('');
              }}
              error={addError}
              min="0.01"
              step="0.01"
            />
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddAmount('100')}
                className="text-xs"
              >
                $100
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddAmount('500')}
                className="text-xs"
              >
                $500
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddAmount('1000')}
                className="text-xs"
              >
                $1,000
              </Button>
            </div>
            
            <Button
              variant="success"
              fullWidth
              onClick={handleAddMoney}
              disabled={!addAmount || loading}
              iconName="Plus"
              iconPosition="left"
            >
              {loading ? 'Processing...' : 'Add to Savings'}
            </Button>
          </div>
        </div>

        {/* Subtract Money Section */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-warning/10 rounded-full p-2">
              <Icon name="Minus" size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Withdraw Money</h3>
              <p className="text-sm text-muted-foreground">Take funds from your savings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Amount to Withdraw"
              type="number"
              placeholder="0.00"
              value={subtractAmount}
              onChange={(e) => {
                setSubtractAmount(e?.target?.value);
                setSubtractError('');
              }}
              error={subtractError}
              min="0.01"
              step="0.01"
            />
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSubtractAmount('50')}
                className="text-xs"
              >
                $50
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSubtractAmount('200')}
                className="text-xs"
              >
                $200
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSubtractAmount('500')}
                className="text-xs"
              >
                $500
              </Button>
            </div>
            
            <Button
              variant="warning"
              fullWidth
              onClick={handleSubtractMoney}
              disabled={!subtractAmount || currentBalance <= 0 || loading}
              iconName="Minus"
              iconPosition="left"
            >
              {loading ? 'Processing...' : 'Withdraw from Savings'}
            </Button>
          </div>
        </div>
      </div>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full border border-border shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`rounded-full p-2 ${
                pendingAction?.type === 'add' ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                <Icon 
                  name={pendingAction?.type === 'add' ? 'Plus' : 'AlertTriangle'} 
                  size={24} 
                  className={pendingAction?.type === 'add' ? 'text-success' : 'text-warning'} 
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Confirm {pendingAction?.type === 'add' ? 'Deposit' : 'Withdrawal'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {pendingAction?.type === 'add' ?'Large deposit confirmation required' :'Large withdrawal confirmation required'
                  }
                </p>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-semibold text-foreground">
                  ${pendingAction?.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Balance:</span>
                <span className="font-semibold text-foreground">
                  ${(pendingAction?.type === 'add' ? currentBalance + pendingAction?.amount : currentBalance - pendingAction?.amount)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                fullWidth
                onClick={cancelAction}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant={pendingAction?.type === 'add' ? 'success' : 'warning'}
                fullWidth
                onClick={confirmAction}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SavingsActions;