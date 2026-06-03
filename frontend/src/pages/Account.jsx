import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, LogOut, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api, { formatINR } from "../lib/api";
import { toast } from "sonner";

const Account = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data.slice(0, 3))).catch(() => {});
  }, []);

  const saveProfile = async () => {
    try {
      const { data } = await api.put("/auth/me", form);
      updateUser(data);
      toast.success("Profile updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="account-page">
      <div className="container mx-auto px-6 md:px-12">
        <p className="label-uppercase mb-4">Account</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">Hello, {user?.name?.split(" ")[0]}.</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile */}
          <div className="lg:col-span-1">
            <div className="border border-[#222] p-8 bg-[#0A0A0A] sticky top-32">
              <div className="w-16 h-16 rounded-full bg-[#222] flex items-center justify-center mb-6">
                <User className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              {editing ? (
                <div className="space-y-4">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-transparent border-b border-[#333] focus:border-white py-2 text-white outline-none" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-transparent border-b border-[#333] focus:border-white py-2 text-white outline-none" placeholder="Phone" />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="bg-white text-black px-4 py-2 text-xs uppercase tracking-wider">Save</button>
                    <button onClick={() => setEditing(false)} className="border border-[#222] text-white px-4 py-2 text-xs uppercase tracking-wider">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-white text-lg mb-1">{user?.name}</p>
                  <p className="text-[#A0A0A0] text-sm">{user?.email}</p>
                  {user?.phone && <p className="text-[#A0A0A0] text-sm">{user.phone}</p>}
                  <button onClick={() => setEditing(true)} className="mt-4 text-xs uppercase tracking-wider text-white hover-underline">Edit Profile</button>
                </>
              )}

              <div className="mt-8 pt-8 border-t border-[#222] space-y-3">
                <Link to="/orders" className="flex items-center justify-between text-sm text-white hover:text-[#A0A0A0]"><span className="flex items-center gap-3"><Package className="w-4 h-4" /> Orders</span><ArrowRight className="w-3 h-3" /></Link>
                <Link to="/wishlist" className="flex items-center justify-between text-sm text-white hover:text-[#A0A0A0]"><span className="flex items-center gap-3"><Heart className="w-4 h-4" /> Wishlist</span><ArrowRight className="w-3 h-3" /></Link>
                <Link to="/custom-grill" className="flex items-center justify-between text-sm text-white hover:text-[#A0A0A0]"><span className="flex items-center gap-3"><Sparkles className="w-4 h-4" /> Custom Requests</span><ArrowRight className="w-3 h-3" /></Link>
                <button onClick={() => { logout(); navigate("/"); }} className="flex items-center justify-between text-sm text-[#FF3B30] hover:text-white w-full"><span className="flex items-center gap-3"><LogOut className="w-4 h-4" /> Sign Out</span></button>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-display text-3xl text-white tracking-tighter">Recent Orders</h2>
              <Link to="/orders" className="hover-underline text-sm uppercase tracking-wider">View All</Link>
            </div>
            {orders.length === 0 ? (
              <div className="border border-[#222] p-12 text-center bg-[#0A0A0A]">
                <Package className="w-12 h-12 mx-auto mb-4 text-[#333]" strokeWidth={1} />
                <p className="text-white mb-2">No orders yet</p>
                <Link to="/shop" className="text-[#A0A0A0] hover:text-white text-sm hover-underline">Start Shopping →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-[#222] p-6 bg-[#0A0A0A] flex justify-between items-center">
                    <div>
                      <p className="text-xs text-[#A0A0A0] mb-1">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-white">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                      <p className="text-xs text-[#A0A0A0] capitalize mt-1">{order.order_status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl text-white">{formatINR(order.total)}</p>
                      <Link to={`/order-confirmation/${order.id}`} className="text-xs uppercase tracking-wider text-white hover-underline">View →</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
