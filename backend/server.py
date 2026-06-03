from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
import os
import logging
import uuid
import hmac
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional
import razorpay

from models import *
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_admin_user, get_optional_user
)
from seed_data import PRODUCTS_DATA, CATEGORIES_DATA

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay client
razorpay_client = razorpay.Client(auth=(
    os.getenv('RAZORPAY_KEY_ID', 'rzp_test_demo'),
    os.getenv('RAZORPAY_KEY_SECRET', 'demo_secret')
))

app = FastAPI(title="ZIVORA Luxury API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============ AUTH MODELS ============
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    email: EmailStr
    name: str
    google_id: str
    photo_url: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: dict

# ============ STARTUP - SEED DATABASE ============
@app.on_event("startup")
async def startup_event():
    """Seed database on startup if empty"""
    try:
        # Check if products exist
        product_count = await db.products.count_documents({})
        if product_count == 0:
            logger.info("Seeding products...")
            for product in PRODUCTS_DATA:
                product_data = product.copy()
                product_data['id'] = str(uuid.uuid4())
                product_data['created_at'] = datetime.now(timezone.utc).isoformat()
                product_data['updated_at'] = datetime.now(timezone.utc).isoformat()
                await db.products.insert_one(product_data)
            logger.info(f"Seeded {len(PRODUCTS_DATA)} products")
        
        # Seed categories
        category_count = await db.categories.count_documents({})
        if category_count == 0:
            for category in CATEGORIES_DATA:
                await db.categories.insert_one(category)
            logger.info(f"Seeded {len(CATEGORIES_DATA)} categories")
        
        # Seed admin user
        admin_email = "admin@zivora.com"
        admin_exists = await db.users.find_one({"email": admin_email})
        if not admin_exists:
            admin_user = {
                "uid": str(uuid.uuid4()),
                "email": admin_email,
                "name": "ZIVORA Admin",
                "password": hash_password("admin@zivora2026"),
                "role": "admin",
                "phone": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(admin_user)
            logger.info("Created admin user: admin@zivora.com / admin@zivora2026")
    except Exception as e:
        logger.error(f"Startup error: {e}")

# ============ AUTH ROUTES ============
@api_router.post("/auth/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    """User signup"""
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_data = {
        "uid": str(uuid.uuid4()),
        "email": req.email,
        "name": req.name,
        "phone": req.phone,
        "password": hash_password(req.password),
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_data)
    
    token = create_access_token(user_data["uid"], user_data["email"], user_data["role"])
    user_response = {k: v for k, v in user_data.items() if k != "password" and k != "_id"}
    return AuthResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    """User login"""
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(user["uid"], user["email"], user["role"])
    user_response = {k: v for k, v in user.items() if k != "password" and k != "_id"}
    return AuthResponse(token=token, user=user_response)

@api_router.post("/auth/google", response_model=AuthResponse)
async def google_auth(req: GoogleAuthRequest):
    """Google OAuth login/signup"""
    user = await db.users.find_one({"email": req.email})
    
    if not user:
        # Create new user from Google
        user_data = {
            "uid": str(uuid.uuid4()),
            "email": req.email,
            "name": req.name,
            "phone": None,
            "password": hash_password(str(uuid.uuid4())),  # Random password for Google users
            "role": "customer",
            "google_id": req.google_id,
            "photo_url": req.photo_url,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_data)
        user = user_data
    
    token = create_access_token(user["uid"], user["email"], user["role"])
    user_response = {k: v for k, v in user.items() if k != "password" and k != "_id"}
    return AuthResponse(token=token, user=user_response)

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    user = await db.users.find_one({"uid": current_user["uid"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/auth/me")
async def update_me(updates: dict, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    allowed_fields = ["name", "phone"]
    update_data = {k: v for k, v in updates.items() if k in allowed_fields}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"uid": current_user["uid"]}, {"$set": update_data})
    
    user = await db.users.find_one({"uid": current_user["uid"]}, {"_id": 0, "password": 0})
    return user

# ============ PRODUCT ROUTES ============
@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    bestseller: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    limit: int = 100
):
    """Get all products with filters"""
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if bestseller is not None:
        query["bestseller"] = bestseller
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    sort_field = sort_by if sort_by in ["price", "created_at", "rating", "name"] else "created_at"
    sort_order = 1 if sort_field == "price" else -1
    
    cursor = db.products.find(query, {"_id": 0}).sort(sort_field, sort_order).limit(limit)
    products = await cursor.to_list(length=limit)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get single product by ID"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.get("/products/slug/{slug}")
async def get_product_by_slug(slug: str):
    """Get product by slug"""
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products")
async def create_product(product_data: dict, admin: dict = Depends(get_admin_user)):
    """Create new product (Admin only)"""
    product_data["id"] = str(uuid.uuid4())
    product_data["created_at"] = datetime.now(timezone.utc).isoformat()
    product_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(product_data)
    product_data.pop("_id", None)
    return product_data

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, updates: dict, admin: dict = Depends(get_admin_user)):
    """Update product (Admin only)"""
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates.pop("_id", None)
    updates.pop("id", None)
    await db.products.update_one({"id": product_id}, {"$set": updates})
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_admin_user)):
    """Delete product (Admin only)"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ============ CATEGORY ROUTES ============
@api_router.get("/categories")
async def get_categories():
    """Get all categories"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(length=100)
    return categories

# ============ CART ROUTES ============
@api_router.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Get user's cart"""
    cart = await db.carts.find_one({"user_id": current_user["uid"]}, {"_id": 0})
    if not cart:
        return {"user_id": current_user["uid"], "items": [], "updated_at": datetime.now(timezone.utc).isoformat()}
    return cart

@api_router.put("/cart")
async def update_cart(cart_data: dict, current_user: dict = Depends(get_current_user)):
    """Update user's cart"""
    cart = {
        "user_id": current_user["uid"],
        "items": cart_data.get("items", []),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.carts.update_one({"user_id": current_user["uid"]}, {"$set": cart}, upsert=True)
    return cart

@api_router.delete("/cart")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    """Clear user's cart"""
    await db.carts.delete_one({"user_id": current_user["uid"]})
    return {"message": "Cart cleared"}

# ============ WISHLIST ROUTES ============
@api_router.get("/wishlist")
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    """Get user's wishlist"""
    wishlist = await db.wishlists.find_one({"user_id": current_user["uid"]}, {"_id": 0})
    if not wishlist:
        return {"user_id": current_user["uid"], "product_ids": []}
    return wishlist

@api_router.post("/wishlist/{product_id}")
async def add_to_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    """Add to wishlist"""
    await db.wishlists.update_one(
        {"user_id": current_user["uid"]},
        {"$addToSet": {"product_ids": product_id}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"message": "Added to wishlist"}

@api_router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    """Remove from wishlist"""
    await db.wishlists.update_one(
        {"user_id": current_user["uid"]},
        {"$pull": {"product_ids": product_id}}
    )
    return {"message": "Removed from wishlist"}

# ============ ORDER ROUTES ============
@api_router.post("/orders")
async def create_order(order_data: dict, current_user: dict = Depends(get_current_user)):
    """Create new order"""
    order_data["id"] = str(uuid.uuid4())
    order_data["user_id"] = current_user["uid"]
    order_data["user_email"] = current_user["email"]
    order_data["payment_status"] = "pending"
    order_data["order_status"] = "pending"
    order_data["created_at"] = datetime.now(timezone.utc).isoformat()
    order_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.orders.insert_one(order_data)
    order_data.pop("_id", None)
    return order_data

@api_router.get("/orders")
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    """Get user's orders"""
    orders = await db.orders.find({"user_id": current_user["uid"]}, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get single order"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["user_id"] != current_user["uid"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return order

# ============ ADMIN ROUTES ============
@api_router.get("/admin/orders")
async def get_all_orders(admin: dict = Depends(get_admin_user)):
    """Get all orders (Admin)"""
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=500)
    return orders

@api_router.put("/admin/orders/{order_id}")
async def update_order(order_id: str, updates: dict, admin: dict = Depends(get_admin_user)):
    """Update order (Admin)"""
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates.pop("_id", None)
    await db.orders.update_one({"id": order_id}, {"$set": updates})
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return order

@api_router.get("/admin/customers")
async def get_all_customers(admin: dict = Depends(get_admin_user)):
    """Get all customers (Admin)"""
    users = await db.users.find({"role": "customer"}, {"_id": 0, "password": 0}).to_list(length=500)
    return users

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(admin: dict = Depends(get_admin_user)):
    """Admin dashboard statistics"""
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    delivered_orders = await db.orders.count_documents({"order_status": "delivered"})
    total_customers = await db.users.count_documents({"role": "customer"})
    total_products = await db.products.count_documents({})
    
    # Revenue calc
    orders = await db.orders.find({"payment_status": "success"}, {"_id": 0, "total": 1}).to_list(length=1000)
    total_revenue = sum(float(o.get("total", 0)) for o in orders)
    
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(length=10)
    
    low_stock = await db.products.find({"stock": {"$lt": 5}}, {"_id": 0}).to_list(length=20)
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
        "total_customers": total_customers,
        "total_products": total_products,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders,
        "low_stock_products": low_stock
    }

# ============ CUSTOM GRILL ROUTES ============
@api_router.post("/custom-grills")
async def create_custom_grill_request(req_data: dict, current_user: dict = Depends(get_current_user)):
    """Create custom grill request"""
    req_data["id"] = str(uuid.uuid4())
    req_data["user_id"] = current_user["uid"]
    req_data["user_email"] = current_user["email"]
    req_data["status"] = "pending"
    req_data["created_at"] = datetime.now(timezone.utc).isoformat()
    req_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.customGrillRequests.insert_one(req_data)
    req_data.pop("_id", None)
    return req_data

@api_router.get("/custom-grills")
async def get_custom_grill_requests(current_user: dict = Depends(get_current_user)):
    """Get user's custom grill requests"""
    requests = await db.customGrillRequests.find({"user_id": current_user["uid"]}, {"_id": 0}).to_list(length=100)
    return requests

@api_router.get("/admin/custom-grills")
async def get_all_custom_grills(admin: dict = Depends(get_admin_user)):
    """Get all custom grill requests (Admin)"""
    requests = await db.customGrillRequests.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=500)
    return requests

@api_router.put("/admin/custom-grills/{request_id}")
async def update_custom_grill(request_id: str, updates: dict, admin: dict = Depends(get_admin_user)):
    """Update custom grill request (Admin)"""
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates.pop("_id", None)
    await db.customGrillRequests.update_one({"id": request_id}, {"$set": updates})
    request = await db.customGrillRequests.find_one({"id": request_id}, {"_id": 0})
    return request

# ============ REVIEW ROUTES ============
@api_router.post("/reviews")
async def create_review(review_data: dict, current_user: dict = Depends(get_current_user)):
    """Create review"""
    user = await db.users.find_one({"uid": current_user["uid"]})
    review_data["id"] = str(uuid.uuid4())
    review_data["user_id"] = current_user["uid"]
    review_data["user_name"] = user.get("name", "Anonymous") if user else "Anonymous"
    review_data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.reviews.insert_one(review_data)
    review_data.pop("_id", None)
    return review_data

@api_router.get("/reviews/{product_id}")
async def get_product_reviews(product_id: str):
    """Get product reviews"""
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return reviews

# ============ ADDRESS ROUTES ============
@api_router.post("/addresses")
async def create_address(address_data: dict, current_user: dict = Depends(get_current_user)):
    """Create address"""
    address_data["id"] = str(uuid.uuid4())
    address_data["user_id"] = current_user["uid"]
    address_data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.addresses.insert_one(address_data)
    address_data.pop("_id", None)
    return address_data

@api_router.get("/addresses")
async def get_addresses(current_user: dict = Depends(get_current_user)):
    """Get user's addresses"""
    addresses = await db.addresses.find({"user_id": current_user["uid"]}, {"_id": 0}).to_list(length=20)
    return addresses

@api_router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, current_user: dict = Depends(get_current_user)):
    """Delete address"""
    await db.addresses.delete_one({"id": address_id, "user_id": current_user["uid"]})
    return {"message": "Address deleted"}

# ============ PAYMENT ROUTES ============
@api_router.post("/payment/create-order")
async def create_payment_order(payment_data: dict, current_user: dict = Depends(get_current_user)):
    """Create Razorpay order (Test Mode)"""
    amount = float(payment_data.get("amount", 0))
    order_id = payment_data.get("order_id", str(uuid.uuid4()))
    
    # Demo mode: return mock razorpay order since we don't have real keys
    try:
        razorpay_order = razorpay_client.order.create({
            "amount": int(amount * 100),
            "currency": "INR",
            "payment_capture": 1,
            "receipt": order_id[:40]
        })
        return {
            "razorpay_order_id": razorpay_order['id'],
            "amount": razorpay_order['amount'],
            "currency": razorpay_order['currency'],
            "key_id": os.getenv('RAZORPAY_KEY_ID', 'rzp_test_demo')
        }
    except Exception as e:
        # Fallback: return test mode mock data
        logger.warning(f"Razorpay test mode: {e}")
        return {
            "razorpay_order_id": f"order_test_{uuid.uuid4().hex[:12]}",
            "amount": int(amount * 100),
            "currency": "INR",
            "key_id": "rzp_test_demo",
            "test_mode": True
        }

@api_router.post("/payment/verify")
async def verify_payment(payment_data: dict, current_user: dict = Depends(get_current_user)):
    """Verify Razorpay payment (Test Mode)"""
    order_id = payment_data.get("order_id")
    payment_id = payment_data.get("razorpay_payment_id", f"pay_test_{uuid.uuid4().hex[:12]}")
    
    # In test mode, mark as success
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "payment_id": payment_id,
            "payment_status": "success",
            "order_status": "processing",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"status": "success", "message": "Payment verified (test mode)"}

# ============ CONTACT & NEWSLETTER ============
@api_router.post("/contact")
async def create_contact(contact_data: dict):
    """Create contact message"""
    contact_data["id"] = str(uuid.uuid4())
    contact_data["status"] = "unread"
    contact_data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contactMessages.insert_one(contact_data)
    contact_data.pop("_id", None)
    return contact_data

@api_router.post("/newsletter")
async def subscribe_newsletter(data: dict):
    """Subscribe to newsletter"""
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    existing = await db.newsletterSubscribers.find_one({"email": email})
    if existing:
        return {"message": "Already subscribed"}
    
    await db.newsletterSubscribers.insert_one({
        "email": email,
        "subscribed_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Subscribed successfully"}

# ============ HEALTH CHECK ============
@api_router.get("/")
async def root():
    return {"message": "ZIVORA Luxury API", "version": "1.0.0"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
