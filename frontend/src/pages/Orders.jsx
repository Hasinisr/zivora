import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import api, { formatINR } from "../lib/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="orders-page">
      <div className="container mx-auto px-6 md:px-12">
        <p className="label-uppercase mb-4">My Orders</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">Order History.</h1>

        {(() => {
          if (loading) return <p className="text-[#666]">Loading...</p>;
          if (orders.length === 0) {
            return (
              <div className="border border-[#222] p-16 text-center bg-[#0A0A0A]">
                <Package className="w-16 h-16 mx-auto mb-6 text-[#333]" strokeWidth={1} />
                <p className="text-white text-xl mb-2">No orders yet</p>
                <Link to="/shop" className="text-[#A0A0A0] hover:text-white hover-underline">Start shopping →</Link>
              </div>
            );
          }
          return (
            <div className="space-y-6">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="border border-[#222] p-6 md:p-8 bg-[#0A0A0A]"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 pb-6 border-b border-[#222]">
                    <div>
                      <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-white text-sm font-mono">{order.id.slice(0, 16)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">Status</p>
                      <p className="text-white capitalize">{order.order_status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">Date</p>
                      <p className="text-white text-sm">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">Total</p>
                      <p className="text-white font-medium">{formatINR(order.total)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={`${order.id}-${item.product_id}`} className="flex-shrink-0 w-20 h-24 bg-[#111]">
                        <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex-shrink-0 w-20 h-24 bg-[#111] flex items-center justify-center text-white text-sm">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <Link to={`/order-confirmation/${order.id}`} className="text-xs uppercase tracking-[0.2em] text-white hover-underline" data-testid={`view-order-${order.id}`}>
                    View Details →
                  </Link>
                </motion.div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Orders;
