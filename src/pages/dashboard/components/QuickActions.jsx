import React from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      name: 'Add Transaction',
      description: 'Record new income or expense',
      icon: 'Plus',
      color: 'var(--color-success)',
      bgColor: 'bg-success/10',
      onClick: () => navigate('/transaction-management')
    },
    {
      id: 2,
      name: 'Manage Categories',
      description: 'Add or edit categories',
      icon: 'Folder',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10',
      onClick: () => navigate('/category-manager')
    },
    {
      id: 3,
      name: 'Set Budget',
      description: 'Create budget goals',
      icon: 'Target',
      color: 'var(--color-accent)',
      bgColor: 'bg-accent/10',
      onClick: () => navigate('/budget-goals')
    },
    {
      id: 4,
      name: 'View Reports',
      description: 'Detailed financial reports',
      icon: 'BarChart3',
      color: 'var(--color-secondary)',
      bgColor: 'bg-secondary/10',
      // There is no standalone /reports route - the report lives inline on
      // this dashboard, so scroll to it instead of navigating to a 404.
      onClick: () => document.getElementById('reports-section')?.scrollIntoView({ behavior: 'smooth' })
    }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Icon name="Zap" size={20} color="var(--color-muted-foreground)" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="p-4 bg-background border border-border rounded-lg text-left hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
              <Icon name={action.icon} size={20} color={action.color} />
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm">{action.name}</h3>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;