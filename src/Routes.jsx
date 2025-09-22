import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import BudgetGoals from './pages/budget-goals';
import TransactionManagement from './pages/transaction-management';
import Dashboard from './pages/dashboard';
import SavingsTracker from './pages/savings-tracker';
import CategoryManager from './pages/category-manager';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<BudgetGoals />} />
        <Route path="/budget-goals" element={<BudgetGoals />} />
        <Route path="/transaction-management" element={<TransactionManagement />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/savings-tracker" element={<SavingsTracker />} />
        <Route path="/category-manager" element={<CategoryManager />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
