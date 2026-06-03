import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, X, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatINR } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const items = cart.items || [];

  const gst = Math.round(cartSubtotal * 0.03);
  const shipping = cartSubtotal > 5000 ? 0 : 200;
  const total = cartSubtotal + gst + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] pt-40 pb-24 flex items-center justify-center" data-testid="cart-empty">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-[#333]" strokeWidth={1} />
          <h1 className="font-display text-5xl text-white mb-4 tracking-tighter">Cart is Empty</h1>
          <p className="text-[#A0A0A0] mb-8">Discover the ZIVORA collection.</p>
          <Link to="/shop" className="bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.2em] inline-flex items-center gap-3 hover:bg-[#E5E5E5]">
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="cart-page">
      <div className="container mx-auto px-6 md:px-12">
        <p className="label-uppercase mb-4">Cart</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">Your Bag.</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {items.map((item, i) => (
                <motion.div
                  key={item.product_id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex gap-4 md:gap-6 pb-6 border-b border-[#111]"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <div className="w-24 h-32 md:w-32 md:h-40 bg-[#111] flex-shrink-0">
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-xl text-white">{item.product_name}</h3>
                      {item.customization?.engraving && (
                        <p className="text-xs text-[#A0A0A0] mt-1">Engraving: "{item.customization.engraving}"</p>
                      )}
                      <p className="text-white mt-2">{formatINR(item.price)}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center border border-[#222]">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-2 text-white">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 text-white text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-2 text-white">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-[#A0A0A0] hover:text-white"
                        data-testid={`remove-${item.product_id}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="border border-[#222] p-8 sticky top-32 bg-[#0A0A0A]">
              <p className="label-uppercase mb-6">Order Summary</p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">Subtotal</span>
                  <span className="text-white" data-testid="cart-subtotal">{formatINR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">GST (3%)</span>
                  <span className="text-white">{formatINR(gst)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">Shipping</span>
                  <span className="text-white">{shipping === 0 ? "Free" : formatINR(shipping)}</span>
                </div>
              </div>
              <div className="flex justify-between pt-6 border-t border-[#222] mb-8">
                <span className="text-white uppercase tracking-[0.2em] text-sm">Total</span>
                <span className="font-display text-2xl text-white" data-testid="cart-total">{formatINR(total)}</span>
              </div>
              <button
                onClick={() => navigate(isAuthenticated ? "/checkout" : "/login")}
                className="w-full bg-white text-black py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] flex items-center justify-center gap-3"
                data-testid="checkout-btn"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-[#666] mt-4 text-center">Free shipping on orders over ₹5,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
