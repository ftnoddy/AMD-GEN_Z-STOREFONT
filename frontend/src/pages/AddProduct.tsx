import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { productsService } from '../services/products.service';
import { skusService } from '../services/skus.service';
import { suppliersService } from '../services/suppliers.service';
import type { Supplier } from '../types';
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

interface VariantOption {
  name: string;
  values: string[];
}

interface SKUData {
  sku: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  variantCombination?: Record<string, string>;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // Basic product info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [image, setImage] = useState('');
  
  // Variant options
  const [hasVariants, setHasVariants] = useState(false);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  
  // SKU generation
  const [skus, setSKUs] = useState<SKUData[]>([]);
  const [defaultCost, setDefaultCost] = useState('');
  const [defaultStock, setDefaultStock] = useState('');
  const [defaultThreshold, setDefaultThreshold] = useState('10');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await suppliersService.getSuppliers();
      setSuppliers(data);
    } catch (error: any) {
      toast.error('Failed to load suppliers');
      console.error('Error loading suppliers:', error);
    }
  };

  const addVariantOption = () => {
    if (!newOptionName.trim()) return;
    
    setVariantOptions([...variantOptions, { name: newOptionName, values: [] }]);
    setNewOptionName('');
    setEditingOptionIndex(variantOptions.length);
  };

  const removeVariantOption = (index: number) => {
    const updated = variantOptions.filter((_, i) => i !== index);
    setVariantOptions(updated);
    if (editingOptionIndex === index) setEditingOptionIndex(null);
  };

  const addValueToOption = (optionIndex: number) => {
    if (!newOptionValue.trim()) return;
    
    const updated = [...variantOptions];
    if (!updated[optionIndex].values.includes(newOptionValue.trim())) {
      updated[optionIndex].values.push(newOptionValue.trim());
      setVariantOptions(updated);
    }
    setNewOptionValue('');
  };

  const removeValueFromOption = (optionIndex: number, valueIndex: number) => {
    const updated = [...variantOptions];
    updated[optionIndex].values.splice(valueIndex, 1);
    setVariantOptions(updated);
  };

  const generateSKUs = () => {
    if (!hasVariants) {
      // Single SKU for non-variant product
      setSKUs([
        {
          sku: `SKU-${Date.now()}`,
          price: parseFloat(basePrice) || 0,
          cost: parseFloat(defaultCost) || 0,
          stock: parseInt(defaultStock) || 0,
          lowStockThreshold: parseInt(defaultThreshold) || 10,
        },
      ]);
      return;
    }

    // Generate all variant combinations
    const generateCombinations = (
      options: VariantOption[],
      current: Record<string, string> = {},
      index: number = 0
    ): Record<string, string>[] => {
      if (index === options.length) {
        return [current];
      }

      const results: Record<string, string>[] = [];
      const option = options[index];

      for (const value of option.values) {
        const newCombination = { ...current, [option.name]: value };
        results.push(...generateCombinations(options, newCombination, index + 1));
      }

      return results;
    };

    const combinations = generateCombinations(variantOptions);
    const generatedSKUs = combinations.map((combo) => {
      const skuSuffix = Object.values(combo)
        .map((v) => v.substring(0, 3).toUpperCase())
        .join('-');
      return {
        sku: `${name.substring(0, 3).toUpperCase() || 'PRD'}-${skuSuffix}`,
        price: parseFloat(basePrice) || 0,
        cost: parseFloat(defaultCost) || 0,
        stock: parseInt(defaultStock) || 0,
        lowStockThreshold: parseInt(defaultThreshold) || 10,
        variantCombination: combo,
      };
    });

    setSKUs(generatedSKUs);
  };

  const updateSKU = (index: number, field: keyof SKUData, value: string | number) => {
    const updated = [...skus];
    (updated[index] as any)[field] = value;
    setSKUs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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
    
    if (skus.length === 0) {
      toast.error('Please generate SKUs before submitting');
      return;
    }

    try {
      setLoading(true);

      // Create product first
      const productData = {
        name,
        description,
        category,
        brand: brand || undefined,
        supplierId: supplierId || undefined,
        basePrice: parseFloat(basePrice),
        hasVariants,
        variantOptions: hasVariants ? variantOptions : undefined,
        image: image || undefined,
      };

      const createdProduct = await productsService.createProduct(productData);

      // Create SKUs with productId
      const skusToCreate = skus.map(sku => ({
        productId: createdProduct.id,
        sku: sku.sku,
        price: sku.price,
        cost: sku.cost || 0,
        stock: sku.stock || 0,
        lowStockThreshold: sku.lowStockThreshold,
        variantCombination: sku.variantCombination,
      }));

      await skusService.bulkCreateSKUs(skusToCreate);

      toast.success('Product created successfully!');
      navigate('/products');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/products">
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new product with optional variants
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to="/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Save Product'}
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

          {/* Variants Configuration */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => {
                    setHasVariants(e.target.checked);
                    if (!e.target.checked) {
                      setVariantOptions([]);
                      setSKUs([]);
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">This product has variants</span>
              </label>
            </div>

            {hasVariants && (
              <div className="mt-4 space-y-4">
                {/* Add Variant Option */}
                <div className="flex space-x-2">
                  <Input
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    placeholder="Option name (e.g., Size, Color)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariantOption())}
                  />
                  <Button type="button" onClick={addVariantOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Display Variant Options */}
                <div className="space-y-3">
                  {variantOptions.map((option, optionIndex) => (
                    <div key={optionIndex} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{option.name}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariantOption(optionIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Add Values */}
                      {editingOptionIndex === optionIndex && (
                        <div className="mt-3 flex space-x-2">
                          <Input
                            value={newOptionValue}
                            onChange={(e) => setNewOptionValue(e.target.value)}
                            placeholder={`Add ${option.name} value`}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addValueToOption(optionIndex);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addValueToOption(optionIndex)}
                          >
                            Add
                          </Button>
                        </div>
                      )}

                      {/* Display Values */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {option.values.map((value, valueIndex) => (
                          <Badge key={valueIndex} variant="secondary" className="flex items-center space-x-1">
                            <span>{value}</span>
                            <button
                              type="button"
                              onClick={() => removeValueFromOption(optionIndex, valueIndex)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {option.values.length === 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingOptionIndex(optionIndex)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add values
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {variantOptions.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Add variant options like Size, Color, Material, etc.
                  </p>
                )}

                {variantOptions.length > 0 && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-sm text-blue-900">
                      {variantOptions.reduce((acc, opt) => acc * opt.values.length, 1)}{' '}
                      SKUs will be generated based on your variant combinations
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SKU Generation */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">SKU Configuration</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Default Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={defaultCost}
                    onChange={(e) => setDefaultCost(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Default Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    value={defaultStock}
                    onChange={(e) => setDefaultStock(e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Low Stock Threshold</Label>
                  <Input
                    type="number"
                    min="0"
                    value={defaultThreshold}
                    onChange={(e) => setDefaultThreshold(e.target.value)}
                    placeholder="10"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button type="button" onClick={generateSKUs} className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Generate SKUs
              </Button>

              {/* Display Generated SKUs */}
              {skus.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="font-medium text-gray-900">Generated SKUs ({skus.length})</h3>
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {skus.map((sku, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{sku.sku}</p>
                            {sku.variantCombination && (
                              <p className="text-xs text-gray-500">
                                {Object.entries(sku.variantCombination)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(' • ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4">
                          <div>
                            <Label className="text-xs">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={sku.price}
                              onChange={(e) => updateSKU(index, 'price', parseFloat(e.target.value))}
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Cost</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={sku.cost}
                              onChange={(e) => updateSKU(index, 'cost', parseFloat(e.target.value))}
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Stock</Label>
                            <Input
                              type="number"
                              value={sku.stock}
                              onChange={(e) => updateSKU(index, 'stock', parseInt(e.target.value))}
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Threshold</Label>
                            <Input
                              type="number"
                              value={sku.lowStockThreshold}
                              onChange={(e) =>
                                updateSKU(index, 'lowStockThreshold', parseInt(e.target.value))
                              }
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Preview</h3>
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
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {name || 'Product name'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <p className="mt-1 text-sm text-gray-900">{category || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Base Price</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  ${basePrice || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Variants</p>
                <p className="mt-1 text-sm text-gray-900">
                  {hasVariants ? `${skus.length} SKUs` : 'No variants'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="font-medium text-blue-900">💡 Tips</h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Add clear product descriptions</li>
              <li>• Use high-quality images</li>
              <li>• Generate SKUs before saving</li>
              <li>• Set appropriate stock thresholds</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}

