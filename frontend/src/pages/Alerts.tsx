import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { dashboardService } from '../services/dashboard.service';
import { AlertSeverity, AlertType } from '../types';
import type { LowStockItem } from '../types';
import toast from 'react-hot-toast';

// Convert low stock items to alerts format
const convertLowStockToAlerts = (lowStockItems: LowStockItem[]) => {
  return lowStockItems.map((item) => ({
    id: item.skuId,
    tenantId: '',
    type: 'low_stock' as AlertType,
    severity: (item.currentStock < item.threshold / 2 ? 'critical' : 'warning') as AlertSeverity,
    title: `Low Stock: ${item.productName}`,
    message: `${item.productName} (${item.variantInfo || 'N/A'}) has only ${item.currentStock} units remaining (threshold: ${item.threshold})`,
    data: item,
    isRead: false,
    createdAt: new Date(),
  }));
};

export default function Alerts() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const stats = await dashboardService.getDashboardStats();
      const lowStockAlerts = convertLowStockToAlerts(stats.lowStockAlerts);
      setAlerts(lowStockAlerts);
    } catch (error: any) {
      toast.error('Failed to load alerts');
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-600 bg-red-50';
      case 'warning':
        return 'border-l-orange-500 bg-orange-50';
      case 'info':
        return 'border-l-blue-600 bg-blue-50';
      default:
        return 'border-l-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay informed about important inventory events
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">Mark All as Read</Button>
          <Button variant="outline">Clear All</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter((a) => a.severity === 'critical').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter((a) => a.severity === 'warning').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <Info className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Info</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter((a) => a.severity === 'info').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading alerts...</p>
            </div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="mt-2 text-sm text-gray-500">No new alerts at this time.</p>
          </div>
        ) : (
          alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border-l-4 bg-white p-6 shadow-sm ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">{getSeverityIcon(alert.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                    <p className="mt-2 text-xs text-gray-500">{formatDate(alert.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.isRead && (
                      <Badge variant="default">New</Badge>
                    )}
                    <Badge variant="secondary" className="uppercase">
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {!alert.isRead && (
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}

