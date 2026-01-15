import ProductModel from '@/models/product.model';
import SKUModel from '@/models/sku.model';
import { HttpException } from '@/exceptions/HttpException';
import { addTenantFilter } from '@/middlewares/tenant.middleware';

class ProductService {
  public products = ProductModel;
  public skus = SKUModel;

  public async getProducts(tenantId: string, queryParams: any) {
    const { category, supplierId, search, hasVariants, isActive } = queryParams;
    const query: any = addTenantFilter(tenantId);

    if (category) query.category = category;
    if (supplierId) query.supplierId = supplierId;
    if (hasVariants !== undefined) query.hasVariants = hasVariants === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return this.products
      .find(query)
      .populate('supplierId', 'name code')
      .sort({ createdAt: -1 });
  }

  public async getProductById(tenantId: string, id: string) {
    const product = await this.products
      .findOne({ _id: id, tenantId })
      .populate('supplierId');

    if (!product) throw new HttpException(404, 'Product not found');
    return product;
  }

  public async createProduct(tenantId: string, body: any) {
    const product = new this.products({
      ...body,
      tenantId,
    });
    await product.save();
    return product;
  }

  public async updateProduct(tenantId: string, id: string, body: any) {
    const product = await this.products.findOneAndUpdate(
      { _id: id, tenantId },
      body,
      { new: true, runValidators: true },
    );

    if (!product) throw new HttpException(404, 'Product not found');
    return product;
  }

  public async deleteProduct(tenantId: string, id: string) {
    const product = await this.products.findOneAndDelete({ _id: id, tenantId });
    if (!product) throw new HttpException(404, 'Product not found');

    await this.skus.deleteMany({ productId: id, tenantId });
    return product;
  }

  public async getProductWithSKUs(tenantId: string, id: string) {
    const product = await this.products
      .findOne({ _id: id, tenantId })
      .populate('supplierId');

    if (!product) throw new HttpException(404, 'Product not found');

    const skus = await this.skus.find({ productId: id, tenantId });
    return { product, skus };
  }
}

export default ProductService;


