import App from '@/app';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import LoginRoute from './routes/login.route';
import ProductsRoute from './routes/products.route';
import SKUsRoute from './routes/skus.route';
import OrdersRoute from './routes/orders.route';
import SuppliersRoute from './routes/suppliers.route';
import PurchaseOrdersRoute from './routes/purchase-orders.route';
import StockMovementsRoute from './routes/stock-movements.route';
import DashboardRoute from './routes/dashboard.route';

validateEnv();

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
]);

app.listen();
