import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import api, { formatINR } from "../lib/api";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customGrills, setCustomGrills] = useState([]);

  useEffect(() => {
    if (activeTab === "dashboard") api.get("/admin/dashboard").then(({ data }) => setStats(data)).catch(() => {});
    if (activeTab === "orders") api.get("/admin/orders").then(({ data }) => setOrders(data)).catch(() => {});
    if (activeTab === "customers") api.get("/admin/customers").then(({ data }) => setCustomers(data)).catch(() => {});
    if (activeTab === "products") api.get("/products?limit=100").then(({ data }) => setProducts(data)).catch(() => {});
    if (activeTab === "custom-grills") api.get("/admin/custom-grills").then(({ data }) => setCustomGrills(data)).catch(() => {});
  }, [activeTab]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { order_status: status });
      toast.success("Order updated");
      const { data } = await api.get("/admin/orders");
      setOrders(data);
    } catch {
      toast.error("Failed");
    }
  };

  const tabs = [
    { id: "dashboard", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "products", label: "Products" },
    { id: "customers", label: "Customers" },
    { id: "custom-grills", label: "Custom Requests" },
  ];

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="admin-page">
      <div className="container mx-auto px-6 md:px-12">
        <p className="label-uppercase mb-4">Admin Control Room</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-12">Dashboard.</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-12 overflow-x-auto pb-2 border-b border-[#111]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.15em] whitespace-nowrap ${
                activeTab === tab.id ? "bg-white text-black" : "text-[#A0A0A0] hover:text-white"
              }`}
              data-testid={`admin-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Revenue", value: formatINR(stats.total_revenue), icon: DollarSign },
                { label: "Orders", value: stats.total_orders, icon: ShoppingBag },
                { label: "Customers", value: stats.total_customers, icon: Users },
                { label: "Products", value: stats.total_products, icon: Package },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-[#222] p-6 bg-[#0A0A0A]" data-testid={`stat-${s.label.toLowerCase()}`}>
                  <s.icon className="w-5 h-5 text-[#A0A0A0] mb-3" strokeWidth={1.5} />
                  <p className="font-display text-3xl text-white mb-1">{s.value}</p>
                  <p className="label-uppercase">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="border border-[#222] p-6 bg-[#0A0A0A]">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-4 h-4 text-white" />
                  <p className="label-uppercase">Recent Orders</p>
                </div>
                <div className="space-y-3">
                  {stats.recent_orders?.length === 0 ? (
                    <p className="text-[#666] text-sm">No orders yet</p>
                  ) : stats.recent_orders?.slice(0, 5).map((o, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-[#1A1A1A]">
                      <div>
                        <p className="text-white text-sm">{o.user_email || "Customer"}</p>
                        <p className="text-xs text-[#A0A0A0] capitalize">{o.order_status}</p>
                      </div>
                      <p className="text-white text-sm">{formatINR(o.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-[#222] p-6 bg-[#0A0A0A]">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />
                  <p className="label-uppercase">Low Stock Alerts</p>
                </div>
                <div className="space-y-3">
                  {stats.low_stock_products?.length === 0 ? (
                    <p className="text-[#666] text-sm">All products well stocked</p>
                  ) : stats.low_stock_products?.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-[#1A1A1A]">
                      <p className="text-white text-sm truncate">{p.name}</p>
                      <p className="text-[#FF3B30] text-sm">{p.stock} left</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-[#666] text-center py-12">No orders yet</p>
            ) : orders.map((order) => (
              <div key={order.id} className="border border-[#222] p-6 bg-[#0A0A0A] grid md:grid-cols-5 gap-4 items-center" data-testid={`admin-order-${order.id}`}>
                <div>
                  <p className="text-xs text-[#A0A0A0]">Order</p>
                  <p className="text-white text-sm font-mono">{order.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0]">Customer</p>
                  <p className="text-white text-sm">{order.user_email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0]">Total</p>
                  <p className="text-white">{formatINR(order.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0]">Status</p>
                  <select value={order.order_status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="bg-transparent border border-[#222] text-white text-sm py-1 px-2">
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0]">Payment</p>
                  <p className={`text-sm capitalize ${order.payment_status === "success" ? "text-white" : "text-[#A0A0A0]"}`}>{order.payment_status}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p.id} className="border border-[#222] bg-[#0A0A0A]">
                <div className="aspect-square bg-[#111]">
                  <img src={p.images?.[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-white text-sm truncate">{p.name}</p>
                  <div className="flex justify-between mt-2">
                    <p className="text-white">{formatINR(p.price)}</p>
                    <p className={`text-xs ${p.stock < 5 ? "text-[#FF3B30]" : "text-[#A0A0A0]"}`}>{p.stock} in stock</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="space-y-3">
            {customers.length === 0 ? (
              <p className="text-[#666] text-center py-12">No customers yet</p>
            ) : customers.map((c) => (
              <div key={c.uid} className="border border-[#222] p-4 bg-[#0A0A0A] grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-white">{c.name}</p>
                  <p className="text-xs text-[#A0A0A0]">{c.email}</p>
                </div>
                <div className="text-[#A0A0A0] text-sm">{c.phone || "—"}</div>
                <div className="text-xs text-[#A0A0A0]">{new Date(c.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Grills Tab */}
        {activeTab === "custom-grills" && (
          <div className="space-y-4">
            {customGrills.length === 0 ? (
              <p className="text-[#666] text-center py-12">No custom requests yet</p>
            ) : customGrills.map((req) => (
              <div key={req.id} className="border border-[#222] p-6 bg-[#0A0A0A]">
                <div className="flex justify-between mb-4">
                  <p className="text-white text-sm">{req.user_email}</p>
                  <span className={`text-xs px-2 py-1 ${req.status === "pending" ? "bg-[#A0A0A0]/20 text-[#A0A0A0]" : "bg-white text-black"}`}>{req.status}</span>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-[#A0A0A0]">Metal:</span> <span className="text-white">{req.metal_type}</span></div>
                  <div><span className="text-[#A0A0A0]">Teeth:</span> <span className="text-white">{req.teeth_count}</span></div>
                  <div><span className="text-[#A0A0A0]">Stones:</span> <span className="text-white">{req.stone_type}</span></div>
                  <div><span className="text-[#A0A0A0]">Est:</span> <span className="text-white">{formatINR(req.estimated_price || 0)}</span></div>
                </div>
                {req.customer_notes && <p className="text-[#A0A0A0] text-sm mt-3">"{req.customer_notes}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
