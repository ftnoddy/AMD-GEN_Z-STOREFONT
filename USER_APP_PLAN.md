# User Application – Master Plan

**Goal:** Build a **customer-facing app** (storefront) where end users browse a tenant’s catalog, add to cart, checkout, and (optionally) create an account to see order history.  
**Admin app** = already done. **User app** = this plan.

---

## What We Have vs What We Need

| Area | Admin (Done) | User App (To Build) |
|------|--------------|---------------------|
| **Who** | Owner / Manager / Staff (InventoryUser) | Customers (shoppers) |
| **Auth** | JWT + tenantId (admin login) | Optional: Customer login or guest checkout |
| **Catalog** | Protected APIs (auth + tenant) | Public APIs per store (by tenant subdomain) |
| **Orders** | Create on behalf of customer, fulfill, cancel | Customer places order (guest or logged-in), view “My Orders” |
| **Data** | Products, SKUs, Orders, Suppliers, POs, etc. | Same products/SKUs per tenant; Orders linked to customer when logged in |

---

## How the User App Fits Multi-Tenancy

- Each **tenant** = one “store” (e.g. Acme Corp → subdomain `acme`).
- **Store identity:** We already have `Tenant.subdomain`. User app uses it in the URL, e.g. `yourapp.com/store/acme` or `acme.yourapp.com`.
- **One user app** can serve all tenants: tenant is chosen by **store subdomain/path** (e.g. path `/store/:storeSlug` where `storeSlug` = tenant’s `subdomain`).
- Customers are **per-tenant**: same email can be different customers in different stores.

---

## Plan Overview (Step-by-Step)

We do **Backend first** (so the UI always has real APIs), then **UI** in clear phases. No confusion: one phase at a time.

| Phase | Focus | Outcome |
|-------|--------|---------|
| **0** | Backend – Store & public catalog | Resolve tenant by subdomain; public read-only product/SKU APIs |
| **1** | Backend – Customer & auth | Customer model, register/login (per store), JWT for customers |
| **2** | Backend – Orders for users | Create order from user app (guest + logged-in), “My Orders” API |
| **3** | User app UI – Foundation | New app (or area), design system, store selector, catalog list/grid |
| **4** | User app UI – Shopping flow | Product detail, cart, checkout (guest + optional login) |
| **5** | User app UI – Account | Customer account: profile, “My Orders”, order detail |

---

## Phase 0: Backend – Store Resolution & Public Catalog

**Why first:** User app must show a store’s products without admin login.

**Tasks:**

1. **Store resolution**
   - Add route: `GET /api/public/store/:subdomain` (or `/api/store/:subdomain/info`).
   - Resolve tenant by `subdomain`; return safe store info: `{ name, logo, currency, subdomain }` (no secrets).
   - If tenant not found or inactive → 404.

2. **Public catalog APIs** (no JWT; tenant from subdomain in path)
   - `GET /api/public/store/:subdomain/products` – List active products (paginated, optional category/search).
   - `GET /api/public/store/:subdomain/products/:productId` – Product detail + in-stock SKUs (prices, stock count or “in stock” / “low stock” only).
   - Use existing Product + SKU models; filter by `tenantId` (from resolved tenant) and `isActive: true`; only return fields safe for public (no internal IDs that leak structure).

3. **Security**
   - No auth required; tenant is identified only by subdomain. Optionally add rate limiting later.
   - Do not expose internal IDs in a guessable way; use existing ObjectIds if needed (or keep as-is; they are not secret).

**Deliverables:**  
- Store info endpoint.  
- Public products list + product detail (with SKUs) per store.  
- Clear doc: “User app calls these with `storeSlug = tenant.subdomain`.”

---

## Phase 1: Backend – Customer Model & Auth

**Why:** So returning users can log in and see “My Orders” and optionally save profile.

**Tasks:**

1. **Customer model**
   - New collection: `Customer`.
   - Fields: `tenantId`, `email`, `name`, `password` (hashed), `phone?`, `isActive`, `createdAt`, `updatedAt`.
   - Unique: `(tenantId, email)` (one customer per email per store).

2. **Customer auth**
   - `POST /api/public/store/:subdomain/auth/register` – Register customer for that store (tenantId from subdomain).
   - `POST /api/public/store/:subdomain/auth/login` – Login; return JWT containing `customerId`, `tenantId`, `email` (and optionally `storeSlug`).
   - Use same JWT approach as admin but separate secret or same with different `type` claim: `userType: 'customer'` so we never confuse admin vs customer tokens.

3. **Middleware**
   - Optional `customerAuthMiddleware`: resolve store from path, verify JWT, attach `req.customerId` and `req.tenantId` for “My Orders” and profile.

**Deliverables:**  
- Customer model + migrations (or seed).  
- Register + Login for store.  
- JWT and middleware for customer-only routes.

---

## Phase 2: Backend – User App Orders & “My Orders”

**Why:** Customers must be able to place orders and (if logged in) see their history.

**Tasks:**

1. **Order creation from user app**
   - Reuse existing order creation logic (stock check, transaction, stock movements).
   - New route: `POST /api/public/store/:subdomain/orders` with body: `{ items: [{ skuId, quantity }], customerName, customerEmail, customerPhone?, notes? }`.
   - If request has valid **customer JWT**: set `customerId` on order and optionally prefill name/email/phone from customer. **Do not** require `createdBy` (admin user).
   - If **guest**: no JWT; require at least customerName + customerEmail (and optionally customerPhone). Set `customerId` = null, `createdBy` = null (we need to make `createdBy` optional in Order model).
   - Order model change: `createdBy` optional (for user-app-originated orders).

2. **My Orders**
   - `GET /api/public/store/:subdomain/orders` – Requires customer JWT. Return orders where `customerId = req.customerId` and `tenantId = req.tenantId`, sorted by date.
   - `GET /api/public/store/:subdomain/orders/:orderId` – Same; ensure order belongs to this customer and tenant.

**Deliverables:**  
- Optional `createdBy` in Order schema.  
- Public place-order endpoint (guest + logged-in).  
- “My Orders” and single order detail for logged-in customers.

---

## Phase 3: User App UI – Foundation

**Why:** One place to build the storefront without mixing with admin code.

**Decisions:**

- **Option A:** New app in same repo, e.g. `frontend-user/` or `storefront/` (Vite + React, same stack as admin).  
- **Option B:** New area under same frontend, e.g. `/store/:storeSlug/*` with a different layout.  
- **Recommendation:** New app in same repo (`storefront/` or `user-app/`) for clear separation and different deployment if needed (e.g. `store.yourapp.com`).

**Tasks:**

1. **Scaffold**
   - Create `storefront/` (or `user-app/`) with Vite + React + TypeScript + Router.
   - Environment: `VITE_API_URL` and optionally `VITE_DEFAULT_STORE` (for dev).

2. **Design system**
   - Simple, modern, mobile-first (many users on phone).
   - Decide: reuse admin’s Tailwind/component library or minimal custom (buttons, cards, inputs, spacing). Aim for “best UX”: fast, clear CTAs, readable typography, good touch targets.

3. **Store context**
   - On load (or when user lands on `/store/:storeSlug`), call `GET /api/public/store/:storeSlug` (or your store info URL). Store result in React context: `{ storeSlug, name, logo, currency }`. Show 404 if store not found.

4. **Catalog page**
   - Route: `/store/:storeSlug` or `/store/:storeSlug/products`.
   - Fetch `GET /api/public/store/:storeSlug/products`. Display product cards (image, name, price range or “From $X”, category). Optional: category filter, search (if backend supports).

**Deliverables:**  
- Storefront app runs locally.  
- Store resolution + catalog list with real API.  
- Clean, responsive catalog UI.

---

## Phase 4: User App UI – Product Detail, Cart, Checkout

**Tasks:**

1. **Product detail**
   - Route: `/store/:storeSlug/products/:productId`.
   - Fetch product + SKUs. If variants: show selector (e.g. size/color); user picks one SKU. Show price, stock status, “Add to cart” (with chosen SKU and quantity).

2. **Cart**
   - Client-side cart (context or state): `{ skuId, productId, productName, sku, variantInfo?, quantity, price }`. Persist in `localStorage` keyed by `storeSlug` (so each store has its own cart).
   - Cart page: list items, update quantity, remove, show subtotal. CTA: “Proceed to checkout”.

3. **Checkout**
   - Page: collect name, email, phone (and address if you add it later). If customer is logged in, prefill and allow “Place order as [email]”.
   - Submit: `POST /api/public/store/:storeSlug/orders` with cart items and contact info. On success: show confirmation (order number, “Thank you”), clear cart, optional “View order” link (if logged in).
   - Handle errors (e.g. out of stock) with clear message.

**Deliverables:**  
- Product detail with variant selection and add-to-cart.  
- Cart (persisted per store) and checkout flow.  
- Order placement and success screen.

---

## Phase 5: User App UI – Account (Optional but Recommended)

**Tasks:**

1. **Customer auth UI**
   - Register: `/store/:storeSlug/register` – email, name, password, phone (optional).
   - Login: `/store/:storeSlug/login` – email, password. Store customer JWT (e.g. in memory or localStorage, keyed by storeSlug).

2. **Account area**
   - Route: `/store/:storeSlug/account` (or `/store/:storeSlug/me`). Protected: redirect to login if no customer JWT.
   - Tabs or sections: **Profile** (show/edit name, phone), **My Orders** (list from API), **Order detail** (single order by id).

3. **UX touches**
   - After login/register, redirect back to cart or previous page.  
   - On checkout, “Already have an account? Log in” to prefill and attach order to customer.

**Deliverables:**  
- Register/Login pages per store.  
- Account page with profile and “My Orders”.  
- Seamless “guest vs logged-in” checkout.

---

## Summary Table – Do in This Order

| Step | What | When done |
|------|------|-----------|
| 0 | Backend: store API + public products + product detail | User app can read catalog |
| 1 | Backend: Customer model + register/login + JWT | User app can have accounts |
| 2 | Backend: Place order (guest + customer) + My Orders API | User app can checkout and show history |
| 3 | UI: Storefront app + design + store context + catalog page | User sees products |
| 4 | UI: Product detail + cart + checkout + order success | User can complete purchase |
| 5 | UI: Register/Login + Account + My Orders | Best UX and returning users |

---

## Tech Stack (User App)

- **Frontend:** React, Vite, TypeScript, React Router.  
- **Styling:** Tailwind (same as admin) or your choice; keep it lightweight and responsive.  
- **State:** React state + context for store, cart, and customer auth.  
- **API:** Same backend base URL; all user-app calls go to `/api/public/store/:subdomain/...`.

---

## Success Criteria

- A customer can open `/store/acme`, see Acme’s products, open a product, add to cart, checkout as guest or after login, and see “Thank you” with order number.  
- Logged-in customer can go to “My Orders” and see their orders for that store.  
- No confusion with admin: admin app = inventory users + full APIs; user app = public + customer APIs only.  
- One plan, one phase at a time: follow this doc and we won’t get confused.

---

**Next step:** Phase 0 is done. Then Phase 1 (Customer model & auth), Phase 2 (Orders for users), then Phases 3–5 (UI).

---

## Phase 0 – Done (Backend)

- **Store:** `GET /api/public/store/:subdomain` – returns `{ id, name, subdomain, logo, currency }`. 404 if store not found.
- **Catalog:** `GET /api/public/store/:subdomain/products` – query: `category`, `search`, `page`, `limit`. Returns `{ products, pagination }`.
- **Product detail:** `GET /api/public/store/:subdomain/products/:productId` – returns `{ product, skus }` (product + in-stock SKUs with `id`, `sku`, `price`, `stock`, `inStock`, `lowStock`).
- **Seed store subdomain:** `techstore` (from seed script). Test: `GET /api/public/store/techstore`.

---

## Phase 1 – Done (Backend)

- **Customer model:** `Customer` collection with `tenantId`, `email`, `name`, `password`, `phone?`, `isActive`. Unique `(tenantId, email)`.
- **Register:** `POST /api/public/store/:subdomain/auth/register` – body: `{ email, name, password, phone? }`. Returns `{ token, customer }`. JWT includes `userType: 'customer'`, `customerId`, `tenantId`, `email`, `name`.
- **Login:** `POST /api/public/store/:subdomain/auth/login` – body: `{ email, password }`. Returns `{ token, customer }`.
- **Middleware:** `customerAuthMiddleware` – verifies customer JWT (rejects admin tokens), sets `req.customerId`, `req.tenantId`, `req.customer`. Use in Phase 2 for “My Orders”.
- **Seed:** Store customer `customer@example.com` / `password123` for store `techstore`. Run `npm run seed` to create.

---

## Phase 2 – Done (Backend)

- **Order model:** `createdBy` is optional (for user-app orders). **StockMovement:** `userId` optional (store-originated sales).
- **Place order:** `POST /api/public/store/:subdomain/orders` – body: `{ items: [{ skuId, quantity }], customerName?, customerEmail?, customerPhone?, notes? }`. Optional `Authorization: Bearer <customer JWT>`: if present, order is linked to customer and name/email/phone can be prefilled; if guest, `customerName` and `customerEmail` are required.
- **My Orders:** `GET /api/public/store/:subdomain/orders` – requires customer JWT. Returns orders for that customer. `GET /api/public/store/:subdomain/orders/:orderId` – requires customer JWT, returns single order if it belongs to the customer.
- **Middleware:** `optionalCustomerAuthMiddleware` used for place order (attaches customer when token present); `customerAuthMiddleware` used for My Orders (required).

---

## Phase 3 – Done (User App UI – Foundation)

- **Storefront app:** New app in `storefront/` – Vite + React + TypeScript + React Router + Tailwind. Run: `cd storefront && npm install && npm run dev` (dev server on port 5174).
- **Env:** `VITE_API_URL` (default `http://localhost:3000`), `VITE_DEFAULT_STORE` (default `techstore`). Copy `.env.example` to `.env.local` if needed.
- **Store context:** On `/store/:storeSlug`, store is fetched from `GET /api/public/store/:subdomain`. Context: `{ storeSlug, store, loading, error, setStoreSlug, refetch }`. 404 / “Store not found” if store fails.
- **Catalog page:** Route `/store/:storeSlug` and `/store/:storeSlug/products`. Fetches `GET /api/public/store/:storeSlug/products` (page 1, limit 24). Product cards: image, name, category, “From $X” or price, link to product detail (Phase 4). Mobile-first grid, loading skeletons, error state.
- **Layout:** Sticky header with store name/logo, “Shop” link. Store not found shows “Go home”.

---

## Phase 4 – Done (User App UI – Product Detail, Cart, Checkout)

- **Product detail:** Route `/store/:storeSlug/products/:productId`. Fetches product + SKUs; variant selector (if multiple SKUs); price, stock, “Only X left” / “Out of stock”; quantity + “Add to cart”. Cart context: `addItem({ skuId, productId, productName, sku, variantInfo?, quantity, price })`.
- **Cart:** Context `CartContext` – items keyed by `storeSlug` in localStorage (`storefront_cart_<storeSlug>`). Cart page: list items, update quantity, remove, subtotal + tax (10%), “Proceed to checkout”. Header: “Cart” link with badge count.
- **Checkout:** Form: name *, email *, phone, notes. Submit: `POST /api/public/store/:storeSlug/orders` with `items`, `customerName`, `customerEmail`, `customerPhone`, `notes` (guest; Phase 5 adds customer token). On success: redirect to `/store/:storeSlug/checkout/success` with state `{ orderNumber, totalAmount }`, clear cart.
- **Order success:** Shows “Thank you”, order number, total; “Continue shopping”. Phase 5: “My Orders” link when logged in.
 
 