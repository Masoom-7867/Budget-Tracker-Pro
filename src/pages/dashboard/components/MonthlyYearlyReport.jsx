import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

const MonthlyYearlyReport = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentMonth = new Date()?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentYear = new Date()?.getFullYear();

  // Mock data for monthly and yearly category totals
  const incomeCategories = [
    {
      id: 1,
      name: 'Salary',
      monthlyTotal: 4250.00,
      yearlyTotal: 51000.00,
      icon: 'Briefcase',
      color: 'bg-green-500'
    },
    {
      id: 2,
      name: 'Freelance',
      monthlyTotal: 850.00,
      yearlyTotal: 9850.00,
      icon: 'Laptop',
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'Investment Returns',
      monthlyTotal: 125.00,
      yearlyTotal: 1680.00,
      icon: 'TrendingUp',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'Side Business',
      monthlyTotal: 320.00,
      yearlyTotal: 3840.00,
      icon: 'Store',
      color: 'bg-orange-500'
    },
    {
      id: 5,
      name: 'Rental Income',
      monthlyTotal: 1200.00,
      yearlyTotal: 14400.00,
      icon: 'Home',
      color: 'bg-teal-500'
    }
  ];

  const expenseCategories = [
    {
      id: 6,
      name: 'Food & Dining',
      monthlyTotal: 1250.50,
      yearlyTotal: 14850.50,
      icon: 'Utensils',
      color: 'bg-red-500'
    },
    {
      id: 7,
      name: 'Transportation',
      monthlyTotal: 850.25,
      yearlyTotal: 9750.25,
      icon: 'Car',
      color: 'bg-blue-500'
    },
    {
      id: 8,
      name: 'Housing',
      monthlyTotal: 1800.00,
      yearlyTotal: 21600.00,
      icon: 'Home',
      color: 'bg-gray-500'
    },
    {
      id: 9,
      name: 'Entertainment',
      monthlyTotal: 425.00,
      yearlyTotal: 4890.00,
      icon: 'Film',
      color: 'bg-pink-500'
    },
    {
      id: 10,
      name: 'Healthcare',
      monthlyTotal: 320.25,
      yearlyTotal: 3568.25,
      icon: 'Heart',
      color: 'bg-red-500'
    },
    {
      id: 11,
      name: 'Shopping',
      monthlyTotal: 1100.75,
      yearlyTotal: 12850.75,
      icon: 'ShoppingBag',
      color: 'bg-purple-500'
    }
  ];

  const totalMonthlyIncome = incomeCategories?.reduce((sum, cat) => sum + cat?.monthlyTotal, 0);
  const totalYearlyIncome = incomeCategories?.reduce((sum, cat) => sum + cat?.yearlyTotal, 0);
  const totalMonthlyExpenses = expenseCategories?.reduce((sum, cat) => sum + cat?.monthlyTotal, 0);
  const totalYearlyExpenses = expenseCategories?.reduce((sum, cat) => sum + cat?.yearlyTotal, 0);

  const CategoryRow = ({ category, type }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${category?.color}`}></div>
        <span className="font-medium text-foreground">{category?.name}</span>
      </div>
      <div className="flex space-x-8 text-sm">
        <div className="text-right">
          <div className={`font-semibold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            ${category?.monthlyTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted-foreground">This Month</div>
        </div>
        <div className="text-right">
          <div className={`font-semibold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            ${category?.yearlyTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted-foreground">{currentYear} Total</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Monthly & Yearly Report</h3>
            <p className="text-sm text-muted-foreground">{currentMonth} Financial Summary</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-6">
          {/* Income Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-foreground">Income Categories</h4>
              </div>
              <div className="flex space-x-8 text-sm font-medium">
                <div className="text-right">
                  <div className="text-green-600">
                    ${totalMonthlyIncome?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">Monthly Total</div>
                </div>
                <div className="text-right">
                  <div className="text-green-600">
                    ${totalYearlyIncome?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">Yearly Total</div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              {incomeCategories?.map((category) => (
                <CategoryRow key={category?.id} category={category} type="income" />
              ))}
            </div>
          </div>

          {/* Expense Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <h4 className="font-semibold text-foreground">Expense Categories</h4>
              </div>
              <div className="flex space-x-8 text-sm font-medium">
                <div className="text-right">
                  <div className="text-red-600">
                    ${totalMonthlyExpenses?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">Monthly Total</div>
                </div>
                <div className="text-right">
                  <div className="text-red-600">
                    ${totalYearlyExpenses?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">Yearly Total</div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              {expenseCategories?.map((category) => (
                <CategoryRow key={category?.id} category={category} type="expense" />
              ))}
            </div>
          </div>

          {/* Net Summary */}
          <div className="bg-accent/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Net Summary</h4>
              <div className="flex space-x-8 text-sm font-bold">
                <div className="text-right">
                  <div className={`${(totalMonthlyIncome - totalMonthlyExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(totalMonthlyIncome - totalMonthlyExpenses)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Monthly {(totalMonthlyIncome - totalMonthlyExpenses) >= 0 ? 'Surplus' : 'Deficit'}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`${(totalYearlyIncome - totalYearlyExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(totalYearlyIncome - totalYearlyExpenses)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Yearly {(totalYearlyIncome - totalYearlyExpenses) >= 0 ? 'Surplus' : 'Deficit'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyYearlyReport;