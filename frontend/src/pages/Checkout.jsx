import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api, { formatINR } from "../lib/api";
import { toast } from "sonner";

const Checkout = () => {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: address, 2: payment, 3: review
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const items = cart.items || [];
  const gst = Math.round(cartSubtotal * 0.03);
  const shipping = cartSubtotal > 5000 ? 0 : 200;
  const total = cartSubtotal + gst + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-40 text-center">
        <p className="text-white mb-4">Your cart is empty</p>
        <Link to="/shop" className="text-white hover-underline">Continue Shopping</Link>
      </div>
    );
  }

  const placeOrder = async () => {
    setLoading(true);
    try {
      // Create order
      const orderData = {
        items: items.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          product_image: i.product_image,
          price: i.price,
          quantity: i.quantity,
          customization: i.customization
        })),
        shipping_address: address,
        payment_method: paymentMethod,
        subtotal: cartSubtotal,
        gst,
        shipping,
        discount: 0,
        total
      };

      const { data: order } = await api.post("/orders", orderData);

      // Process payment (test mode)
      const { data: payOrder } = await api.post("/payment/create-order", {
        order_id: order.id,
        amount: total
      });

      // For test mode, immediately verify
      if (paymentMethod === "cod") {
        // Cash on delivery - just confirm
        await api.put(`/admin/orders/${order.id}`, { 
          payment_status: "pending", 
          order_status: "processing" 
        }).catch(() => {});
        clearCart();
        toast.success("Order placed!");
        navigate(`/order-confirmation/${order.id}`);
      } else {
        // Online payment - simulate Razorpay in test mode
        await api.post("/payment/verify", {
          order_id: order.id,
          razorpay_order_id: payOrder.razorpay_order_id,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: "test_signature"
        });
        clearCart();
        toast.success("Payment successful!");
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (err) {
      console.warn("[Checkout] order failed:", err?.response?.data?.detail || err?.message);
      toast.error("Failed to place order");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="checkout-page">
      <div className="container mx-auto px-6 md:px-12">
        <p className="label-uppercase mb-4">Checkout</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">Almost There.</h1>

        {/* Steps */}
        <div className="flex gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1 ${step >= s ? "bg-white" : "bg-[#222]"}`} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Step 1: Address */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="checkout-step-address">
                <h2 className="font-display text-2xl text-white mb-8">Shipping Address</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <input className="bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" placeholder="Full Name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} data-testid="address-name" />
                  <input className="bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} data-testid="address-phone" />
                  <input className="md:col-span-2 bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" placeholder="Address Line 1" value={address.address_line1} onChange={(e) => setAddress({ ...address, address_line1: e.target.value })} data-testid="address-line1" />
                  <input className="md:col-span-2 bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" placeholder="Address Line 2 (Optional)" value={address.address_line2} onChange={(e) => setAddress({ ...address, address_line2: e.target.value })} />
                  <input className="bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} data-testid="address-city" />
                  <input className="bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} data-testid="address-state" />
                  <input className="bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} data-testid="address-pincode" />
                </div>
                <button
                  onClick={() => {
                    if (!address.name || !address.phone || !address.address_line1 || !address.city || !address.state || !address.pincode) {
                      toast.error("Please fill all required fields");
                      return;
                    }
                    setStep(2);
                  }}
                  className="mt-12 bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] inline-flex items-center gap-3"
                  data-testid="continue-to-payment"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="checkout-step-payment">
                <h2 className="font-display text-2xl text-white mb-8">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: "upi", label: "UPI (Google Pay, PhonePe, Paytm)" },
                    { id: "card", label: "Credit / Debit Card" },
                    { id: "netbanking", label: "Net Banking" },
                    { id: "cod", label: "Cash on Delivery" },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full p-5 border text-left flex justify-between items-center transition-colors ${
                        paymentMethod === pm.id ? "border-white bg-[#0A0A0A]" : "border-[#222] hover:border-[#444]"
                      }`}
                      data-testid={`payment-${pm.id}`}
                    >
                      <span className="text-white">{pm.label}</span>
                      {paymentMethod === pm.id && <CheckCircle className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#666] mt-4">⚡ Test mode: Payment will be auto-verified for demo purposes</p>
                <div className="flex gap-4 mt-12">
                  <button onClick={() => setStep(1)} className="border border-[#222] text-white px-6 py-4 text-sm uppercase tracking-[0.2em] hover:border-white">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] inline-flex items-center gap-3" data-testid="continue-to-review">
                    Review Order <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="checkout-step-review">
                <h2 className="font-display text-2xl text-white mb-8">Review Order</h2>
                <div className="space-y-6 mb-8">
                  <div className="border border-[#222] p-6">
                    <p className="label-uppercase mb-3">Shipping Address</p>
                    <p className="text-white">{address.name}</p>
                    <p className="text-[#A0A0A0] text-sm">{address.phone}</p>
                    <p className="text-[#A0A0A0] text-sm">{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ""}, {address.city}, {address.state} {address.pincode}</p>
                  </div>
                  <div className="border border-[#222] p-6">
                    <p className="label-uppercase mb-3">Payment Method</p>
                    <p className="text-white">{paymentMethod.toUpperCase()}</p>
                  </div>
                  <div className="border border-[#222] p-6">
                    <p className="label-uppercase mb-3">Items ({items.length})</p>
                    {items.map(item => (
                      <div key={item.product_id} className="flex justify-between py-2">
                        <span className="text-[#A0A0A0] text-sm">{item.product_name} × {item.quantity}</span>
                        <span className="text-white">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="border border-[#222] text-white px-6 py-4 text-sm uppercase tracking-[0.2em]">
                    Back
                  </button>
                  <button onClick={placeOrder} disabled={loading} className="flex-1 bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] disabled:opacity-50 inline-flex items-center justify-center gap-3" data-testid="place-order-btn">
                    {loading ? "Processing..." : `Place Order — ${formatINR(total)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="border border-[#222] p-6 bg-[#0A0A0A] sticky top-32">
              <p className="label-uppercase mb-6">Summary</p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span className="text-[#A0A0A0]">Subtotal</span><span className="text-white">{formatINR(cartSubtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#A0A0A0]">GST</span><span className="text-white">{formatINR(gst)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#A0A0A0]">Shipping</span><span className="text-white">{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
              </div>
              <div className="flex justify-between pt-6 border-t border-[#222]">
                <span className="text-white">Total</span>
                <span className="font-display text-2xl text-white">{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
