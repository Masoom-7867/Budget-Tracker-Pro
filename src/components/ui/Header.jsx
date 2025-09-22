import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Transactions', path: '/transaction-management', icon: 'Receipt' },
    { label: 'Budget Goals', path: '/budget-goals', icon: 'Target' },
    { label: 'Categories', path: '/category-manager', icon: 'Tags' },
    { label: 'Savings', path: '/savings-tracker', icon: 'PiggyBank' },
  ];

  const isActivePath = (path) => location?.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border lg:block hidden">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="DollarSign" size={20} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold text-foreground">BudgetTracker Pro</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ease-out hover:text-primary ${
                  isActivePath(item?.path)
                    ? 'text-primary' :'text-muted-foreground'
                }`}
              >
                {item?.label}
                {isActivePath(item?.path) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Icon name="Bell" size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="Settings" size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="User" size={20} />
            </Button>
          </div>
        </div>
      </header>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border lg:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="DollarSign" size={18} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-foreground">BudgetTracker Pro</span>
          </Link>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-elevated">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ease-out ${
                    isActivePath(item?.path)
                      ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon name={item?.icon} size={20} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex flex-col items-center justify-center space-y-1 px-2 py-2 rounded-lg transition-colors duration-200 ease-out ${
                isActivePath(item?.path)
                  ? 'text-primary' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={item?.icon} size={20} />
              <span className="text-xs font-medium">{item?.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;