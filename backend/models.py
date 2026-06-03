from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"

class CustomGrillStatus(str, Enum):
    PENDING = "pending"
    QUOTED = "quoted"
    APPROVED = "approved"
    IN_PRODUCTION = "in_production"
    COMPLETED = "completed"
    REJECTED = "rejected"

# User Models
class UserCreate(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(BaseModel):
    uid: str
    email: str
    name: str
    phone: Optional[str] = None
    role: UserRole
    created_at: str

# Product Models
class ProductCreate(BaseModel):
    name: str
    slug: str
    category: str
    price: float
    sale_price: Optional[float] = None
    description: str
    images: List[str]
    material: str
    teeth_count: Optional[int] = None
    gem_type: Optional[str] = None
    finish: Optional[str] = None
    stock: int = 0
    rating: float = 5.0
    reviews_count: int = 0
    tags: List[str] = []
    featured: bool = False
    bestseller: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    sale_price: Optional[float] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None
    bestseller: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    category: str
    price: float
    sale_price: Optional[float] = None
    description: str
    images: List[str]
    material: str
    teeth_count: Optional[int] = None
    gem_type: Optional[str] = None
    finish: Optional[str] = None
    stock: int
    rating: float
    reviews_count: int
    tags: List[str]
    featured: bool
    bestseller: bool
    created_at: str
    updated_at: str

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int
    customization: Optional[Dict[str, Any]] = None

class CartUpdate(BaseModel):
    items: List[CartItem]

class CartResponse(BaseModel):
    user_id: str
    items: List[Dict[str, Any]]
    updated_at: str

# Address Models
class AddressCreate(BaseModel):
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    is_default: bool = False

class AddressResponse(BaseModel):
    id: str
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str]
    city: str
    state: str
    pincode: str
    is_default: bool

# Order Models
class OrderItemCreate(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    quantity: int
    price: float
    customization: Optional[Dict[str, Any]] = None

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: AddressCreate
    payment_method: str
    subtotal: float
    gst: float
    shipping: float
    discount: float
    total: float

class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[Dict[str, Any]]
    shipping_address: Dict[str, Any]
    payment_method: str
    subtotal: float
    gst: float
    shipping: float
    discount: float
    total: float
    payment_status: PaymentStatus
    order_status: OrderStatus
    payment_id: Optional[str] = None
    tracking_id: Optional[str] = None
    created_at: str
    updated_at: str

# Custom Grill Models
class CustomGrillCreate(BaseModel):
    metal_type: str
    teeth_count: int
    stone_type: Optional[str] = None
    finish: str
    engraving_text: Optional[str] = None
    gem_placement: Optional[str] = None
    reference_image: Optional[str] = None
    customer_notes: Optional[str] = None

class CustomGrillResponse(BaseModel):
    id: str
    user_id: str
    metal_type: str
    teeth_count: int
    stone_type: Optional[str]
    finish: str
    engraving_text: Optional[str]
    gem_placement: Optional[str]
    reference_image: Optional[str]
    customer_notes: Optional[str]
    status: CustomGrillStatus
    estimated_price: Optional[float] = None
    admin_quote: Optional[str] = None
    created_at: str
    updated_at: str

# Review Models
class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    comment: str

class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: str

# Wishlist Models
class WishlistAdd(BaseModel):
    product_id: str

class WishlistResponse(BaseModel):
    user_id: str
    product_ids: List[str]
    updated_at: str

# Contact Models
class ContactCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

class ContactResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    message: str
    status: str
    created_at: str

# Newsletter Models
class NewsletterSubscribe(BaseModel):
    email: str

class NewsletterResponse(BaseModel):
    email: str
    subscribed_at: str

# Payment Models
class PaymentOrderCreate(BaseModel):
    order_id: str
    amount: float

class PaymentOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: int
    currency: str
    key_id: str

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str
