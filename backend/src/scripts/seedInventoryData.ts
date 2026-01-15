import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import TenantModel from '@/models/tenant.model';
import InventoryUserModel from '@/models/inventory-user.model';
import SupplierModel from '@/models/supplier.model';
import ProductModel from '@/models/product.model';
import SKUModel from '@/models/sku.model';
import PurchaseOrderModel from '@/models/purchase-order.model';
import OrderModel from '@/models/order.model';
import StockMovementModel from '@/models/stock-movement.model';
import { MONGO_URI } from '@/config';

/**
 * Seed script to populate database with dummy inventory data
 * Usage: npx ts-node src/scripts/seedInventoryData.ts
 */

async function seedInventoryData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoUri = MONGO_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('\n🗑️  Clearing existing data...');
    await Promise.all([
      StockMovementModel.deleteMany({}),
      OrderModel.deleteMany({}),
      PurchaseOrderModel.deleteMany({}),
      SKUModel.deleteMany({}),
      ProductModel.deleteMany({}),
      SupplierModel.deleteMany({}),
      InventoryUserModel.deleteMany({}),
      TenantModel.deleteMany({}),
    ]);
    console.log('✅ Cleared existing data');

    // 1. Create Tenant
    console.log('\n📦 Creating tenant...');
    const tenant = await TenantModel.create({
      name: 'TechStore Inc',
      subdomain: 'techstore',
      logo: 'https://via.placeholder.com/150',
      settings: {
        currency: 'USD',
        timezone: 'America/New_York',
        lowStockThreshold: 10,
      },
    });
    console.log(`✅ Created tenant: ${tenant.name} (${tenant._id})`);

    // 2. Create Users
    console.log('\n👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const owner = await InventoryUserModel.create({
      tenantId: tenant._id,
      email: 'owner@techstore.com',
      name: 'John Owner',
      password: hashedPassword,
      role: 'Owner',
      avatar: 'https://i.pravatar.cc/150?img=1',
      phone: '+1-555-0101',
      isActive: true,
    });

    const manager = await InventoryUserModel.create({
      tenantId: tenant._id,
      email: 'manager@techstore.com',
      name: 'Jane Manager',
      password: hashedPassword,
      role: 'Manager',
      avatar: 'https://i.pravatar.cc/150?img=2',
      phone: '+1-555-0102',
      isActive: true,
    });

    const staff = await InventoryUserModel.create({
      tenantId: tenant._id,
      email: 'staff@techstore.com',
      name: 'Bob Staff',
      password: hashedPassword,
      role: 'Staff',
      avatar: 'https://i.pravatar.cc/150?img=3',
      phone: '+1-555-0103',
      isActive: true,
    });

    console.log(`✅ Created users: Owner, Manager, Staff`);
    console.log(`   Login credentials: email: owner@techstore.com, password: password123`);

    // 3. Create Suppliers
    console.log('\n🏭 Creating suppliers...');
    const suppliers = await SupplierModel.insertMany([
      {
        tenantId: tenant._id,
        name: 'Global Electronics Ltd',
        code: 'GEL001',
        contactPerson: 'Mike Johnson',
        email: 'mike@globalelectronics.com',
        phone: '+1-555-1001',
        address: {
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
        },
        paymentTerms: 'Net 30',
        taxId: 'TAX-GEL-001',
        rating: 4.5,
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Fashion Wholesale Co',
        code: 'FWC002',
        contactPerson: 'Sarah Williams',
        email: 'sarah@fashionwholesale.com',
        phone: '+1-555-1002',
        address: {
          street: '456 Fashion Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        paymentTerms: 'Net 15',
        taxId: 'TAX-FWC-002',
        rating: 4.2,
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Home Essentials Supply',
        code: 'HES003',
        contactPerson: 'David Brown',
        email: 'david@homeessentials.com',
        phone: '+1-555-1003',
        address: {
          street: '789 Home Road',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
        paymentTerms: 'Net 30',
        taxId: 'TAX-HES-003',
        rating: 4.0,
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${suppliers.length} suppliers`);

    // 4. Create Products with Variants
    console.log('\n📱 Creating products...');
    const products = await ProductModel.insertMany([
      {
        tenantId: tenant._id,
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with noise cancellation',
        category: 'Electronics',
        brand: 'TechAudio',
        basePrice: 79.99,
        supplierId: suppliers[0]._id,
        image: 'https://via.placeholder.com/400x400?text=Headphones',
        hasVariants: true,
        variantOptions: [
          { name: 'color', values: ['Black', 'White', 'Blue'] },
          { name: 'size', values: ['Standard'] },
        ],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Cotton T-Shirt',
        description: '100% cotton comfortable t-shirt',
        category: 'Clothing',
        brand: 'FashionBrand',
        basePrice: 24.99,
        supplierId: suppliers[1]._id,
        image: 'https://via.placeholder.com/400x400?text=T-Shirt',
        hasVariants: true,
        variantOptions: [
          { name: 'size', values: ['S', 'M', 'L', 'XL'] },
          { name: 'color', values: ['Red', 'Blue', 'Green', 'Black'] },
        ],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Power Bank 10000mAh',
        description: 'Portable power bank for mobile devices',
        category: 'Electronics',
        brand: 'PowerTech',
        basePrice: 29.99,
        supplierId: suppliers[0]._id,
        image: 'https://via.placeholder.com/400x400?text=PowerBank',
        hasVariants: false,
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Coffee Maker',
        description: 'Automatic drip coffee maker',
        category: 'Home & Kitchen',
        brand: 'HomeBrew',
        basePrice: 89.99,
        supplierId: suppliers[2]._id,
        image: 'https://via.placeholder.com/400x400?text=CoffeeMaker',
        hasVariants: false,
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${products.length} products`);

    // 5. Create SKUs
    console.log('\n🏷️  Creating SKUs...');
    const skus: any[] = [];

    // Headphones - 3 colors
    const headphoneColors = ['Black', 'White', 'Blue'];
    const headphoneColorCodes = ['BLK', 'WHT', 'BLU']; // Unique codes for each color
    for (let i = 0; i < 3; i++) {
      skus.push({
        tenantId: tenant._id,
        productId: products[0]._id,
        sku: `HP-${headphoneColorCodes[i]}-001`,
        variantCombination: { color: headphoneColors[i], size: 'Standard' },
        price: 79.99,
        cost: 45.00,
        stock: i === 0 ? 5 : 25, // Black has low stock
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // T-Shirts - 4 sizes × 4 colors = 16 SKUs
    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = ['Red', 'Blue', 'Green', 'Black'];
    const colorCodes: Record<string, string> = {
      'Red': 'RED',
      'Blue': 'BLU',
      'Green': 'GRN',
      'Black': 'BLK',
    };
    for (const size of sizes) {
      for (const color of colors) {
        const stock = size === 'M' && color === 'Blue' ? 8 : 30; // One low stock item
        skus.push({
          tenantId: tenant._id,
          productId: products[1]._id,
          sku: `TS-${size}-${colorCodes[color]}-001`,
          variantCombination: { size, color },
          price: 24.99,
          cost: 12.00,
          stock,
          lowStockThreshold: 10,
          version: 0,
        });
      }
    }

    // Power Bank - single SKU
    skus.push({
      tenantId: tenant._id,
      productId: products[2]._id,
      sku: 'PB-001',
      variantCombination: null,
      price: 29.99,
      cost: 15.00,
      stock: 50,
      lowStockThreshold: 10,
      version: 0,
    });

    // Coffee Maker - single SKU
    skus.push({
      tenantId: tenant._id,
      productId: products[3]._id,
      sku: 'CM-001',
      variantCombination: null,
      price: 89.99,
      cost: 50.00,
      stock: 15,
      lowStockThreshold: 10,
      version: 0,
    });

    const createdSKUs = await SKUModel.insertMany(skus);
    console.log(`✅ Created ${createdSKUs.length} SKUs`);

    // 6. Create Purchase Orders
    console.log('\n📋 Creating purchase orders...');
    const purchaseOrders = await PurchaseOrderModel.insertMany([
      {
        tenantId: tenant._id,
        poNumber: 'PO-2024-000001',
        supplierId: suppliers[0]._id,
        status: 'Confirmed',
        items: [
          {
            skuId: createdSKUs[0]._id, // Headphones Black
            productName: 'Wireless Headphones',
            sku: createdSKUs[0].sku,
            variantInfo: 'Black / Standard',
            orderedQuantity: 20,
            receivedQuantity: 0,
            orderedPrice: 45.00,
            lineTotal: 900.00,
          },
          {
            skuId: createdSKUs[2]._id, // Power Bank
            productName: 'Power Bank 10000mAh',
            sku: createdSKUs[2].sku,
            variantInfo: undefined,
            orderedQuantity: 30,
            receivedQuantity: 0,
            orderedPrice: 15.00,
            lineTotal: 450.00,
          },
        ],
        subtotal: 1350.00,
        tax: 135.00,
        shippingCost: 50.00,
        totalAmount: 1535.00,
        notes: 'Urgent order - need by next week',
        createdBy: manager._id,
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        confirmedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        tenantId: tenant._id,
        poNumber: 'PO-2024-000002',
        supplierId: suppliers[1]._id,
        status: 'Received',
        items: [
          {
            skuId: createdSKUs[3]._id, // T-Shirt S Red
            productName: 'Cotton T-Shirt',
            sku: createdSKUs[3].sku,
            variantInfo: 'S / Red',
            orderedQuantity: 50,
            receivedQuantity: 50,
            orderedPrice: 12.00,
            receivedPrice: 12.00,
            lineTotal: 600.00,
          },
        ],
        subtotal: 600.00,
        tax: 60.00,
        shippingCost: 25.00,
        totalAmount: 685.00,
        notes: 'Received in full',
        createdBy: owner._id,
        sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId: tenant._id,
        poNumber: 'PO-2024-000003',
        supplierId: suppliers[2]._id,
        status: 'Draft',
        items: [
          {
            skuId: createdSKUs[createdSKUs.length - 1]._id, // Coffee Maker
            productName: 'Coffee Maker',
            sku: createdSKUs[createdSKUs.length - 1].sku,
            variantInfo: undefined,
            orderedQuantity: 10,
            receivedQuantity: 0,
            orderedPrice: 50.00,
            lineTotal: 500.00,
          },
        ],
        subtotal: 500.00,
        tax: 50.00,
        shippingCost: 20.00,
        totalAmount: 570.00,
        notes: 'Draft order - pending approval',
        createdBy: staff._id,
      },
    ]);
    console.log(`✅ Created ${purchaseOrders.length} purchase orders`);

    // 7. Create Orders
    console.log('\n🛒 Creating customer orders...');
    const orders = await OrderModel.insertMany([
      {
        tenantId: tenant._id,
        orderNumber: 'ORD-2024-000001',
        customerName: 'Alice Customer',
        customerEmail: 'alice@example.com',
        customerPhone: '+1-555-2001',
        status: 'Fulfilled',
        items: [
          {
            skuId: createdSKUs[1]._id, // Headphones White
            productName: 'Wireless Headphones',
            sku: createdSKUs[1].sku,
            variantInfo: 'White / Standard',
            quantity: 2,
            fulfilledQuantity: 2,
            price: 79.99,
            lineTotal: 159.98,
          },
          {
            skuId: createdSKUs[3]._id, // T-Shirt S Red
            productName: 'Cotton T-Shirt',
            sku: createdSKUs[3].sku,
            variantInfo: 'S / Red',
            quantity: 3,
            fulfilledQuantity: 3,
            price: 24.99,
            lineTotal: 74.97,
          },
        ],
        subtotal: 234.95,
        tax: 23.50,
        totalAmount: 258.45,
        notes: 'Customer requested express shipping',
        createdBy: staff._id,
        fulfilledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId: tenant._id,
        orderNumber: 'ORD-2024-000002',
        customerName: 'Bob Buyer',
        customerEmail: 'bob@example.com',
        customerPhone: '+1-555-2002',
        status: 'Pending',
        items: [
          {
            skuId: createdSKUs[4]._id, // T-Shirt M Red
            productName: 'Cotton T-Shirt',
            sku: createdSKUs[4].sku,
            variantInfo: 'M / Red',
            quantity: 5,
            fulfilledQuantity: 0,
            price: 24.99,
            lineTotal: 124.95,
          },
        ],
        subtotal: 124.95,
        tax: 12.50,
        totalAmount: 137.45,
        createdBy: manager._id,
      },
    ]);
    console.log(`✅ Created ${orders.length} customer orders`);

    // 8. Create Stock Movements
    console.log('\n📊 Creating stock movements...');
    const stockMovements = await StockMovementModel.insertMany([
      {
        tenantId: tenant._id,
        skuId: createdSKUs[3]._id, // T-Shirt S Red
        productId: products[1]._id,
        type: 'purchase',
        quantity: 50,
        balanceBefore: 0,
        balanceAfter: 50,
        reference: purchaseOrders[1]._id.toString(),
        referenceType: 'purchase_order',
        note: 'Purchase order receipt: PO-2024-000002',
        userId: owner._id,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId: tenant._id,
        skuId: createdSKUs[1]._id, // Headphones White
        productId: products[0]._id,
        type: 'sale',
        quantity: -2,
        balanceBefore: 27,
        balanceAfter: 25,
        reference: orders[0]._id.toString(),
        referenceType: 'order',
        userId: staff._id,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId: tenant._id,
        skuId: createdSKUs[3]._id, // T-Shirt S Red
        productId: products[1]._id,
        type: 'sale',
        quantity: -3,
        balanceBefore: 50,
        balanceAfter: 47,
        reference: orders[0]._id.toString(),
        referenceType: 'order',
        userId: staff._id,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId: tenant._id,
        skuId: createdSKUs[0]._id, // Headphones Black
        productId: products[0]._id,
        type: 'adjustment',
        quantity: -10,
        balanceBefore: 15,
        balanceAfter: 5,
        note: 'Damaged items removed',
        referenceType: 'adjustment',
        userId: manager._id,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`✅ Created ${stockMovements.length} stock movements`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ SEED DATA SUMMARY');
    console.log('='.repeat(50));
    console.log(`Tenant: ${tenant.name} (${tenant.subdomain})`);
    console.log(`Users: ${await InventoryUserModel.countDocuments({ tenantId: tenant._id })}`);
    console.log(`Suppliers: ${await SupplierModel.countDocuments({ tenantId: tenant._id })}`);
    console.log(`Products: ${await ProductModel.countDocuments({ tenantId: tenant._id })}`);
    console.log(`SKUs: ${await SKUModel.countDocuments({ tenantId: tenant._id })}`);
    console.log(`Purchase Orders: ${await PurchaseOrderModel.countDocuments({ tenantId: tenant._id })}`);
    console.log(`Orders: ${await OrderModel.countDocuments({ tenantId: tenant._id })}`);
    console.log(`Stock Movements: ${await StockMovementModel.countDocuments({ tenantId: tenant._id })}`);
    console.log('\n📝 Login Credentials:');
    console.log('   Owner:  owner@techstore.com / password123');
    console.log('   Manager: manager@techstore.com / password123');
    console.log('   Staff:  staff@techstore.com / password123');
    console.log('\n✨ Seed data insertion completed successfully!');
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  seedInventoryData();
}

export default seedInventoryData;

