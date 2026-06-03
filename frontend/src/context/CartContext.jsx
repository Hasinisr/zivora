import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../lib/api";
import { toast } from "sonner";

const CartContext = createContext(null);

const logError = (label, err) => {
  // Surface in console but don't toast for read-failures to avoid noise.
  console.warn(`[Cart] ${label}:`, err?.message || err);
};

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [wishlist, setWishlist] = useState({ product_ids: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      const local = localStorage.getItem("zivora_cart");
      if (local) {
        try {
          setCart(JSON.parse(local));
        } catch (err) {
          logError("parse local cart", err);
        }
      }
      return;
    }
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (err) {
      logError("fetch cart", err);
    }
  }, [isAuthenticated]);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      const local = localStorage.getItem("zivora_wishlist");
      if (local) {
        try {
          setWishlist(JSON.parse(local));
        } catch (err) {
          logError("parse local wishlist", err);
        }
      }
      return;
    }
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data);
    } catch (err) {
      logError("fetch wishlist", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  const persistCart = useCallback(
    (newCart) => {
      setCart(newCart);
      if (isAuthenticated) {
        api.put("/cart", { items: newCart.items }).catch((err) => logError("persist cart", err));
      } else {
        localStorage.setItem("zivora_cart", JSON.stringify(newCart));
      }
    },
    [isAuthenticated]
  );

  const addToCart = useCallback(
    (product, quantity = 1, customization = null) => {
      setCart((prev) => {
        const items = [...(prev.items || [])];
        const idx = items.findIndex((i) => i.product_id === product.id);
        if (idx >= 0) {
          items[idx].quantity += quantity;
        } else {
          items.push({
            product_id: product.id,
            product_name: product.name,
            product_image: product.images?.[0],
            price: product.sale_price || product.price,
            quantity,
            customization,
          });
        }
        const next = { ...prev, items };
        if (isAuthenticated) {
          api.put("/cart", { items }).catch((err) => logError("persist cart", err));
        } else {
          localStorage.setItem("zivora_cart", JSON.stringify(next));
        }
        return next;
      });
      toast.success(`${product.name} added to cart`);
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    (productId, quantity) => {
      setCart((prev) => {
        const items = prev.items.map((i) =>
          i.product_id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
        );
        const next = { ...prev, items };
        if (isAuthenticated) {
          api.put("/cart", { items }).catch((err) => logError("update qty", err));
        } else {
          localStorage.setItem("zivora_cart", JSON.stringify(next));
        }
        return next;
      });
    },
    [isAuthenticated]
  );

  const removeFromCart = useCallback(
    (productId) => {
      setCart((prev) => {
        const items = prev.items.filter((i) => i.product_id !== productId);
        const next = { ...prev, items };
        if (isAuthenticated) {
          api.put("/cart", { items }).catch((err) => logError("remove item", err));
        } else {
          localStorage.setItem("zivora_cart", JSON.stringify(next));
        }
        return next;
      });
      toast.success("Removed from cart");
    },
    [isAuthenticated]
  );

  const clearCart = useCallback(() => {
    persistCart({ items: [] });
    if (isAuthenticated) {
      api.delete("/cart").catch((err) => logError("clear cart", err));
    } else {
      localStorage.removeItem("zivora_cart");
    }
  }, [isAuthenticated, persistCart]);

  const toggleWishlist = useCallback(
    async (productId) => {
      const ids = wishlist.product_ids || [];
      const willAdd = !ids.includes(productId);
      const newIds = willAdd ? [...ids, productId] : ids.filter((id) => id !== productId);
      setWishlist({ ...wishlist, product_ids: newIds });

      try {
        if (isAuthenticated) {
          if (willAdd) await api.post(`/wishlist/${productId}`);
          else await api.delete(`/wishlist/${productId}`);
        } else {
          localStorage.setItem("zivora_wishlist", JSON.stringify({ product_ids: newIds }));
        }
        toast.success(willAdd ? "Added to wishlist" : "Removed from wishlist");
      } catch (err) {
        logError("toggle wishlist", err);
        toast.error("Could not update wishlist");
        // Roll back optimistic update
        setWishlist({ ...wishlist, product_ids: ids });
      }
    },
    [isAuthenticated, wishlist]
  );

  const isInWishlist = useCallback(
    (productId) => (wishlist.product_ids || []).includes(productId),
    [wishlist]
  );

  const cartCount = (cart.items || []).reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = (cart.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        cartCount,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
