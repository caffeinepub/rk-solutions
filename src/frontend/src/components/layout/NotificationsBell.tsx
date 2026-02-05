import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetShopAnalytics } from '../../hooks/useQueries';

export default function NotificationsBell() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: analytics } = useGetShopAnalytics(profile?.shopId ?? null);

  const alertCount =
    (analytics ? Number(analytics.lowStockCount) + Number(analytics.outOfStockCount) : 0);

  return (
    <Link to="/shop/alerts">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        {alertCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
          >
            {alertCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
