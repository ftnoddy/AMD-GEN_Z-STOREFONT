import { NextFunction, Response } from 'express';
import { TenantRequest } from '@/middlewares/tenant.middleware';
import ProductService from '@/services/products.service';

class ProductsController {
  private productService = new ProductService();

  // Get all products for tenant
  public getProducts = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.productService.getProducts(req.tenantId!, req.query);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get product by ID
  public getProductById = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.getProductById(req.tenantId!, req.params.id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  // Create new product
  public createProduct = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.tenantId!, req.body);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Update product
  public updateProduct = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.updateProduct(req.tenantId!, req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete product
  public deleteProduct = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.productService.deleteProduct(req.tenantId!, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Get product with SKUs
  public getProductWithSKUs = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.productService.getProductWithSKUs(req.tenantId!, req.params.id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ProductsController;

