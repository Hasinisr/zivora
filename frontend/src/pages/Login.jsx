import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back");
      navigate(user.role === "admin" ? "/admin" : from);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    // Demo Google login - simulates Google OAuth
    setLoading(true);
    try {
      const fakeGoogleUser = {
        email: `user${Date.now()}@gmail.com`,
        name: "Google User",
        google_id: `google_${Date.now()}`,
        photo_url: null
      };
      await googleLogin(fakeGoogleUser);
      toast.success("Signed in with Google (demo)");
      navigate(from);
    } catch (err) {
      toast.error("Google sign-in failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 pt-32 pb-12" data-testid="login-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="font-display text-3xl tracking-[0.25em] text-white block text-center mb-12">ZIVORA</Link>
        <h1 className="font-display text-5xl text-white tracking-tighter mb-3 text-center">Welcome.</h1>
        <p className="text-[#A0A0A0] mb-12 text-center">Sign in to continue.</p>

        <form onSubmit={onSubmit} className="space-y-6" data-testid="login-form">
          <div>
            <label className="label-uppercase block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none"
              data-testid="login-email"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="label-uppercase">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#A0A0A0] hover:text-white">Forgot?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none"
              data-testid="login-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] disabled:opacity-50"
            data-testid="login-submit"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-xs text-[#666] uppercase tracking-wider">Or</span>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-[#222] text-white py-4 text-sm uppercase tracking-[0.2em] hover:border-white disabled:opacity-50"
          data-testid="google-login"
        >
          Continue with Google
        </button>

        <p className="text-center mt-8 text-sm text-[#A0A0A0]">
          New to ZIVORA?{" "}
          <Link to="/signup" className="text-white hover-underline" data-testid="signup-link">Create Account</Link>
        </p>

        <div className="mt-12 p-4 border border-[#222] text-xs text-[#666]">
          <p className="mb-1">DEMO ADMIN:</p>
          <p>admin@zivora.com / admin@zivora2026</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
