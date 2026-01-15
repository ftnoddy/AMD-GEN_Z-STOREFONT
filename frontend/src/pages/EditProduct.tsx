import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { productsService } from '../services/products.service';
import { skusService } from '../services/skus.service';
import { suppliersService } from '../services/suppliers.service';
import type { Product, SKU, Supplier } from '../types';
import toast from 'react-hot-toast';

// Common categories - could be fetched from API later
const categories = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Other',
];

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // Basic product info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productData, suppliersData] = await Promise.all([
        productsService.getProductWithSKUs(id!),
        suppliersService.getSuppliers(),
      ]);
      
      setProduct(productData.product);
      setSKUs(productData.skus);
      setSuppliers(suppliersData);
      
      // Populate form
      setName(productData.product.name);
      setDescription(productData.product.description || '');
      setCategory(productData.product.category);
      setBrand(productData.product.brand || '');
      setSupplierId(productData.product.supplierId || '');
      setBasePrice(productData.product.basePrice.toString());
      setImage(productData.product.image || '');
    } catch (error: any) {
      toast.error('Failed to load product');
      console.error('Error loading product:', error);
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
          <p className="mt-2 text-sm text-gray-500">The product you're trying to edit doesn't exist.</p>
          <Link to="/products">
            <Button className="mt-4" variant="outline">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const updateSKU = (index: number, field: string, value: string | number) => {
    const updated = [...skus];
    (updated[index] as any)[field] = value;
    setSKUs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!basePrice || parseFloat(basePrice) <= 0) {
      toast.error('Please enter a valid base price');
      return;
    }

    try {
      setSaving(true);

      // Update product
      const updatedProductData = {
        name,
        description,
        category,
        brand: brand || undefined,
        supplierId: supplierId || undefined,
        basePrice: parseFloat(basePrice),
        image: image || undefined,
      };

      await productsService.updateProduct(id!, updatedProductData);

      // Update SKUs individually
      await Promise.all(
        skus.map(sku =>
          skusService.updateSKU(sku.id, {
            price: sku.price,
            cost: sku.cost,
            lowStockThreshold: sku.lowStockThreshold,
          })
        )
      );

      toast.success('Product updated successfully!');
      navigate(`/products/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/products/${id}`}>
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update product information and SKU details
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to={`/products/${id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label required>Product Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label required>Category</Label>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Brand</Label>
                  <Input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Enter brand name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Supplier</Label>
                  <Select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label required>Base Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* SKU Management */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">SKU Management</h2>
              <Badge variant="secondary">{skus.length} SKUs</Badge>
            </div>

            <div className="mt-4 space-y-3">
              {product.hasVariants && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm text-blue-900">
                    💡 This product has variants. To add or remove variants, you need to create a new product.
                  </p>
                </div>
              )}

              {skus.map((sku, index) => {
                const getStockStatus = () => {
                  if (sku.stock === 0) return 'Out of Stock';
                  if (sku.stock < sku.lowStockThreshold) return 'Low Stock';
                  return 'In Stock';
                };
                
                const statusColor = () => {
                  if (sku.stock === 0) return 'text-red-600';
                  if (sku.stock < sku.lowStockThreshold) return 'text-orange-600';
                  return 'text-green-600';
                };

                return (
                  <div key={sku.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sku.sku}</p>
                        {sku.variantCombination && (
                          <p className="text-xs text-gray-500">
                            {Object.entries(sku.variantCombination)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' • ')}
                          </p>
                        )}
                        <p className={`mt-1 text-xs font-medium ${statusColor()}`}>
                          {getStockStatus()}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                      <div>
                        <Label className="text-xs">Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={sku.price}
                          onChange={(e) => updateSKU(index, 'price', parseFloat(e.target.value) || 0)}
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={sku.cost || 0}
                          onChange={(e) => updateSKU(index, 'cost', parseFloat(e.target.value) || 0)}
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Stock</Label>
                        <div className="mt-1 flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            value={sku.stock}
                            onChange={(e) => updateSKU(index, 'stock', parseInt(e.target.value) || 0)}
                            className="h-9 text-sm"
                            disabled
                            title="Use stock adjustment from product detail page"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Threshold</Label>
                        <Input
                          type="number"
                          min="0"
                          value={sku.lowStockThreshold}
                          onChange={(e) =>
                            updateSKU(index, 'lowStockThreshold', parseInt(e.target.value) || 0)
                          }
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {skus.length === 0 && (
              <p className="mt-4 text-sm text-gray-500">No SKUs found for this product</p>
            )}
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Summary</h3>
            <div className="mt-4 space-y-4">
              {image && (
                <img
                  src={image}
                  alt="Product preview"
                  className="w-full rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <p className="mt-1 text-sm text-gray-900">{category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Base Price</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {formatCurrency(parseFloat(basePrice) || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {skus.reduce((sum, sku) => sum + sku.stock, 0)} units
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {formatCurrency(skus.reduce((sum, sku) => sum + sku.stock * sku.price, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <h4 className="font-medium text-orange-900">⚠️ Important</h4>
            <ul className="mt-2 space-y-1 text-sm text-orange-800">
              <li>• Stock levels can only be adjusted from the product detail page</li>
              <li>• Price changes affect future orders only</li>
              <li>• Changes are saved immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}

