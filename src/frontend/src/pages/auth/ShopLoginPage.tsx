import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import Logo from '../../components/branding/Logo';
import { LogIn, UserPlus, Shield } from 'lucide-react';

export default function ShopLoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/shop' });
    }
  }, [identity, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo className="h-12" />
          </div>
          <CardTitle className="text-2xl">Shop Login</CardTitle>
          <CardDescription>Sign in to manage your inventory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={loginStatus === 'logging-in'}
            className="w-full gap-2"
            size="lg"
          >
            <LogIn className="h-5 w-5" />
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Login with Internet Identity'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate({ to: '/auth/shop/signup' })}
            className="w-full gap-2"
            size="lg"
          >
            <UserPlus className="h-5 w-5" />
            Create New Shop Account
          </Button>

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/auth/admin/login' })}
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
              size="sm"
            >
              <Shield className="h-4 w-4" />
              Super Admin Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
