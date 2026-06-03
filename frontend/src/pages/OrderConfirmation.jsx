import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import api, { formatINR } from "../lib/api";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${orderId}`).then(({ data }) => setOrder(data)).catch(() => {});
  }, [orderId]);

  if (!order) return <div className="min-h-screen pt-40 text-center text-[#666]">Loading...</div>;

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="order-confirmation-page">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-white" strokeWidth={1} />
          <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-4">Order Placed.</h1>
          <p className="text-[#A0A0A0]">Thank you for choosing ZIVORA. Your order is being prepared.</p>
        </motion.div>

        <div className="border border-[#222] p-8 bg-[#0A0A0A]">
          <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-[#222]">
            <div>
              <p className="label-uppercase mb-1">Order ID</p>
              <p className="text-white text-sm font-mono">{order.id.slice(0, 12)}...</p>
            </div>
            <div>
              <p className="label-uppercase mb-1">Status</p>
              <p className="text-white capitalize">{order.order_status}</p>
            </div>
            <div>
              <p className="label-uppercase mb-1">Payment</p>
              <p className="text-white capitalize">{order.payment_status}</p>
            </div>
            <div>
              <p className="label-uppercase mb-1">Total</p>
              <p className="text-white">{formatINR(order.total)}</p>
            </div>
          </div>

          <p className="label-uppercase mb-4">Items</p>
          <div className="space-y-4 mb-8">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-20 bg-[#111]">
                  <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{item.product_name}</p>
                  <p className="text-[#A0A0A0] text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="text-white">{formatINR(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-[#222]">
            <p className="label-uppercase mb-2">Shipping To</p>
            <p className="text-white text-sm">{order.shipping_address.name}</p>
            <p className="text-[#A0A0A0] text-sm">
              {order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <Link to="/orders" className="border border-[#222] text-white px-6 py-3 text-sm uppercase tracking-[0.2em] hover:border-white">
            View Orders
          </Link>
          <Link to="/shop" className="bg-white text-black px-6 py-3 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] inline-flex items-center gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
