import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Logo from '../../components/branding/Logo';
import { ArrowLeft, Building2, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCreateShop } from '../../hooks/useQueries';

export default function ShopSignUpPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'auth' | 'shop'>('auth');
  const createShop = useCreateShop();

  useEffect(() => {
    if (identity && step === 'auth') {
      setStep('shop');
    }
  }, [identity, step]);

  const handleLogin = async () => {
    try {
      setError('');
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to authenticate');
    }
  };

  const parseBackendError = (errorMessage: string): string => {
    // Extract meaningful error messages from backend traps
    if (errorMessage.includes('User already owns a shop')) {
      return 'You already have a shop registered. Please log in instead.';
    }
    if (errorMessage.includes('Unauthorized')) {
      return 'Authentication error. Please try logging in again.';
    }
    if (errorMessage.includes('Shop not found')) {
      return 'Shop could not be found. Please try again.';
    }
    // Return the original message if no specific pattern matches
    return errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      setError('Please enter a shop name');
      return;
    }

    if (!identity) {
      setError('Please authenticate first');
      return;
    }

    try {
      setError('');
      await createShop.mutateAsync({
        name: shopName.trim(),
      });
      navigate({ to: '/shop' });
    } catch (error: any) {
      const errorMessage = parseBackendError(error.message || 'Failed to create shop');
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo className="h-12" />
          </div>
          <CardTitle className="text-2xl">Create Shop Account</CardTitle>
          <CardDescription>
            {step === 'auth'
              ? 'First, authenticate with Internet Identity'
              : 'Now, register your shop to start managing inventory'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'auth' ? (
            <>
              <Button
                onClick={handleLogin}
                disabled={loginStatus === 'logging-in'}
                className="w-full gap-2"
                size="lg"
              >
                <LogIn className="h-5 w-5" />
                {loginStatus === 'logging-in' ? 'Authenticating...' : 'Login with Internet Identity'}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Enter your shop name"
                  required
                  disabled={createShop.isPending}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={createShop.isPending}
              >
                <Building2 className="h-5 w-5" />
                {createShop.isPending ? 'Creating Shop...' : 'Create Shop Account'}
              </Button>
            </form>
          )}

          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/auth/shop/login' })}
            className="w-full gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
