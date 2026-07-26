import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PeriodSelector = ({ month, year, onChange }) => {
  const goToPrevious = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const goToNext = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  const goToCurrent = () => onChange(now.getMonth() + 1, now.getFullYear());

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={goToPrevious} aria-label="Previous month">
        <Icon name="ChevronLeft" size={18} />
      </Button>
      <div className="text-center min-w-[140px]">
        <p className="font-medium text-foreground">{MONTH_NAMES[month - 1]} {year}</p>
        {!isCurrentMonth && (
          <button onClick={goToCurrent} className="text-xs text-primary hover:underline">
            Jump to current month
          </button>
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={goToNext} aria-label="Next month" disabled={isCurrentMonth}>
        <Icon name="ChevronRight" size={18} />
      </Button>
    </div>
  );
};

export default PeriodSelector;
