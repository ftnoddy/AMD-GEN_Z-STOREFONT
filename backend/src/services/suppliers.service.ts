import SupplierModel from '@/models/supplier.model';
import { HttpException } from '@/exceptions/HttpException';
import { addTenantFilter } from '@/middlewares/tenant.middleware';

class SupplierService {
  public suppliers = SupplierModel;

  public async getSuppliers(tenantId: string, queryParams: any) {
    const { search, isActive } = queryParams;
    const query: any = addTenantFilter(tenantId);

    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
      ];
    }

    return this.suppliers.find(query).sort({ createdAt: -1 });
  }

  public async getSupplierById(tenantId: string, id: string) {
    const supplier = await this.suppliers.findOne({ _id: id, tenantId });

    if (!supplier) throw new HttpException(404, 'Supplier not found');
    return supplier;
  }

  public async createSupplier(tenantId: string, body: any) {
    // Check if code already exists for this tenant
    const existingSupplier = await this.suppliers.findOne({
      tenantId,
      code: body.code.toUpperCase(),
    });

    if (existingSupplier) {
      throw new HttpException(400, 'Supplier code already exists for this tenant');
    }

    const supplier = new this.suppliers({
      ...body,
      code: body.code.toUpperCase(),
      tenantId,
    });
    await supplier.save();
    return supplier;
  }

  public async updateSupplier(tenantId: string, id: string, body: any) {
    const supplier = await this.suppliers.findOne({ _id: id, tenantId });

    if (!supplier) throw new HttpException(404, 'Supplier not found');

    // If code is being updated, check for duplicates
    if (body.code && body.code.toUpperCase() !== supplier.code) {
      const existingSupplier = await this.suppliers.findOne({
        tenantId,
        code: body.code.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingSupplier) {
        throw new HttpException(400, 'Supplier code already exists for this tenant');
      }
      body.code = body.code.toUpperCase();
    }

    Object.assign(supplier, body);
    await supplier.save();
    return supplier;
  }

  public async deleteSupplier(tenantId: string, id: string) {
    const supplier = await this.suppliers.findOne({ _id: id, tenantId });

    if (!supplier) throw new HttpException(404, 'Supplier not found');

    // Check if supplier has any purchase orders
    const PurchaseOrderModel = (await import('@/models/purchase-order.model')).default;
    const hasPurchaseOrders = await PurchaseOrderModel.exists({ tenantId, supplierId: id });

    if (hasPurchaseOrders) {
      // Soft delete by marking as inactive
      supplier.isActive = false;
      await supplier.save();
      return { message: 'Supplier marked as inactive due to existing purchase orders' };
    }

    await this.suppliers.deleteOne({ _id: id, tenantId });
    return { message: 'Supplier deleted successfully' };
  }
}

export default SupplierService;

