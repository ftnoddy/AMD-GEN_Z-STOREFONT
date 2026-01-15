import { Bell, Search, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';

export function Navbar() {
  const navigate = useNavigate();
  const currentUser = authService.getUser();
  const unreadAlerts = 0; // TODO: Get from API

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search Bar */}
        <div className="flex flex-1 items-center space-x-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, orders, suppliers..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            {unreadAlerts > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* User Menu */}
          {currentUser && (
            <div className="relative group">
              <button className="flex items-center space-x-3 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50">
                <div className="h-8 w-8 overflow-hidden rounded-full bg-blue-600">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {currentUser.name?.charAt(0) || currentUser.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name || currentUser.email}</p>
                  <p className="text-xs text-gray-500">{currentUser.role || 'User'}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium">{currentUser.name || currentUser.email}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

