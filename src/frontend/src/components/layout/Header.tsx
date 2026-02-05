import { Link } from '@tanstack/react-router';
import Logo from '../branding/Logo';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import NotificationsBell from './NotificationsBell';
import OfflineIndicator from './OfflineIndicator';
import { Package, LayoutDashboard, Building2, FileText, LogOut } from 'lucide-react';

interface HeaderProps {
  role: 'shop' | 'admin';
}

export default function Header({ role }: HeaderProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    window.location.href = role === 'admin' ? '/auth/admin/login' : '/auth/shop/login';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to={role === 'admin' ? '/admin' : '/shop'} className="flex items-center">
            <Logo className="h-8" />
          </Link>

          {identity && (
            <nav className="hidden items-center gap-1 md:flex">
              {role === 'shop' ? (
                <>
                  <Link to="/shop">
                    {({ isActive }) => (
                      <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    )}
                  </Link>
                  <Link to="/shop/products">
                    {({ isActive }) => (
                      <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                        <Package className="h-4 w-4" />
                        Products
                      </Button>
                    )}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/admin">
                    {({ isActive }) => (
                      <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    )}
                  </Link>
                  <Link to="/admin/shops">
                    {({ isActive }) => (
                      <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Shops
                      </Button>
                    )}
                  </Link>
                  <Link to="/admin/logs">
                    {({ isActive }) => (
                      <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Logs
                      </Button>
                    )}
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {identity && (
          <div className="flex items-center gap-3">
            {role === 'shop' && (
              <>
                <OfflineIndicator />
                <NotificationsBell />
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
