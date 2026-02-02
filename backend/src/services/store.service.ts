import TenantModel from '@/models/tenant.model';
import ProductModel from '@/models/product.model';
import SKUModel from '@/models/sku.model';
import { HttpException } from '@/exceptions/HttpException';

/**
 * Public store service for the user-facing app.
 * Resolves tenant by subdomain and returns safe, read-only catalog data.
 */
class StoreService {
  public tenants = TenantModel;
  public products = ProductModel;
  public skus = SKUModel;

  /**
   * Resolve tenant by subdomain and return safe store info (no secrets).
   */
  public async getStoreBySubdomain(subdomain: string) {
    const normalized = subdomain.toLowerCase().trim();
    const tenant = await this.tenants.findOne({ subdomain: normalized });

    if (!tenant) {
      throw new HttpException(404, 'Store not found');
    }

    return {
      id: tenant._id.toString(),
      name: tenant.name,
      subdomain: tenant.subdomain,
      logo: tenant.logo,
      currency: tenant.settings?.currency || 'USD',
    };
  }

  /**
   * List active products for a store (public catalog).
   * Optional: category, search, page, limit.
   */
  public async getStoreProducts(
    subdomain: string,
    queryParams: { category?: string; search?: string; page?: string; limit?: string }
  ) {
    const store = await this.getStoreBySubdomain(subdomain);
    const tenantId = store.id;

    const { category, search, page = '1', limit = '20' } = queryParams;
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const query: Record<string, unknown> = {
      tenantId,
      isActive: true,
    };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [rawProducts, total] = await Promise.all([
      this.products
        .find(query)
        .select('name description category brand basePrice hasVariants variantOptions image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      this.products.countDocuments(query),
    ]);

    const products = rawProducts.map((p: any) => ({
      ...p,
      id: p._id?.toString?.(),
    }));

    return {
      products,
      pagination: {
        page: Math.floor(skip / limitNum) + 1,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get product detail with in-stock SKUs for a store (public).
   */
  public async getStoreProductBySubdomain(subdomain: string, productId: string) {
    const store = await this.getStoreBySubdomain(subdomain);
    const tenantId = store.id;

    const product = await this.products
      .findOne({ _id: productId, tenantId, isActive: true })
      .select('name description category brand basePrice hasVariants variantOptions image')
      .lean();

    if (!product) {
      throw new HttpException(404, 'Product not found');
    }

    const skus = await this.skus
      .find({ productId, tenantId, isActive: true })
      .select('sku variantCombination stock price lowStockThreshold')
      .lean();

    const skusForPublic = skus.map((s) => ({
      id: (s as any)._id.toString(),
      sku: s.sku,
      variantCombination: s.variantCombination,
      stock: s.stock,
      price: s.price,
      inStock: s.stock > 0,
      lowStock: s.stock > 0 && s.stock <= (s.lowStockThreshold ?? 10),
    }));

    return {
      product: {
        ...product,
        id: (product as any)._id.toString(),
      },
      skus: skusForPublic,
    };
  }
}

export default StoreService;
