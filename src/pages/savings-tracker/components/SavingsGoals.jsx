import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { formatCurrency } from '../../../utils/currency';

const SavingsGoals = ({ goals, currentBalance, onCreateGoal, onUpdateGoal, onDeleteGoal }) => {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    monthly_contribution: '',
    icon: 'Target'
  });
  const [errors, setErrors] = useState({});

  const iconOptions = [
    { value: 'Target', label: 'Target' },
    { value: 'Home', label: 'Home' },
    { value: 'Car', label: 'Car' },
    { value: 'Plane', label: 'Vacation' },
    { value: 'GraduationCap', label: 'Education' },
    { value: 'Heart', label: 'Wedding' },
    { value: 'Shield', label: 'Emergency' },
    { value: 'Briefcase', label: 'Business' }
  ];

  const calculateProgress = (target) => {
    return Math.min((currentBalance / target) * 100, 100);
  };

  const calculateTimeToGoal = (target, monthlyContribution = 200) => {
    if (currentBalance >= target) return 'Goal achieved!';
    const remaining = target - currentBalance;
    
    if (monthlyContribution <= 0) {
      return 'Set monthly contribution to see timeline';
    }
    
    const months = Math.ceil(remaining / monthlyContribution);
    
    if (months <= 12) {
      return `${months} month${months > 1 ? 's' : ''} to go`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''} to go`;
    }
  };

  const calculateRecommendedContribution = (targetAmount) => {
    if (!targetAmount || targetAmount <= 0) return 0;
    // Recommend saving over 12 months by default
    return parseFloat(targetAmount) / 12;
  };

  const handleCreateGoal = async () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Goal name is required';
    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'Valid target amount is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await onCreateGoal(formData);
        setShowGoalForm(false);
        setFormData({
          name: '',
          description: '',
          target_amount: '',
          monthly_contribution: '',
          icon: 'Target'
        });
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      target_amount: goal.target_amount?.toString(),
      monthly_contribution: goal.monthly_contribution?.toString() || '',
      icon: goal.icon || 'Target'
    });
    setShowGoalForm(true);
  };

  const handleUpdateGoal = async () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Goal name is required';
    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'Valid target amount is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await onUpdateGoal(editingGoal.id, formData);
        setShowGoalForm(false);
        setEditingGoal(null);
        setFormData({
          name: '',
          description: '',
          target_amount: '',
          monthly_contribution: '',
          icon: 'Target'
        });
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      await onDeleteGoal(goalId);
    }
  };

  const handleTargetAmountChange = (value) => {
    setFormData(prev => ({
      ...prev,
      target_amount: value,
      monthly_contribution: value ? calculateRecommendedContribution(value).toFixed(2) : prev.monthly_contribution
    }));
  };

  if (goals?.length === 0 && !showGoalForm) {
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
          <Button 
            variant="primary" 
            iconName="Plus" 
            iconPosition="left"
            onClick={() => setShowGoalForm(true)}
          >
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
          <Button 
            variant="outline" 
            size="sm" 
            iconName="Plus" 
            iconPosition="left"
            onClick={() => setShowGoalForm(true)}
          >
            Add Goal
          </Button>
        </div>
      </div>

      {/* Goal Form */}
      {showGoalForm && (
        <div className="p-6 border-b border-border">
          <div className="space-y-4">
            <Input
              label="Goal Name"
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />
            
            <Input
              label="Description"
              placeholder="Describe your goal"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            
            <Input
              label="Target Amount"
              type="number"
              placeholder="0.00"
              value={formData.target_amount}
              onChange={(e) => handleTargetAmountChange(e.target.value)}
              error={errors.target_amount}
              min="0.01"
              step="0.01"
            />
            
            <Input
              label="Monthly Contribution"
              type="number"
              placeholder="0.00"
              value={formData.monthly_contribution}
              onChange={(e) => setFormData({ ...formData, monthly_contribution: e.target.value })}
              min="0"
              step="0.01"
              helperText="Recommended monthly savings to reach your goal"
            />
            
            <Select
              label="Icon"
              options={iconOptions}
              value={formData.icon}
              onChange={(value) => setFormData({ ...formData, icon: value })}
            />
            
            {errors.submit && (
              <div className="text-red-600 text-sm">{errors.submit}</div>
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGoalForm(false);
                  setEditingGoal(null);
                  setFormData({
                    name: '',
                    description: '',
                    target_amount: '',
                    monthly_contribution: '',
                    icon: 'Target'
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="p-6 space-y-6">
        {goals?.map((goal) => {
          const progress = calculateProgress(goal.target_amount);
          const timeEstimate = calculateTimeToGoal(goal.target_amount, goal.monthly_contribution);
          
          return (
            <div key={goal.id} className="border border-border rounded-lg p-4 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full p-2 ${
                    progress >= 100 ? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    <Icon 
                      name={goal.icon} 
                      size={20} 
                      className={progress >= 100 ? 'text-success' : 'text-primary'} 
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{goal.name}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditGoal(goal)}
                  >
                    <Icon name="Edit" size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    <Icon name="Trash2" size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(currentBalance)} / {formatCurrency(goal.target_amount)} ({progress?.toFixed(1)}%)
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
                  {goal.monthly_contribution > 0 && (
                    <span className="text-muted-foreground">
                      Monthly: {formatCurrency(goal.monthly_contribution)}
                    </span>
                  )}
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