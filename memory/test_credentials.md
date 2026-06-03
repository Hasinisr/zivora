# ZIVORA Test Credentials

## Admin Account
- Email: `admin@zivora.com`
- Password: `admin@zivora2026`
- Role: admin
- Access: Admin dashboard at `/admin`

## Customer Test Account
- Sign up new accounts via `/signup` page
- Or use Google OAuth (test only)

## Razorpay Test Mode
- Key ID: `rzp_test_demo`
- Test Card: `4111 1111 1111 1111`
- CVV: any 3 digits
- Expiry: any future date

## Backend API Routes
Base URL: `https://grill-empire-india.preview.emergentagent.com/api`

### Auth
- POST `/auth/signup` - Create account
- POST `/auth/login` - Login
- POST `/auth/google` - Google OAuth
- GET `/auth/me` - Get profile (requires Bearer token)

### Products
- GET `/products` - List with filters: category, featured, bestseller, search, sort_by, limit
- GET `/products/{id}` or `/products/slug/{slug}` - Single product
- POST/PUT/DELETE `/products` - Admin only

### Cart, Wishlist, Orders, Addresses - all require auth
### Admin routes: `/admin/dashboard`, `/admin/orders`, `/admin/customers`, `/admin/custom-grills`
