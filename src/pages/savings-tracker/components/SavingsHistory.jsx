import React from 'react';
import Icon from '../../../components/AppIcon';

const SavingsHistory = ({ transactions }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(date));
  };

  if (transactions?.length === 0) {
    return (
      <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
        <div className="text-center">
          <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Icon name="History" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Transaction History</h3>
          <p className="text-muted-foreground">
            Your savings transactions will appear here once you start adding or withdrawing money.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 rounded-full p-2">
            <Icon name="History" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
            <p className="text-sm text-muted-foreground">Recent savings activity</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {transactions?.map((transaction, index) => (
          <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`rounded-full p-2 ${
                  transaction?.type === 'deposit' ?'bg-success/10' :'bg-warning/10'
                }`}>
                  <Icon 
                    name={transaction?.type === 'deposit' ? 'Plus' : 'Minus'} 
                    size={16} 
                    className={transaction?.type === 'deposit' ? 'text-success' : 'text-warning'} 
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">
                      {transaction?.type === 'deposit' ? 'Money Added' : 'Money Withdrawn'}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      transaction?.type === 'deposit' ?'bg-success/10 text-success' :'bg-warning/10 text-warning'
                    }`}>
                      {transaction?.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction?.date)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-semibold ${
                  transaction?.type === 'deposit' ? 'text-success' : 'text-warning'
                }`}>
                  {transaction?.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction?.amount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Balance: {formatCurrency(transaction?.runningBalance)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {transactions?.length > 5 && (
        <div className="p-4 border-t border-border text-center">
          <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default SavingsHistory;