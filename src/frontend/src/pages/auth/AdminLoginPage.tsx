import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import Logo from '../../components/branding/Logo';
import { Shield, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/admin' });
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo className="h-12" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
          </div>
          <CardDescription>Super-admin access only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={loginStatus === 'logging-in'}
            className="w-full gap-2"
            size="lg"
          >
            <LogIn className="h-5 w-5" />
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Admin Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
