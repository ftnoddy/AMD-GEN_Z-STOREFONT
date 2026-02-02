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
import CustomerModel from '@/models/customer.model';
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
      CustomerModel.deleteMany({}),
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

    // 2b. Create store customers (for user app login)
    console.log('\n🛒 Creating store customers...');
    await CustomerModel.create({
      tenantId: tenant._id,
      email: 'customer@example.com',
      name: 'Alice Customer',
      password: hashedPassword,
      phone: '+1-555-0199',
      isActive: true,
    });
    console.log('✅ Created store customer: customer@example.com / password123 (store: techstore)');

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
        basePrice: 4999,
        supplierId: suppliers[0]._id,
        image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Black', 'White'] }],
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
      // --- User-provided product data ---
      {
        tenantId: tenant._id,
        name: 'Premium Cotton T-Shirt',
        description: 'Soft premium cotton t-shirt for daily wear.',
        category: 'Clothing',
        brand: 'UrbanWear',
        basePrice: 799,
        image: 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Black', 'White'] }],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Running Shoes',
        description: 'Lightweight running shoes for daily training.',
        category: 'Footwear',
        brand: 'SpeedX',
        basePrice: 2999,
        image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Red', 'Black'] }],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Noise Cancelling Wireless Headphones',
        description: 'Over-ear wireless headphones with ANC.',
        category: 'Electronics',
        brand: 'SoundMax',
        basePrice: 4999,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Matte Black', 'Silver'] }],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Smart Watch',
        description: 'Fitness tracking smartwatch with heart rate monitor.',
        category: 'Wearables',
        brand: 'FitPulse',
        basePrice: 3499,
        image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Black Strap', 'Silver'] }],
        isActive: true,
      },
      // --- Additional product data ---
      {
        tenantId: tenant._id,
        name: 'Laptop Backpack',
        description: 'Daily backpack with laptop compartment, breathable back panel, and water-resistant fabric.',
        category: 'Bags',
        brand: 'CityCarry',
        basePrice: 2499,
        image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Grey', 'Black'] }],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Slim Fit Denim Jeans',
        description: 'Slim-fit jeans with stretch fabric, classic five-pocket style.',
        category: 'Clothing',
        brand: 'BlueEdge',
        basePrice: 1999,
        image: 'https://images.unsplash.com/photo-1593032465171-9fc5262d0ba6',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Dark Blue', 'Black'] }],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Mini Bluetooth Speaker',
        description: 'Compact wireless speaker with strong bass, 10-hour battery, and waterproof rating.',
        category: 'Electronics',
        brand: 'SoundBeat',
        basePrice: 1499,
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Blue', 'Red'] }],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Eco Yoga Mat',
        description: 'Non-slip, eco-friendly yoga mat with extra cushioning.',
        category: 'Fitness',
        brand: 'ZenFlex',
        basePrice: 1199,
        image: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437e5',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Teal', 'Purple'] }],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Aviator Sunglasses',
        description: 'Classic aviator sunglasses with UV400 protection and metal frame.',
        category: 'Accessories',
        brand: 'ShadePro',
        basePrice: 1799,
        image: 'https://images.unsplash.com/photo-1510853673154-1b9761ba1130',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Gold Frame / Black Lens', 'Silver Frame / Blue Lens'] }],
        isActive: true,
      },
      {
        tenantId: tenant._id,
        name: 'Steel Water Bottle',
        description: 'Double-wall insulated steel bottle keeps drinks cold for 24h or hot for 12h.',
        category: 'Home',
        brand: 'HydroMate',
        basePrice: 899,
        image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg',
        hasVariants: true,
        variantOptions: [{ name: 'Color', values: ['Black', 'Blue'] }],
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${products.length} products`);

    // 5. Create SKUs
    console.log('\n🏷️  Creating SKUs...');
    const skus: any[] = [];

    // Wireless Headphones (products[0]) - 2 color variants
    const wirelessHeadphoneVariants = [
      { colorName: 'Black', sku: 'HP-BLK', price: 4999, stock: 20 },
      { colorName: 'White', sku: 'HP-WHT', price: 4999, stock: 15 },
    ];
    for (const v of wirelessHeadphoneVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[0]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
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

    // Premium Cotton T-Shirt (products[4]) - 2 color variants
    const premiumTshirtVariants = [
      { colorName: 'Black', sku: 'TS-BLK', price: 799, stock: 50 },
      { colorName: 'White', sku: 'TS-WHT', price: 799, stock: 40 },
    ];
    for (const v of premiumTshirtVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[4]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // Running Shoes (products[5]) - 2 color variants
    const runningShoesVariants = [
      { colorName: 'Red', sku: 'SH-RED', price: 2999, stock: 25 },
      { colorName: 'Black', sku: 'SH-BLK', price: 2899, stock: 30 },
    ];
    for (const v of runningShoesVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[5]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // Noise Cancelling Wireless Headphones (products[6]) - 2 color variants
    const ancHeadphonesVariants = [
      { colorName: 'Matte Black', sku: 'HP-BLK-01', price: 4999, stock: 15 },
      { colorName: 'Silver', sku: 'HP-SLV-01', price: 5199, stock: 10 },
    ];
    for (const v of ancHeadphonesVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[6]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // Smart Watch (products[7]) - 2 variants
    const smartWatchVariants = [
      { colorName: 'Black Strap', sku: 'SW-BLK', price: 3499, stock: 22 },
      { colorName: 'Silver', sku: 'SW-SLV', price: 3599, stock: 18 },
    ];
    for (const v of smartWatchVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[7]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // Laptop Backpack (products[8]) - 2 color variants
    const backpackVariants = [
      { colorName: 'Grey', sku: 'BP-GRY', price: 2499, stock: 30 },
      { colorName: 'Black', sku: 'BP-BLK', price: 2499, stock: 25 },
    ];
    for (const v of backpackVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[8]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // Slim Fit Denim Jeans (products[9]) - 2 color variants
    const jeansVariants = [
      { colorName: 'Dark Blue', sku: 'JEANS-DBL-32', price: 1999, stock: 14 },
      { colorName: 'Black', sku: 'JEANS-BLK-32', price: 1999, stock: 10 },
    ];
    for (const v of jeansVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[9]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // Mini Bluetooth Speaker (products[10]) - 2 color variants
    const speakerVariants = [
      { colorName: 'Blue', sku: 'SPKR-BLU', price: 1499, stock: 30 },
      { colorName: 'Red', sku: 'SPKR-RED', price: 1499, stock: 25 },
    ];
    for (const v of speakerVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[10]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // Eco Yoga Mat (products[11]) - 2 color variants
    const yogaMatVariants = [
      { colorName: 'Teal', sku: 'MAT-TEAL', price: 1199, stock: 22 },
      { colorName: 'Purple', sku: 'MAT-PURP', price: 1299, stock: 18 },
    ];
    for (const v of yogaMatVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[11]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // Aviator Sunglasses (products[12]) - 2 variants
    const sunglassesVariants = [
      { colorName: 'Gold Frame / Black Lens', sku: 'SUN-GOLD-BLK', price: 1799, stock: 16 },
      { colorName: 'Silver Frame / Blue Lens', sku: 'SUN-SILV-BLU', price: 1899, stock: 12 },
    ];
    for (const v of sunglassesVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[12]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

    // Steel Water Bottle (products[13]) - 2 color variants
    const waterBottleVariants = [
      { colorName: 'Black', sku: 'WB-BLK', price: 899, stock: 40 },
      { colorName: 'Blue', sku: 'WB-BLU', price: 899, stock: 35 },
    ];
    for (const v of waterBottleVariants) {
      skus.push({
        tenantId: tenant._id,
        productId: products[13]._id,
        sku: v.sku,
        variantCombination: { Color: v.colorName },
        price: v.price,
        stock: v.stock,
        lowStockThreshold: 10,
        version: 0,
      });
    }

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
            variantInfo: 'Black',
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

