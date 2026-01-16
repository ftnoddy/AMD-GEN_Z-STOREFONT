import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardStats } from '../types';
import { useSocket, SocketEvents } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    inventoryValue: 0,
    totalProducts: 0,
    totalSKUs: 0,
    lowStockAlerts: [],
    topSellers: [],
    stockMovementChart: [],
    categoryDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleDashboardUpdate = () => {
      // Reload dashboard data when updates occur
      loadDashboardData();
    };

    const handleOrderCreated = (data: any) => {
      toast.success(`New order created: ${data.orderNumber}`);
      loadDashboardData();
    };

    const handlePurchaseOrderReceived = (data: any) => {
      toast.success(`Purchase order received: ${data.poNumber}`);
      loadDashboardData();
    };

    const handleStockAdjusted = (data: any) => {
      // Silently update dashboard for stock adjustments
      loadDashboardData();
    };

    // Subscribe to events
    socket.on(SocketEvents.DASHBOARD_STATS_UPDATED, handleDashboardUpdate);
    socket.on(SocketEvents.ORDER_CREATED, handleOrderCreated);
    socket.on(SocketEvents.PURCHASE_ORDER_RECEIVED, handlePurchaseOrderReceived);
    socket.on(SocketEvents.STOCK_ADJUSTED, handleStockAdjusted);

    // Cleanup
    return () => {
      socket.off(SocketEvents.DASHBOARD_STATS_UPDATED, handleDashboardUpdate);
      socket.off(SocketEvents.ORDER_CREATED, handleOrderCreated);
      socket.off(SocketEvents.PURCHASE_ORDER_RECEIVED, handlePurchaseOrderReceived);
      socket.off(SocketEvents.STOCK_ADJUSTED, handleStockAdjusted);
    };
  }, [socket]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(stats.inventoryValue)}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total SKUs"
          value={stats.totalSKUs}
          icon={Package}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockAlerts.length}
          icon={AlertTriangle}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock Movement Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Stock Movement</h3>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.stockMovementChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="purchase"
                stroke="#10B981"
                strokeWidth={2}
                name="Purchases"
              />
              <Line
                type="monotone"
                dataKey="sale"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Sales"
              />
              <Line
                type="monotone"
                dataKey="adjustment"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Adjustments"
              />
              <Line
                type="monotone"
                dataKey="return"
                stroke="#EF4444"
                strokeWidth={2}
                name="Returns"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inventory by Category</h3>
            <p className="text-sm text-gray-500">Product distribution</p>
          </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, count }) => `${category}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} products`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row - Top Sellers and Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Sellers */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Sellers</h3>
              <p className="text-sm text-gray-500">Last 30 days</p>
            </div>
            <Link to="/analytics">
              <Button variant="ghost" size="sm">
                View All <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {stats.topSellers.length > 0 ? (
              stats.topSellers.map((item, index) => (
                <div key={item.skuId} className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-600">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.productName}
                    </p>
                    {item.variantInfo && (
                      <p className="text-xs text-gray-500">{item.variantInfo}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {item.totalQuantity} units sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
              <p className="text-sm text-gray-500">Items requiring attention</p>
            </div>
            <Link to="/alerts">
              <Button variant="ghost" size="sm">
                View All <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {stats.lowStockAlerts.length > 0 ? (
              stats.lowStockAlerts.slice(0, 5).map((item) => (
                <div key={item.skuId} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </p>
                    {item.variantInfo && (
                      <p className="text-xs text-gray-500">{item.variantInfo}</p>
                    )}
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge variant="destructive" className="text-xs">
                        {item.currentStock} left (threshold: {item.threshold})
                      </Badge>
                      {item.pendingQuantity > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.pendingQuantity} pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link to={`/products/${item.productId || ''}`}>
                    <Button variant="outline" size="sm">
                      Restock
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No low stock alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-gray-600">
              Common tasks to manage your inventory
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/products/new">
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
            <Link to="/purchase-orders/new">
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
            </Link>
            <Link to="/orders/new">
              <Button variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

