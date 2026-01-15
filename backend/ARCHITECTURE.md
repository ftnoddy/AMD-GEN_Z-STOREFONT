# Multi-Tenant Inventory Management System - Architecture

## Overview

SaaS platform for inventory management with complete multi-tenant data isolation. Built with Node.js + Express + TypeScript, MongoDB, and React.

---

## 1. Multi-Tenancy Strategy

### Approach: Row-Level Isolation

All data stored in shared collections with `tenantId` field for filtering.

**Why?**
- ✅ Cost-effective (single database)
- ✅ Easier operations (backups, migrations)
- ✅ Good scalability (thousands of tenants)
- ⚠️ Requires careful query design (mitigated by middleware)

**Implementation:**
- **Tenant Middleware**: Automatically extracts `tenantId` from JWT and injects into all queries
- **All Models**: Include `tenantId` as first field with index
- **Compound Indexes**: All indexes start with `tenantId` (e.g., `{ tenantId: 1, category: 1 }`)
- **Unique Constraints**: Include `tenantId` (e.g., `{ tenantId: 1, sku: 1 }` unique)

```typescript
// Automatic tenant filtering
const query = addTenantFilter(req.tenantId!);
const products = await ProductModel.find(query);
```

---

## 2. Data Modeling Decisions

### Product Variants: Hybrid Model

**Structure:**
- **Product**: Contains metadata and variant template
- **SKUs**: Separate documents per variant combination with individual stock

**Example:**
```typescript
// Product
{ name: "T-Shirt", hasVariants: true, variantOptions: [...] }

// SKUs (6 documents for 3 sizes × 2 colors)
[
  { sku: "TS-001-S-RED", variantCombination: { Size: "S", Color: "Red" }, stock: 10 },
  { sku: "TS-001-S-BLUE", variantCombination: { Size: "S", Color: "Blue" }, stock: 15 },
  // ... 4 more
]
```

**Why?**
- Individual stock tracking per variant
- Flexible pricing per variant
- Efficient queries: `SKUModel.find({ productId })`
- Supports both variant and non-variant products

**Trade-off:** More documents vs. better query performance and flexibility

### Stock Movements: Separate Collection

**Why?**
- Complete audit trail
- Query by SKU, product, date range
- Avoids document size limits (16MB)
- Better performance for large datasets

**Trade-off:** More documents vs. auditability and scalability

---

## 3. Concurrency Handling

### Solution: MongoDB Transactions + Optimistic Locking

**Problem:** Multiple users ordering same SKU simultaneously → prevent negative stock

**Implementation:**

1. **Optimistic Locking**: Each SKU has `version` field
   ```typescript
   // Update with version check
   await SKUModel.updateOne(
     { _id: skuId, version: currentVersion },
     { $set: { stock: newStock }, $inc: { version: 1 } }
   );
   // If modifiedCount === 0 → concurrent modification detected
   ```

2. **MongoDB Transactions**: All stock operations atomic
   ```typescript
   const session = await mongoose.startSession();
   session.startTransaction();
   try {
     // Check stock → Update SKU → Create movement → Create order
     await session.commitTransaction();
   } catch (error) {
     await session.abortTransaction();
   }
   ```

**Why?**
- Prevents negative stock
- Handles concurrent orders gracefully
- Maintains data integrity
- Clear error messages for retries

**Trade-off:** Performance overhead vs. data integrity (chose integrity)

---

## 4. Performance Optimization

### Database Indexing

**Strategy:** Index for common queries, always starting with `tenantId`

**Critical Indexes:**
```typescript
// Products
{ tenantId: 1, category: 1 }
{ tenantId: 1, name: 1 }
{ tenantId: 1, supplierId: 1 }

// SKUs
{ tenantId: 1, sku: 1 }           // Unique
{ tenantId: 1, productId: 1 }
{ tenantId: 1, stock: 1 }         // Low stock queries

// Stock Movements
{ tenantId: 1, skuId: 1, timestamp: -1 }
{ tenantId: 1, productId: 1, timestamp: -1 }

// Orders
{ tenantId: 1, orderNumber: 1 }   // Unique
{ tenantId: 1, status: 1 }
```

### Dashboard Optimization

**Challenge:** Load in <2 seconds with 10,000+ products

**Solution:**
- MongoDB aggregation pipelines (server-side calculation)
- Parallel queries using `Promise.all()`
- Selective field fetching (`.select()`, `.populate()`)
- Lean queries for read-only (`.lean()`)

**Example:**
```typescript
const result = await SKUModel.aggregate([
  { $match: { tenantId: new ObjectId(tenantId) } },
  { $group: { _id: null, totalValue: { $sum: { $multiply: ['$stock', '$price'] } } } }
]);
```

---

## 5. Scalability Considerations

### Horizontal Scaling

**Database:**
- MongoDB Atlas (managed service)
- Replica sets for read-heavy workloads
- Sharding by `tenantId` for very large scale

**Application:**
- Stateless design (JWT tokens)
- Load balancing across multiple instances
- PM2 cluster mode or Kubernetes

### Data Growth

**Expected per tenant:**
- Products: 1,000-10,000
- SKUs: 5,000-50,000
- Stock Movements: 100K-1M/year
- Orders: 10K-100K/year

**Mitigation:**
- Optimized indexes for tenant-scoped queries
- Aggregation pipelines for analytics
- Pagination for large result sets
- Archiving old data (future)

---

## 6. Trade-offs and Decisions

| Decision | Chosen | Why |
|----------|--------|-----|
| **Isolation** | Row-Level | Cost-effective, simpler operations |
| **Locking** | Optimistic | Better performance, no deadlocks |
| **Consistency** | Strong (Transactions) | Stock accuracy is critical |
| **Collections** | Separate | Better scalability and query performance |
| **Auth** | JWT (Stateless) | Horizontal scaling, no session store |
| **Architecture** | Service Layer | Testable, maintainable, reusable |
| **Language** | TypeScript | Type safety, better DX |

---

## 7. Security

### Tenant Isolation
- **Middleware**: Automatic `tenantId` filtering
- **Helper Functions**: `addTenantFilter()` ensures consistency
- **Model Validation**: All models require `tenantId`
- **Index Constraints**: Unique constraints include `tenantId`

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Role-Based Access**: Owner (full), Manager (inventory/orders), Staff (view/process)
- **Protected Routes**: Middleware enforces authentication

---

## 8. Future Enhancements

- **Real-Time**: Socket.io for live updates
- **Caching**: Redis for frequently accessed data
- **Analytics**: Advanced reporting and forecasting
- **Multi-Region**: Database replication across regions
- **Webhooks**: External system integrations

---

## Conclusion

**Priorities:**
1. **Data Integrity**: Transactions + optimistic locking
2. **Scalability**: Row-level isolation with proper indexing
3. **Performance**: Aggregation pipelines + optimized queries
4. **Maintainability**: Service layer pattern + TypeScript
5. **Security**: Multi-layer tenant isolation

**Designed for:** Thousands of tenants with 10,000+ products each, maintaining data integrity and excellent performance.
