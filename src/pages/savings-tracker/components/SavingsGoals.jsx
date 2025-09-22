import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SavingsGoals = ({ goals, currentBalance }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateTimeToGoal = (current, target, monthlyContribution = 200) => {
    if (current >= target) return 'Goal achieved!';
    const remaining = target - current;
    const months = Math.ceil(remaining / monthlyContribution);
    
    if (months <= 12) {
      return `${months} month${months > 1 ? 's' : ''} to go`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''} to go`;
    }
  };

  if (goals?.length === 0) {
    return (
      <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
        <div className="text-center">
          <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Icon name="Target" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Savings Goals Set</h3>
          <p className="text-muted-foreground mb-4">
            Set savings goals to track your progress and stay motivated.
          </p>
          <Button variant="primary" iconName="Plus" iconPosition="left">
            Add Your First Goal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Icon name="Target" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Savings Goals</h3>
              <p className="text-sm text-muted-foreground">Track your progress toward financial targets</p>
            </div>
          </div>
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
            Add Goal
          </Button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {goals?.map((goal, index) => {
          const progress = calculateProgress(currentBalance, goal?.target);
          const timeEstimate = calculateTimeToGoal(currentBalance, goal?.target, goal?.monthlyContribution);
          
          return (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full p-2 ${
                    progress >= 100 ? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    <Icon 
                      name={goal?.icon} 
                      size={20} 
                      className={progress >= 100 ? 'text-success' : 'text-primary'} 
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{goal?.name}</h4>
                    <p className="text-sm text-muted-foreground">{goal?.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    {formatCurrency(goal?.target)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Target Amount
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(currentBalance)} / {formatCurrency(goal?.target)} ({progress?.toFixed(1)}%)
                  </span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress >= 100 ? 'bg-success' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {timeEstimate}
                  </span>
                  <span className="text-muted-foreground">
                    Monthly: {formatCurrency(goal?.monthlyContribution)}
                  </span>
                </div>
                
                {progress >= 100 && (
                  <div className="flex items-center space-x-2 text-success text-sm font-medium">
                    <Icon name="CheckCircle" size={16} />
                    <span>Goal achieved! Congratulations!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsGoals;