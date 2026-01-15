# Debug Guide - Login Issues

## Common Issues and Solutions

### 1. CORS Errors
**Symptom**: Network errors in browser console, requests blocked

**Solution**: 
- Check `.env.development.local` has `ORIGIN=http://localhost:5173` (or your frontend URL)
- Restart backend server after changing env variables

### 2. Login Not Working
**Symptom**: Login form submits but nothing happens

**Check**:
1. Backend is running on port 3000
2. Frontend API URL is correct (`VITE_API_URL=http://localhost:3000`)
3. Check browser console for errors
4. Check Network tab - is the request being sent?
5. Check backend logs for errors

### 3. Response Structure Mismatch
**Fixed**: Backend now returns `{ success, token, user }` which matches frontend expectations

### 4. Wrong User Model
**Fixed**: Login service now uses `InventoryUser` model instead of `login.model`

### 5. Testing Login

**Test with seeded data:**
```bash
# Make sure database is seeded
cd backend
npm run seed

# Then login with:
Email: owner@techstore.com
Password: password123
```

**Test API directly:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@techstore.com","password":"password123"}'
```

### 6. Check Browser Console
Open DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for API requests
- Application tab > Local Storage for stored tokens

### 7. Verify Backend Response
The login endpoint should return:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "...",
    "email": "owner@techstore.com",
    "name": "John Owner",
    "role": "Owner",
    "tenantId": "..."
  }
}
```

### 8. Environment Variables

**Backend `.env.development.local`:**
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000
ORIGIN=http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:3000
```

