import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, userProfile } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'BarChart3' },
    { name: 'Accounts', path: '/accounts', icon: 'Landmark' },
    { name: 'Transactions', path: '/transaction-management', icon: 'ArrowLeftRight' },
    { name: 'Budget Goals', path: '/budget-goals', icon: 'Target' },
    { name: 'Savings Tracker', path: '/savings-tracker', icon: 'PiggyBank' },
    { name: 'Categories', path: '/category-manager', icon: 'Tags' }
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location?.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="bg-primary rounded-lg p-2">
                <Icon name="BarChart3" size={24} className="text-primary-foreground" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-foreground">BudgetTracker Pro</h1>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation?.map((item) => (
              <button
                key={item?.path}
                onClick={() => navigate(item?.path)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePath(item?.path)
                    ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={16} className="mr-2" />
                {item?.name}
              </button>
            ))}
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {userProfile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile?.email || user?.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  iconName="LogOut"
                  iconPosition="left"
                >
                  Sign Out
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-expanded="false"
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border bg-card">
            {navigation?.map((item) => (
              <button
                key={item?.path}
                onClick={() => navigate(item?.path)}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePath(item?.path)
                    ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={20} className="mr-3" />
                {item?.name}
              </button>
            ))}
            
            {user && (
              <div className="pt-4 pb-3 border-t border-border">
                <div className="flex items-center px-3 mb-3">
                  <div>
                    <p className="text-base font-medium text-foreground">
                      {userProfile?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.email || user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  iconName="LogOut"
                  iconPosition="left"
                  className="mx-3 w-auto"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;