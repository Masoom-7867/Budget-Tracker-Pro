import React from 'react';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';
import { formatMonthYear } from '../../../../utils/monthlyBudget';

const MonthSelector = ({ month, year, onChange }) => {
  const goToPrevious = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const goToNext = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const goToCurrent = () => {
    const now = new Date();
    onChange(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-3">
      <Button variant="ghost" size="icon" onClick={goToPrevious} aria-label="Previous month">
        <Icon name="ChevronLeft" size={20} />
      </Button>

      <div className="text-center">
        <p className="font-semibold text-foreground">{formatMonthYear(month, year)}</p>
        <button onClick={goToCurrent} className="text-xs text-primary hover:underline">
          Jump to current month
        </button>
      </div>

      <Button variant="ghost" size="icon" onClick={goToNext} aria-label="Next month">
        <Icon name="ChevronRight" size={20} />
      </Button>
    </div>
  );
};

export default MonthSelector;
