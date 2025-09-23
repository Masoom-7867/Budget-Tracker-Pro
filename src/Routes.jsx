import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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
          {/* All routes are now protected with authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/transaction-management" element={
            <ProtectedRoute>
              <TransactionManagement />
            </ProtectedRoute>
          } />
          <Route path="/budget-goals" element={
            <ProtectedRoute>
              <BudgetGoals />
            </ProtectedRoute>
          } />
          <Route path="/savings-tracker" element={
            <ProtectedRoute>
              <SavingsTracker />
            </ProtectedRoute>
          } />
          <Route path="/category-manager" element={
            <ProtectedRoute>
              <CategoryManager />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
