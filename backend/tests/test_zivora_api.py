"""
ZIVORA Luxury API - Backend Test Suite
Tests all endpoints listed in the review request.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://grill-empire-india.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ZIVORA_ADMIN_EMAIL", "admin@zivora.com")
ADMIN_PASSWORD = os.environ.get("ZIVORA_ADMIN_PASSWORD", "admin@zivora2026")

EXPECTED_CATEGORIES = {
    "silver-grills", "gold-grills", "diamond-grills",
    "iced-out-grills", "custom-grills", "teeth-gems",
}


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def customer_credentials():
    suffix = uuid.uuid4().hex[:8]
    return {
        "email": f"TEST_user_{suffix}@zivora-test.com",
        "password": "Test@1234",
        "name": "TEST Customer",
        "phone": "+919999999999",
    }


@pytest.fixture(scope="session")
def customer_auth(session, customer_credentials):
    r = session.post(f"{API}/auth/signup", json=customer_credentials)
    assert r.status_code == 200, f"signup failed {r.status_code} {r.text}"
    data = r.json()
    return {"token": data["token"], "user": data["user"]}


def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- health ----------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert "ZIVORA" in data.get("message", "")


# ---------- products ----------
class TestProducts:
    def test_list_products(self, session):
        r = session.get(f"{API}/products?limit=200")
        assert r.status_code == 200
        products = r.json()
        assert isinstance(products, list)
        assert len(products) >= 60, f"expected 60 products, got {len(products)}"
        # ensure all expected categories present
        cats = {p["category"] for p in products}
        missing = EXPECTED_CATEGORIES - cats
        assert not missing, f"missing categories in products: {missing}"

    def test_filter_by_category(self, session):
        r = session.get(f"{API}/products?category=gold-grills&limit=200")
        assert r.status_code == 200
        products = r.json()
        assert len(products) > 0
        assert all(p["category"] == "gold-grills" for p in products)

    def test_get_by_slug(self, session):
        # fetch any product, then test slug lookup with that slug
        r = session.get(f"{API}/products?limit=1")
        assert r.status_code == 200
        first = r.json()[0]
        slug = first["slug"]
        r2 = session.get(f"{API}/products/slug/{slug}")
        assert r2.status_code == 200, f"slug lookup failed for {slug}"
        assert r2.json()["slug"] == slug

    def test_get_by_id(self, session):
        r = session.get(f"{API}/products?limit=1")
        prod = r.json()[0]
        r2 = session.get(f"{API}/products/{prod['id']}")
        assert r2.status_code == 200
        assert r2.json()["id"] == prod["id"]

    def test_product_not_found(self, session):
        r = session.get(f"{API}/products/non-existent-id-xyz")
        assert r.status_code == 404


# ---------- categories ----------
class TestCategories:
    def test_list_categories(self, session):
        r = session.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list)
        assert len(cats) == 6, f"expected 6 categories, got {len(cats)}"


# ---------- auth ----------
class TestAuth:
    def test_signup_and_me(self, session, customer_auth):
        token = customer_auth["token"]
        assert token
        r = session.get(f"{API}/auth/me", headers=auth_headers(token))
        assert r.status_code == 200
        assert r.json()["role"] == "customer"

    def test_signup_duplicate(self, session, customer_credentials, customer_auth):
        # second signup with same email must fail
        r = session.post(f"{API}/auth/signup", json=customer_credentials)
        assert r.status_code == 400

    def test_login(self, session, customer_credentials, customer_auth):
        r = session.post(f"{API}/auth/login", json={
            "email": customer_credentials["email"],
            "password": customer_credentials["password"],
        })
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login",
                         json={"email": f"noone_{uuid.uuid4().hex[:6]}@nowhere-test.com", "password": "wrong"})
        assert r.status_code == 401

    def test_google_auth(self, session):
        email = f"TEST_google_{uuid.uuid4().hex[:6]}@zivora-test.com"
        r = session.post(f"{API}/auth/google", json={
            "email": email, "name": "TEST Google",
            "google_id": f"gid_{uuid.uuid4().hex[:10]}",
            "photo_url": "https://example.com/p.png",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["email"] == email

    def test_me_requires_auth(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code in (401, 403)

    def test_admin_login(self, session, admin_token):
        # admin_token fixture already verifies admin login worked
        assert admin_token


# ---------- admin RBAC ----------
class TestAdminRBAC:
    def test_admin_dashboard(self, session, admin_token):
        r = session.get(f"{API}/admin/dashboard", headers=auth_headers(admin_token))
        assert r.status_code == 200
        data = r.json()
        for k in ["total_orders", "total_customers", "total_products", "total_revenue"]:
            assert k in data
        assert data["total_products"] >= 60

    def test_admin_orders(self, session, admin_token):
        r = session.get(f"{API}/admin/orders", headers=auth_headers(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_customers(self, session, admin_token):
        r = session.get(f"{API}/admin/customers", headers=auth_headers(admin_token))
        assert r.status_code == 200

    def test_admin_rejects_customer(self, session, customer_auth):
        r = session.get(f"{API}/admin/dashboard",
                        headers=auth_headers(customer_auth["token"]))
        assert r.status_code == 403


# ---------- cart ----------
class TestCart:
    def test_get_empty_cart(self, session, customer_auth):
        r = session.get(f"{API}/cart", headers=auth_headers(customer_auth["token"]))
        assert r.status_code == 200
        assert r.json()["items"] == []

    def test_update_and_get_cart(self, session, customer_auth):
        token = customer_auth["token"]
        # get a product id
        prod = session.get(f"{API}/products?limit=1").json()[0]
        items = [{"product_id": prod["id"], "name": prod["name"],
                  "price": prod["price"], "quantity": 2,
                  "image": prod.get("images", [None])[0]}]
        r = session.put(f"{API}/cart", json={"items": items},
                        headers=auth_headers(token))
        assert r.status_code == 200
        # GET to verify persistence
        r2 = session.get(f"{API}/cart", headers=auth_headers(token))
        assert r2.status_code == 200
        assert len(r2.json()["items"]) == 1
        assert r2.json()["items"][0]["product_id"] == prod["id"]

    def test_clear_cart(self, session, customer_auth):
        token = customer_auth["token"]
        r = session.delete(f"{API}/cart", headers=auth_headers(token))
        assert r.status_code == 200
        r2 = session.get(f"{API}/cart", headers=auth_headers(token))
        assert r2.json()["items"] == []


# ---------- wishlist ----------
class TestWishlist:
    def test_wishlist_flow(self, session, customer_auth):
        token = customer_auth["token"]
        prod = session.get(f"{API}/products?limit=1").json()[0]
        # add
        r = session.post(f"{API}/wishlist/{prod['id']}", headers=auth_headers(token))
        assert r.status_code == 200
        # get
        r2 = session.get(f"{API}/wishlist", headers=auth_headers(token))
        assert r2.status_code == 200
        assert prod["id"] in r2.json()["product_ids"]
        # remove
        r3 = session.delete(f"{API}/wishlist/{prod['id']}", headers=auth_headers(token))
        assert r3.status_code == 200
        r4 = session.get(f"{API}/wishlist", headers=auth_headers(token))
        assert prod["id"] not in r4.json()["product_ids"]


# ---------- orders & payments ----------
class TestOrdersPayments:
    @pytest.fixture(scope="class")
    def created_order_id(self, session, customer_auth):
        token = customer_auth["token"]
        prod = session.get(f"{API}/products?limit=1").json()[0]
        order_payload = {
            "items": [{"product_id": prod["id"], "name": prod["name"],
                       "price": prod["price"], "quantity": 1}],
            "total": prod["price"],
            "shipping_address": {
                "name": "TEST", "phone": "9999999999",
                "address_line_1": "Test St", "city": "Mumbai",
                "state": "MH", "pincode": "400001", "country": "India",
            },
        }
        r = session.post(f"{API}/orders", json=order_payload,
                         headers=auth_headers(token))
        assert r.status_code == 200, f"order create failed {r.status_code} {r.text}"
        data = r.json()
        assert data["payment_status"] == "pending"
        return data["id"]

    def test_get_user_orders(self, session, customer_auth, created_order_id):
        r = session.get(f"{API}/orders", headers=auth_headers(customer_auth["token"]))
        assert r.status_code == 200
        ids = [o["id"] for o in r.json()]
        assert created_order_id in ids

    def test_get_single_order(self, session, customer_auth, created_order_id):
        r = session.get(f"{API}/orders/{created_order_id}",
                        headers=auth_headers(customer_auth["token"]))
        assert r.status_code == 200

    def test_payment_create_order(self, session, customer_auth, created_order_id):
        r = session.post(f"{API}/payment/create-order",
                         json={"order_id": created_order_id, "amount": 1000},
                         headers=auth_headers(customer_auth["token"]))
        assert r.status_code == 200
        data = r.json()
        assert "razorpay_order_id" in data
        assert data["amount"] == 100000

    def test_payment_verify(self, session, customer_auth, created_order_id):
        r = session.post(f"{API}/payment/verify",
                         json={"order_id": created_order_id,
                               "razorpay_payment_id": "pay_test_abc"},
                         headers=auth_headers(customer_auth["token"]))
        assert r.status_code == 200
        assert r.json()["status"] == "success"
        # verify persisted status
        r2 = session.get(f"{API}/orders/{created_order_id}",
                         headers=auth_headers(customer_auth["token"]))
        assert r2.json()["payment_status"] == "success"


# ---------- custom grills ----------
class TestCustomGrills:
    def test_create_custom_grill(self, session, customer_auth):
        token = customer_auth["token"]
        r = session.post(f"{API}/custom-grills", json={
            "name": "TEST Custom", "phone": "9999999999",
            "design_description": "Diamond cross design",
            "budget": 50000, "material_preference": "gold",
        }, headers=auth_headers(token))
        assert r.status_code == 200
        assert r.json()["status"] == "pending"

    def test_list_user_custom_grills(self, session, customer_auth):
        r = session.get(f"{API}/custom-grills",
                        headers=auth_headers(customer_auth["token"]))
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 1

    def test_admin_custom_grills(self, session, admin_token):
        r = session.get(f"{API}/admin/custom-grills",
                        headers=auth_headers(admin_token))
        assert r.status_code == 200


# ---------- newsletter & contact ----------
class TestContactNewsletter:
    def test_newsletter_subscribe(self, session):
        email = f"TEST_news_{uuid.uuid4().hex[:6]}@zivora-test.com"
        r = session.post(f"{API}/newsletter", json={"email": email})
        assert r.status_code == 200
        # second time => already subscribed
        r2 = session.post(f"{API}/newsletter", json={"email": email})
        assert r2.status_code == 200

    def test_newsletter_missing_email(self, session):
        r = session.post(f"{API}/newsletter", json={})
        assert r.status_code == 400

    def test_contact_form(self, session):
        r = session.post(f"{API}/contact", json={
            "name": "TEST Contact", "email": "test@zivora-test.com",
            "subject": "Inquiry", "message": "Hello ZIVORA",
        })
        assert r.status_code == 200
        assert r.json()["status"] == "unread"
