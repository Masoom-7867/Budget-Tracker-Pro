import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // Redirect handled by auth state change
    } catch (error) {
      setError(error?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card rounded-xl border border-border p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e?.target?.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e?.target?.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Demo Credentials:</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-muted-foreground">Admin:</span>
              <span className="font-mono">admin@budgettracker.com / admin123</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-muted-foreground">User:</span>
              <span className="font-mono">user@budgettracker.com / user123</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click on any credential to copy it to clipboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;