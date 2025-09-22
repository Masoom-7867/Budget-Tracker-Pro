import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const quickActionItems = [
    {
      title: "Add Transaction",
      description: "Record a new income or expense",
      icon: "Plus",
      path: "/transaction-management",
      variant: "default",
      color: "bg-primary"
    },
    {
      title: "View Transactions",
      description: "Browse and manage your transaction history",
      icon: "Receipt",
      path: "/transaction-management",
      variant: "outline",
      color: "bg-secondary"
    },
    {
      title: "Set Budget Goal",
      description: "Create or update your budget targets",
      icon: "Target",
      path: "/budget-goals",
      variant: "outline",
      color: "bg-accent"
    },
    {
      title: "Track Savings",
      description: "Monitor your savings progress",
      icon: "PiggyBank",
      path: "/savings-tracker",
      variant: "outline",
      color: "bg-success"
    }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="text-sm text-muted-foreground">
          Manage your finances efficiently
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActionItems?.map((action, index) => (
          <Link key={index} to={action?.path} className="block">
            <div className="group p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md bg-muted/20 hover:bg-muted/40">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${action?.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName={action?.icon}
                    className="text-white hover:bg-transparent p-0 h-auto w-auto"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                    {action?.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {action?.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Need help getting started?</span>
          <Button variant="ghost" size="sm" iconName="HelpCircle" iconPosition="left">
            View Guide
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;