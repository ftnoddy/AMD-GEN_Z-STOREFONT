# Environment Variables Setup

## Required Steps

1. **Create `.env.development.local` file** in the `backend/` root directory with the following content:

```env
# Application
NODE_ENV=development
PORT=3000

# Database Configuration - MongoDB Connection String (Recommended)
MONGO_URI=mongodb+srv://atindramohandas353:jTinQAfHxGYEeot4@cluster0.ijljceb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Alternative: If using separate DB config (legacy)
# DB_HOST=mongodb://localhost:27017
# DB_PORT=27017
# DB_DATABASE=inventory_management

# Security Keys (CHANGE THESE IN PRODUCTION!)
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-key-change-in-production-min-32-chars

# CORS & Security
ORIGIN=http://localhost:5173
CREDENTIALS=true

# Logging
LOG_FORMAT=dev
LOG_DIR=./logs
```

**Note:** The system will use `MONGO_URI` if provided, otherwise it will fall back to constructing the connection string from `DB_HOST`, `DB_PORT`, and `DB_DATABASE`.

2. **Update the values** according to your setup:
   - `DB_HOST`: Your MongoDB connection string
   - `DB_DATABASE`: Your database name
   - `SECRET_KEY` and `JWT_SECRET`: Generate strong random keys for production
   - `ORIGIN`: Your frontend URL (default: http://localhost:5173)

3. **The config file** (`src/config/index.ts`) will automatically load `.env.development.local` from the backend root directory.

## File Location

The `.env.development.local` file should be located at:
```
backend/.env.development.local
```

## Notes

- This file is gitignored (not committed to version control)
- For production, create `.env.production.local` with production values
- Never commit actual secrets to the repository

