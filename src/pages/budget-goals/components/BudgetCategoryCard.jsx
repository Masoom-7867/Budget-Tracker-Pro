import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BudgetCategoryCard = ({ 
  category, 
  onEdit, 
  onDelete, 
  isExpanded, 
  onToggleExpand 
}) => {
  const { id, name, budgetedAmount, spentAmount, icon, color } = category;
  const remainingAmount = budgetedAmount - spentAmount;
  const progressPercentage = (spentAmount / budgetedAmount) * 100;

  const getStatusColor = () => {
    if (progressPercentage <= 60) return 'success';
    if (progressPercentage <= 80) return 'warning';
    return 'error';
  };

  const getStatusText = () => {
    if (progressPercentage <= 60) return 'On Track';
    if (progressPercentage <= 80) return 'Warning';
    return 'Over Budget';
  };

  const getProgressBarColor = () => {
    if (progressPercentage <= 60) return 'bg-success';
    if (progressPercentage <= 80) return 'bg-warning';
    return 'bg-error';
  };

  const getStatusBadgeColor = () => {
    if (progressPercentage <= 60) return 'bg-success/10 text-success';
    if (progressPercentage <= 80) return 'bg-warning/10 text-warning';
    return 'bg-error/10 text-error';
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon name={icon} size={20} color={color} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
                  {getStatusText()}
                </span>
                <span className="text-sm text-muted-foreground">
                  ${spentAmount?.toLocaleString()} / ${budgetedAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className={`text-sm font-semibold ${remainingAmount >= 0 ? 'text-success' : 'text-error'}`}>
                ${Math.abs(remainingAmount)?.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {remainingAmount >= 0 ? 'remaining' : 'over budget'}
              </p>
            </div>
            <Icon 
              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
              size={20} 
              className="text-muted-foreground" 
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">0%</span>
            <span className="text-xs text-muted-foreground">{progressPercentage?.toFixed(1)}%</span>
            <span className="text-xs text-muted-foreground">100%</span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Budgeted</p>
              <p className="text-sm font-semibold text-foreground">${budgetedAmount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Spent</p>
              <p className="text-sm font-semibold text-foreground">${spentAmount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={`text-sm font-semibold ${remainingAmount >= 0 ? 'text-success' : 'text-error'}`}>
                ${Math.abs(remainingAmount)?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-sm font-semibold text-foreground">{progressPercentage?.toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              iconName="Edit" 
              iconPosition="left"
              onClick={(e) => {
                e?.stopPropagation();
                onEdit(category);
              }}
            >
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              iconName="Trash2" 
              iconPosition="left"
              onClick={(e) => {
                e?.stopPropagation();
                onDelete(id);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCategoryCard;