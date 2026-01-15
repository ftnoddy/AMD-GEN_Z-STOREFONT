# Seed Data Script

This script populates your MongoDB database with dummy data for testing the inventory management system.

## What Gets Created

- **1 Tenant**: TechStore Inc
- **3 Users**: Owner, Manager, Staff (all with password: `password123`)
- **3 Suppliers**: Electronics, Fashion, Home Essentials
- **4 Products**: Headphones, T-Shirt, Power Bank, Coffee Maker
- **21 SKUs**: Including variants (colors, sizes)
- **3 Purchase Orders**: Draft, Confirmed, and Received statuses
- **2 Customer Orders**: Fulfilled and Pending
- **4 Stock Movements**: Purchase, sale, and adjustment records

## How to Run

### Prerequisites
1. Make sure your `.env.development.local` file has `MONGO_URI` configured
2. Ensure MongoDB is running and accessible

### Run the Seed Script

```bash
cd backend
npm run seed
```

Or directly with ts-node:

```bash
npx ts-node -r tsconfig-paths/register src/scripts/seedInventoryData.ts
```

## Login Credentials

After seeding, you can login with:

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Owner   | owner@techstore.com        | password123 |
| Manager | manager@techstore.com      | password123 |
| Staff   | staff@techstore.com        | password123 |

## Data Highlights

### Low Stock Items (for testing alerts)
- **Headphones Black**: 5 units (threshold: 10)
- **T-Shirt M Blue**: 8 units (threshold: 10)

### Pending Purchase Order
- **PO-2024-000001**: Confirmed status, will replenish Headphones Black (20 units) and Power Bank (30 units)

### Test Scenarios

1. **Low Stock Alerts**: Dashboard should show Headphones Black and T-Shirt M Blue as low stock
2. **Smart Alerts**: Headphones Black should NOT alert because pending PO will replenish it
3. **Product Variants**: T-Shirt has 16 SKUs (4 sizes × 4 colors)
4. **Stock Movements**: Various types (purchase, sale, adjustment)
5. **Purchase Orders**: Different statuses to test workflows

## Clearing Data

The script automatically clears all existing data before seeding. If you want to keep existing data, comment out the deletion section in `seedInventoryData.ts`:

```typescript
// Comment out this section:
// await Promise.all([
//   StockMovementModel.deleteMany({}),
//   ...
// ]);
```

## Customization

You can modify `backend/src/scripts/seedInventoryData.ts` to:
- Add more products/suppliers
- Change quantities and prices
- Create different scenarios
- Add more users

## Troubleshooting

### Error: MONGO_URI is not defined
- Check your `.env.development.local` file
- Ensure `MONGO_URI` is set correctly

### Error: Cannot connect to MongoDB
- Verify MongoDB is running
- Check connection string format
- Ensure network access is allowed (for Atlas)

### Error: Duplicate key error
- The script clears data first, but if it fails mid-run, you may need to manually clear collections
- Or run the script again (it will clear first)

## Next Steps

After seeding:
1. Start your backend server: `npm run dev`
2. Test the API endpoints
3. Check the dashboard for analytics
4. Test low stock alerts
5. Create purchase orders and orders

