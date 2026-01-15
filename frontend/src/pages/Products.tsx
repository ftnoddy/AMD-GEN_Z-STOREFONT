import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { productsService } from '../services/products.service';
import { skusService } from '../services/skus.service';
import { suppliersService } from '../services/suppliers.service';
import type { Product, SKU, Supplier } from '../types';
import toast from 'react-hot-toast';

export default function Products() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, skusData, suppliersData] = await Promise.all([
        productsService.getProducts(),
        skusService.getSKUs(),
        suppliersService.getSuppliers(),
      ]);
      
      // Ensure all products have id field
      const productsWithId = productsData.map((p: any) => {
        if (!p.id && p._id) {
          p.id = p._id.toString();
        }
        return p;
      });
      
      // Ensure all SKUs have id and productId fields
      const skusWithId = skusData.map((s: any) => {
        if (!s.id && s._id) {
          s.id = s._id.toString();
        }
        if (s.productId && typeof s.productId === 'object' && s.productId._id) {
          s.productId = s.productId._id.toString();
        }
        return s;
      });
      
      // Ensure all suppliers have id field
      const suppliersWithId = suppliersData.map((s: any) => {
        if (!s.id && s._id) {
          s.id = s._id.toString();
        }
        return s;
      });
      
      setProducts(productsWithId);
      setSKUs(skusWithId);
      setSuppliers(suppliersWithId);
    } catch (error: any) {
      toast.error('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stock info for each product
  const productsWithStock = products.map((product: any) => {
    // Ensure product has id field (fallback to _id if needed)
    const productId = product.id || product._id?.toString() || '';
    if (!product.id && product._id) {
      product.id = product._id.toString();
    }
    
    const productSKUs = skus.filter((sku: any) => {
      const skuProductId = sku.productId || sku.productId?._id?.toString() || (sku.productId as any)?._id?.toString();
      return skuProductId === productId || skuProductId === product.id;
    });
    const totalStock = productSKUs.reduce((sum, sku) => sum + sku.stock, 0);
    const lowStockCount = productSKUs.filter(
      (sku) => sku.stock < sku.lowStockThreshold
    ).length;
    const outOfStockCount = productSKUs.filter((sku) => sku.stock === 0).length;
    const supplier = suppliers.find((s: any) => {
      const supplierId = s.id || s._id?.toString();
      const prodSupplierId = product.supplierId || (product.supplierId as any)?._id?.toString();
      return supplierId === prodSupplierId;
    });

    return {
      ...product,
      id: product.id || product._id?.toString() || '',
      totalStock,
      skuCount: productSKUs.length,
      lowStockCount,
      outOfStockCount,
      supplierName: supplier?.name || '-',
    };
  });

  // Filter products
  const filteredProducts = productsWithStock.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && product.totalStock > 0) ||
      (stockFilter === 'low_stock' && product.lowStockCount > 0) ||
      (stockFilter === 'out_of_stock' && product.outOfStockCount > 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = ['all', ...new Set(products.map((p) => p.category))];

  const getStockStatus = (product: typeof productsWithStock[0]) => {
    if (product.outOfStockCount > 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const };
    }
    if (product.lowStockCount > 0) {
      return { label: 'Low Stock', variant: 'warning' as const };
    }
    return { label: 'In Stock', variant: 'success' as const };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This will also delete all associated SKUs.')) return;
    
    try {
      await productsService.deleteProduct(id);
      toast.success('Product deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog and inventory levels
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link to="/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Total SKUs</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{skus.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Low Stock Items</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">
            {skus.filter((sku) => sku.stock < sku.lowStockThreshold).length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {skus.filter((sku) => sku.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  SKUs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id || (product as any)._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.brand && (
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge variant="secondary">{product.category}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {product.supplierName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {product.skuCount} {product.hasVariants ? 'variants' : 'SKU'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.totalStock} units
                      </div>
                      {product.lowStockCount > 0 && (
                        <div className="text-xs text-orange-600">
                          {product.lowStockCount} low stock
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(product.basePrice)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/products/${product.id || (product as any)._id || ''}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/products/${product.id || (product as any)._id || ''}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(product.id || (product as any)._id || '')}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-500">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

