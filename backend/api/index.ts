import App from '../src/app';
import IndexRoute from '../src/routes/index.route';
import UsersRoute from '../src/routes/users.route';
import LoginRoute from '../src/routes/login.route';
import ProductsRoute from '../src/routes/products.route';
import SKUsRoute from '../src/routes/skus.route';
import OrdersRoute from '../src/routes/orders.route';
import SuppliersRoute from '../src/routes/suppliers.route';
import PurchaseOrdersRoute from '../src/routes/purchase-orders.route';
import StockMovementsRoute from '../src/routes/stock-movements.route';
import DashboardRoute from '../src/routes/dashboard.route';
import StoreRoute from '../src/routes/store.route';

const app = new App([
  new IndexRoute(),
  new UsersRoute(),
  new LoginRoute(),
  new ProductsRoute(),
  new SKUsRoute(),
  new OrdersRoute(),
  new SuppliersRoute(),
  new PurchaseOrdersRoute(),
  new StockMovementsRoute(),
  new DashboardRoute(),
  new StoreRoute(),
]);

// Export the Express app for Vercel
export default app.getApp();
