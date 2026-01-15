import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { productsService } from '../services/products.service';
import { skusService } from '../services/skus.service';
import { stockMovementsService } from '../services/stockMovements.service';
import { suppliersService } from '../services/suppliers.service';
import type { Product, SKU, Supplier, StockMovement } from '../types';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [productSKUs, setProductSKUs] = useState<SKU[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [productMovements, setProductMovements] = useState<StockMovement[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [adjustingStock, setAdjustingStock] = useState(false);

  useEffect(() => {
    if (id && id !== 'undefined') {
      loadData();
    } else {
      setLoading(false);
      setProduct(null);
    }
  }, [id]);

  const loadData = async () => {
    if (!id || id === 'undefined' || id === 'null') {
      console.error('ProductDetail: Invalid id', id);
      setLoading(false);
      setProduct(null);
      return;
    }

    try {
      setLoading(true);
      console.log('ProductDetail: Loading data for id:', id);
      const [productData, movementsData] = await Promise.all([
        productsService.getProductWithSKUs(id),
        stockMovementsService.getStockMovementsByProduct(id, 10),
      ]);
      
      // Ensure product has id field (fallback to _id if needed)
      const product = productData.product as any;
      if (!product.id && product._id) {
        product.id = product._id.toString();
      }
      
      setProduct(product);
      setProductSKUs(productData.skus);
      setProductMovements(movementsData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));

      // Load supplier if exists
      if (product.supplierId) {
        try {
          const suppliers = await suppliersService.getSuppliers();
          const foundSupplier = suppliers.find(s => s.id === product.supplierId || (s as any)._id?.toString() === product.supplierId);
          setSupplier(foundSupplier || null);
        } catch (error) {
          // Supplier not found, ignore
        }
      }
    } catch (error: any) {
      toast.error('Failed to load product');
      console.error('Error loading product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Product not found</h3>
          <p className="mt-2 text-sm text-gray-500">The product you're looking for doesn't exist.</p>
          <Link to="/products">
            <Button className="mt-4" variant="outline">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalStock = productSKUs.reduce((sum, sku) => sum + sku.stock, 0);
  const lowStockCount = productSKUs.filter((sku) => sku.stock < sku.lowStockThreshold).length;
  const outOfStockCount = productSKUs.filter((sku) => sku.stock === 0).length;
  const totalValue = productSKUs.reduce((sum, sku) => sum + sku.stock * sku.price, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
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

  const getStockStatus = (sku: SKU) => {
    if (sku.stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (sku.stock < sku.lowStockThreshold)
      return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const openAdjustmentDialog = (sku: SKU) => {
    setSelectedSKU(sku);
    setAdjustmentType('add');
    setAdjustmentQuantity('');
    setAdjustmentNote('');
    setIsAdjustmentDialogOpen(true);
  };

  const handleStockAdjustment = async () => {
    if (!selectedSKU || !adjustmentQuantity || !adjustmentNote) return;

    try {
      setAdjustingStock(true);
      await skusService.adjustStock(selectedSKU.id, {
        quantity: parseInt(adjustmentQuantity),
        type: adjustmentType,
        note: adjustmentNote,
      });

      toast.success('Stock adjusted successfully');
      setIsAdjustmentDialogOpen(false);
      setAdjustmentQuantity('');
      setAdjustmentNote('');
      // Reload data to get updated stock
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to adjust stock');
    } finally {
      setAdjustingStock(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This will also delete all associated SKUs.')) return;
    
    try {
      await productsService.deleteProduct(id!);
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const renderVariantMatrix = () => {
    if (!product.hasVariants || !product.variantOptions) {
      // Single SKU product
      const sku = productSKUs[0];
      const status = getStockStatus(sku);
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Stock Information</h3>
              <p className="mt-1 text-sm text-gray-500">SKU: {sku.sku}</p>
            </div>
            <Button onClick={() => openAdjustmentDialog(sku)} size="sm">
              Adjust Stock
            </Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-600">Current Stock</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{sku.stock} units</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(sku.price)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
              >
                {status.label}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Multi-variant product with matrix
    if (product.variantOptions.length === 1) {
      // Single dimension (e.g., just colors or just sizes)
      const option = product.variantOptions[0];
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Variants - {option.name}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {option.name}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {option.values.map((value) => {
                  const sku = productSKUs.find(
                    (s) => s.variantCombination?.[option.name] === value
                  );
                  if (!sku) return null;
                  const status = getStockStatus(sku);
                  return (
                    <tr key={sku.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{value}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{sku.sku}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {sku.stock} units
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(sku.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => openAdjustmentDialog(sku)}
                          variant="ghost"
                          size="sm"
                        >
                          Adjust
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Two dimensions (e.g., Size × Color) - Matrix view
    const [option1, option2] = product.variantOptions;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Variant Matrix: {option1.name} × {option2.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Click on any cell to adjust stock for that variant
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  {option1.name} \ {option2.name}
                </th>
                {option2.values.map((val) => (
                  <th
                    key={val}
                    className="border border-gray-300 bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-700"
                  >
                    {val}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {option1.values.map((val1) => (
                <tr key={val1}>
                  <td className="border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900">
                    {val1}
                  </td>
                  {option2.values.map((val2) => {
                    const sku = productSKUs.find(
                      (s) =>
                        s.variantCombination?.[option1.name] === val1 &&
                        s.variantCombination?.[option2.name] === val2
                    );
                    if (!sku) {
                      return (
                        <td
                          key={`${val1}-${val2}`}
                          className="border border-gray-300 bg-gray-50 px-4 py-3 text-center text-sm text-gray-400"
                        >
                          N/A
                        </td>
                      );
                    }
                    const status = getStockStatus(sku);
                    return (
                      <td
                        key={`${val1}-${val2}`}
                        className="border border-gray-300 px-4 py-3 text-center hover:bg-gray-50"
                      >
                        <button
                          onClick={() => openAdjustmentDialog(sku)}
                          className="w-full text-center transition-colors hover:text-blue-600"
                        >
                          <div className="text-lg font-bold text-gray-900">{sku.stock}</div>
                          <div className="text-xs text-gray-500">{sku.sku}</div>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                            >
                              {sku.stock < sku.lowStockThreshold && '⚠️'} {sku.stock} units
                            </span>
                          </div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to={`/products/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <TrendingDown className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Variant Matrix */}
          {renderVariantMatrix()}

          {/* Stock Movements */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Stock Movements</h3>
            <div className="mt-4 space-y-3">
              {productMovements.length === 0 ? (
                <p className="text-sm text-gray-500">No stock movements yet</p>
              ) : (
                productMovements.map((movement) => {
                  const sku = productSKUs.find((s) => s.id === movement.skuId);
                  return (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sku?.sku} • {formatDate(movement.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {movement.quantity > 0 ? '+' : ''}
                          {movement.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          Balance: {movement.balanceAfter}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Product Info Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-600">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Category</dt>
                <dd className="mt-1">
                  <Badge variant="secondary">{product.category}</Badge>
                </dd>
              </div>
              {product.brand && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Brand</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.brand}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-600">Base Price</dt>
                <dd className="mt-1 text-sm font-bold text-gray-900">
                  {formatCurrency(product.basePrice)}
                </dd>
              </div>
              {supplier && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Supplier</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Link
                      to={`/suppliers/${supplier.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.name}
                    </Link>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-600">Total SKUs</dt>
                <dd className="mt-1 text-sm text-gray-900">{productSKUs.length}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Status</dt>
                <dd className="mt-1">
                  <Badge variant={product.isActive ? 'success' : 'destructive'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>

          {product.image && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Product Image</h3>
              <img
                src={product.image}
                alt={product.name}
                className="mt-4 w-full rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Make adjustments to the stock level for this SKU
            </DialogDescription>
          </DialogHeader>
          {selectedSKU && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">SKU: {selectedSKU.sku}</p>
                {selectedSKU.variantCombination && (
                  <p className="text-xs text-gray-500">
                    {Object.entries(selectedSKU.variantCombination)
                      .map(([, value]) => value)
                      .join(' / ')}
                  </p>
                )}
                <p className="mt-2 text-lg font-bold text-gray-900">
                  Current Stock: {selectedSKU.stock} units
                </p>
              </div>

              <div>
                <Label>Adjustment Type</Label>
                <div className="mt-2 flex space-x-2">
                  <Button
                    type="button"
                    variant={adjustmentType === 'add' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setAdjustmentType('add')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stock
                  </Button>
                  <Button
                    type="button"
                    variant={adjustmentType === 'remove' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setAdjustmentType('remove')}
                  >
                    <Minus className="mr-2 h-4 w-4" />
                    Remove Stock
                  </Button>
                </div>
              </div>

              <div>
                <Label required>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label required>Note</Label>
                <Textarea
                  placeholder="Reason for adjustment..."
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  New stock level will be:{' '}
                  <span className="font-bold">
                    {adjustmentType === 'add'
                      ? selectedSKU.stock + (parseInt(adjustmentQuantity) || 0)
                      : selectedSKU.stock - (parseInt(adjustmentQuantity) || 0)}{' '}
                    units
                  </span>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAdjustmentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStockAdjustment}
              disabled={!adjustmentQuantity || !adjustmentNote || adjustingStock}
            >
              {adjustingStock ? 'Adjusting...' : 'Confirm Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

