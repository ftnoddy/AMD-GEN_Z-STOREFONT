# Image Upload Guide

This guide explains the different options for handling image uploads in the inventory management system.

## Options Overview

### Option 1: Direct URL (Simplest - Recommended for MVP)
**Best for:** Quick development, MVP, or when using external image services

**How it works:**
- Frontend uploads images to a service (Cloudinary, Imgur, etc.) or uses existing URLs
- Backend accepts image URLs as strings
- No backend file handling needed

**Pros:**
- Simplest implementation
- No server storage needed
- Works immediately
- Can use free image hosting services

**Cons:**
- Relies on external services
- Less control over images

**Implementation:**
```typescript
// In your product model, just accept image URL
{
  image: String, // Just store the URL
}
```

---

### Option 2: Local Storage (Development)
**Best for:** Local development, testing

**How it works:**
- Images stored in `uploads/images/` folder
- Multer handles file uploads
- Returns relative path to image

**Pros:**
- No external dependencies
- Good for development
- Full control

**Cons:**
- Not scalable
- Not suitable for production
- Requires static file serving

**Implementation:**
```typescript
// Use uploadLocal from utils/imageUpload.ts
import { uploadLocal } from '@/utils/imageUpload';

router.post('/products', uploadLocal.single('image'), createProduct);
```

**Setup:**
1. Create `uploads/images/` directory
2. Serve static files in Express:
```typescript
app.use('/uploads', express.static('uploads'));
```

---

### Option 3: Cloud Storage (Production - Recommended)
**Best for:** Production deployments

**Options:**
- **AWS S3** - Most popular, scalable
- **Cloudinary** - Image optimization built-in
- **Google Cloud Storage** - Good Google Cloud integration
- **Azure Blob Storage** - Good for Azure deployments

**How it works:**
- Multer stores file in memory
- Upload to cloud storage service
- Store cloud URL in database

**Pros:**
- Scalable
- CDN support
- Reliable
- Image optimization available

**Cons:**
- Requires cloud account
- Additional setup
- May have costs

**Implementation Example (Cloudinary):**
```typescript
import cloudinary from 'cloudinary';
import { uploadMemory } from '@/utils/imageUpload';

router.post('/products', uploadMemory.single('image'), async (req, res) => {
  if (req.file) {
    const result = await cloudinary.v2.uploader.upload_stream(
      { folder: 'inventory/products' },
      (error, result) => {
        if (error) throw error;
        // Save result.secure_url to database
      }
    ).end(req.file.buffer);
  }
});
```

---

## Recommended Approach for Your Project

### For Development/Testing:
Use **Option 1 (Direct URL)** - Simplest and fastest:
- Frontend can use placeholder images or upload to free services
- Backend just stores URLs
- No additional setup needed

### For Production:
Use **Option 3 (Cloud Storage)**:
- **Cloudinary** is easiest to set up (free tier available)
- **AWS S3** if you're already using AWS
- Provides CDN, optimization, and reliability

---

## Current Setup

The project includes:
- `backend/src/middlewares/upload.ts` - Basic multer setup (memory storage)
- `backend/src/utils/imageUpload.ts` - Enhanced upload utilities with multiple options

## Quick Start

### Using Direct URLs (Recommended for now):
```typescript
// In your product creation, just accept image URL
POST /api/inventory/products
{
  "name": "Product Name",
  "image": "https://example.com/image.jpg", // Direct URL
  ...
}
```

### Using Local Storage:
1. Create uploads directory: `mkdir -p backend/uploads/images`
2. Add static file serving in `app.ts`:
```typescript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```
3. Use `uploadLocal` middleware in routes

### Using Cloud Storage:
1. Install cloud provider SDK (e.g., `npm install cloudinary`)
2. Configure credentials in `.env`
3. Use `uploadMemory` + cloud upload function

---

## Example: Product Image Upload Route

```typescript
// Option 1: Direct URL (Simplest)
router.post('/products', authMiddleware, tenantMiddleware, async (req, res) => {
  const product = await productService.createProduct(req.tenantId, {
    ...req.body,
    image: req.body.image, // Just accept URL from frontend
  });
  res.json({ success: true, data: product });
});

// Option 2: Local Upload
router.post('/products', 
  authMiddleware, 
  tenantMiddleware, 
  uploadLocal.single('image'),
  async (req, res) => {
    const product = await productService.createProduct(req.tenantId, {
      ...req.body,
      image: req.file ? `/uploads/images/${req.file.filename}` : undefined,
    });
    res.json({ success: true, data: product });
  }
);
```

---

## Summary

**For your company interview assignment:**
- **Start with Option 1 (Direct URLs)** - Fastest to implement
- Mention in documentation that production would use cloud storage
- This shows you understand the trade-offs without over-engineering

