import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.email, form.password, form.name, form.phone);
      toast.success("Welcome to ZIVORA");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const fake = { email: `user${Date.now()}@gmail.com`, name: form.name || "Google User", google_id: `google_${Date.now()}` };
      await googleLogin(fake);
      toast.success("Welcome to ZIVORA");
      navigate("/");
    } catch {
      toast.error("Google sign-up failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 pt-32 pb-12" data-testid="signup-page">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="font-display text-3xl tracking-[0.25em] text-white block text-center mb-12">ZIVORA</Link>
        <h1 className="font-display text-5xl text-white tracking-tighter mb-3 text-center">Join Us.</h1>
        <p className="text-[#A0A0A0] mb-12 text-center">Begin your luxury journey.</p>

        <form onSubmit={onSubmit} className="space-y-6" data-testid="signup-form">
          <div>
            <label className="label-uppercase block mb-2">Full Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none" data-testid="signup-name" />
          </div>
          <div>
            <label className="label-uppercase block mb-2">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none" data-testid="signup-email" />
          </div>
          <div>
            <label className="label-uppercase block mb-2">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none" data-testid="signup-phone" />
          </div>
          <div>
            <label className="label-uppercase block mb-2">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none" data-testid="signup-password" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] disabled:opacity-50" data-testid="signup-submit">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-xs text-[#666] uppercase tracking-wider">Or</span>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        <button onClick={handleGoogle} disabled={loading} className="w-full border border-[#222] text-white py-4 text-sm uppercase tracking-[0.2em] hover:border-white">
          Continue with Google
        </button>

        <p className="text-center mt-8 text-sm text-[#A0A0A0]">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover-underline" data-testid="login-link">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
