import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  TruckIcon,
  Users,
  Bell,
  Settings,
  BarChart3,
  Activity,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Products',
    href: '/products',
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: <ShoppingCart className="h-5 w-5" />,
    badge: 3,
  },
  {
    title: 'Purchase Orders',
    href: '/purchase-orders',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Suppliers',
    href: '/suppliers',
    icon: <TruckIcon className="h-5 w-5" />,
  },
  {
    title: 'Stock Movements',
    href: '/stock-movements',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: <Bell className="h-5 w-5" />,
    badge: 2,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: 'Team',
    href: '/team',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">InventoryPro</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <nav className="space-y-1 border-t pt-4">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

