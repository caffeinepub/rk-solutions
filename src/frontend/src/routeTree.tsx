import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppShell from './components/layout/AppShell';
import ShopLoginPage from './pages/auth/ShopLoginPage';
import ShopSignUpPage from './pages/auth/ShopSignUpPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import DashboardPage from './pages/shop/DashboardPage';
import ProductsPage from './pages/shop/ProductsPage';
import ProductCreatePage from './pages/shop/ProductCreatePage';
import ProductEditPage from './pages/shop/ProductEditPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import AlertsPage from './pages/shop/AlertsPage';
import SyncStatusPage from './pages/shop/SyncStatusPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import ShopsAdminPage from './pages/admin/ShopsAdminPage';
import AccessLogsPage from './pages/admin/AccessLogsPage';
import ProfileSetupModal from './components/auth/ProfileSetupModal';

const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: () => <Outlet />,
});

const shopLoginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/shop/login',
  component: ShopLoginPage,
});

const shopSignUpRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/shop/signup',
  component: ShopSignUpPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/admin/login',
  component: AdminLoginPage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop',
  component: ShopLayout,
});

function ShopLayout() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();

  if (!identity) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/shop/login';
    }
    return null;
  }

  const showProfileSetup = !isLoading && isFetched && profile === null;

  return (
    <>
      <AppShell role="shop">
        <Outlet />
      </AppShell>
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

const shopDashboardRoute = createRoute({
  getParentRoute: () => shopRoute,
  path: '/',
  component: DashboardPage,
});

const shopProductsRoute = createRoute({
  getParentRoute: () => shopRoute,
  path: '/products',
  component: ProductsPage,
});

const shopProductCreateRoute = createRoute({
  getParentRoute: () => shopRoute,
  path: '/products/create',
  component: ProductCreatePage,
});

const shopProductEditRoute = createRoute({
  getParentRoute: () => shopRoute,
  path: '/products/$productId/edit',
  component: ProductEditPage,
});

const shopProductDetailRoute = createRoute({
  getParentRoute: () => shopRoute,
  path: '/products/$productId',
  component: ProductDetailPage,
});

const shopAlertsRoute = createRoute({
  getParentRoute: () => shopRoute,
  path: '/alerts',
  component: AlertsPage,
});

const shopSyncRoute = createRoute({
  getParentRoute: () => shopRoute,
  path: '/sync',
  component: SyncStatusPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
});

function AdminLayout() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/admin/login';
    }
    return null;
  }

  return (
    <AppShell role="admin">
      <Outlet />
    </AppShell>
  );
}

const adminHomeRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminHomePage,
});

const adminShopsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/shops',
  component: ShopsAdminPage,
});

const adminLogsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/logs',
  component: AccessLogsPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/auth/shop/login' });
  },
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute.addChildren([shopLoginRoute, shopSignUpRoute, adminLoginRoute]),
  shopRoute.addChildren([
    shopDashboardRoute,
    shopProductsRoute,
    shopProductCreateRoute,
    shopProductEditRoute,
    shopProductDetailRoute,
    shopAlertsRoute,
    shopSyncRoute,
  ]),
  adminRoute.addChildren([adminHomeRoute, adminShopsRoute, adminLogsRoute]),
]);
