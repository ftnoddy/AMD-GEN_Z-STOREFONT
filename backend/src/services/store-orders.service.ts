import OrderService from '@/services/orders.service';
import CustomerAuthService from '@/services/customer-auth.service';
import { HttpException } from '@/exceptions/HttpException';

export interface PlaceOrderBody {
  items: { skuId: string; quantity: number }[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

export interface StoreCustomer {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

/**
 * Store order flow for the user app: place order (guest or customer), My Orders.
 */
class StoreOrdersService {
  private orderService = new OrderService();
  private customerAuthService = new CustomerAuthService();

  /**
   * Place an order for a store. Guest or logged-in customer.
   */
  public async placeOrder(subdomain: string, body: PlaceOrderBody, customer?: StoreCustomer) {
    const tenantId = await this.customerAuthService.getTenantIdBySubdomain(subdomain);

    const customerName = body.customerName ?? customer?.name;
    const customerEmail = body.customerEmail ?? customer?.email;
    const customerPhone = body.customerPhone ?? customer?.phone ?? undefined;

    if (!customer) {
      if (!customerName || !customerEmail) {
        throw new HttpException(400, 'Guest checkout requires customerName and customerEmail');
      }
    }

    const order = await this.orderService.createOrder({
      tenantId,
      userId: undefined,
      customerId: customer?.id,
      body: {
        items: body.items,
        customerName: customerName!,
        customerEmail: customerEmail!,
        customerPhone: customerPhone || undefined,
        notes: body.notes,
      },
    });

    return order;
  }

  /**
   * My Orders – list orders for the logged-in customer.
   */
  public async getMyOrders(subdomain: string, customerId: string) {
    const tenantId = await this.customerAuthService.getTenantIdBySubdomain(subdomain);
    return this.orderService.getOrdersByCustomer(tenantId, customerId);
  }

  /**
   * Single order for the logged-in customer (must belong to them).
   */
  public async getMyOrderById(subdomain: string, customerId: string, orderId: string) {
    const tenantId = await this.customerAuthService.getTenantIdBySubdomain(subdomain);
    return this.orderService.getOrderByIdForCustomer(tenantId, customerId, orderId);
  }
}

export default StoreOrdersService;
