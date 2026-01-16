import { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { stockMovementsService } from '../services/stockMovements.service';
import { StockMovementType } from '../types';
import type { StockMovement } from '../types';
import toast from 'react-hot-toast';
import { useSocket, SocketEvents } from '../contexts/SocketContext';

export default function StockMovements() {
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<StockMovementType | 'all'>('all');
  const { socket } = useSocket();

  useEffect(() => {
    loadMovements();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleStockMovementCreated = (data: any) => {
      // Reload movements to get the full details
      loadMovements();
    };

    const handleStockAdjusted = (data: any) => {
      toast.success(`Stock adjusted for SKU`);
      loadMovements();
    };

    // Subscribe to events
    socket.on(SocketEvents.STOCK_MOVEMENT_CREATED, handleStockMovementCreated);
    socket.on(SocketEvents.STOCK_ADJUSTED, handleStockAdjusted);

    // Cleanup
    return () => {
      socket.off(SocketEvents.STOCK_MOVEMENT_CREATED, handleStockMovementCreated);
      socket.off(SocketEvents.STOCK_ADJUSTED, handleStockAdjusted);
    };
  }, [socket]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const result = await stockMovementsService.getStockMovements({ limit: 100 });
      setMovements(result.movements);
    } catch (error: any) {
      toast.error('Failed to load stock movements');
      console.error('Error loading stock movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const movementsWithDetails = movements.map((movement) => {
    // Backend populates these fields
    const sku = (movement as any).skuId;
    const product = (movement as any).productId;
    const user = (movement as any).userId;

    return {
      ...movement,
      sku: typeof sku === 'object' ? sku?.sku : '-',
      productName: typeof product === 'object' ? product?.name : '-',
      variantInfo: typeof sku === 'object' && sku?.variantCombination
        ? Object.values(sku.variantCombination).join(' / ')
        : undefined,
      userName: typeof user === 'object' ? user?.name : '-',
    };
  });

  const filteredMovements = movementsWithDetails.filter((movement) => {
    const matchesSearch =
      movement.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || movement.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeVariant = (type: StockMovementType) => {
    switch (type) {
      case 'purchase':
        return 'success';
      case 'sale':
        return 'default';
      case 'return':
        return 'secondary';
      case 'adjustment':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: StockMovementType) => {
    switch (type) {
      case 'purchase':
        return '📦';
      case 'sale':
        return '🛒';
      case 'return':
        return '↩️';
      case 'adjustment':
        return '⚙️';
      default:
        return '•';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stock movements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Movements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all inventory changes and transactions
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search stock movements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as StockMovementType | 'all')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
            <option value="return">Return</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
      </div>

      {/* Stock Movements Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product / SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(new Date(movement.timestamp))}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {movement.productName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {movement.sku}
                      {movement.variantInfo && ` • ${movement.variantInfo}`}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={getTypeVariant(movement.type)}>
                      <span className="mr-1">{getTypeIcon(movement.type)}</span>
                      {movement.type}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {movement.quantity > 0 ? '+' : ''}
                      {movement.quantity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    <div>
                      <span className="text-xs text-gray-500">
                        {movement.balanceBefore} →{' '}
                      </span>
                      <span className="font-medium">{movement.balanceAfter}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {movement.reference ? (
                      <span className="text-blue-600">{movement.reference}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {movement.userName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

