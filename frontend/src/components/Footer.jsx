import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube } from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/newsletter", { email });
      toast.success("Subscribed to ZIVORA");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe");
    }
    setLoading(false);
  };

  return (
    <footer className="bg-[#050505] border-t border-[#111] pt-24 pb-10 relative overflow-hidden" data-testid="footer">
      <div className="container mx-auto px-6 md:px-12">
        {/* Top - Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-20 border-b border-[#111]">
          <div>
            <p className="label-uppercase mb-4">Newsletter</p>
            <h2 className="font-display text-4xl md:text-6xl text-white tracking-tighter leading-[0.95] mb-2">
              Stay in the<br />Shine.
            </h2>
            <p className="text-[#A0A0A0] text-sm mt-4 max-w-md">
              Subscribe for exclusive drops, limited editions, and luxury insights.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex flex-col justify-end gap-4" data-testid="newsletter-form">
            <div className="flex border-b border-[#333] focus-within:border-white transition-colors">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-transparent text-white py-3 outline-none placeholder:text-[#666]"
                data-testid="newsletter-email-input"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-white uppercase tracking-[0.2em] text-sm px-2 hover-underline"
                data-testid="newsletter-submit"
              >
                {loading ? "..." : "Subscribe →"}
              </button>
            </div>
          </form>
        </div>

        {/* Middle - Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 py-16">
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="font-display text-3xl tracking-[0.25em] text-white">ZIVORA</Link>
            <p className="text-sm text-[#A0A0A0] mt-6 max-w-xs leading-relaxed">
              Indian luxury redefined. Handcrafted tooth grills and gems for those who dare to shine differently.
            </p>
            <div className="flex gap-4 mt-8">
              <a href="#" className="text-[#A0A0A0] hover:text-white"><Instagram className="w-5 h-5" strokeWidth={1.5} /></a>
              <a href="#" className="text-[#A0A0A0] hover:text-white"><Twitter className="w-5 h-5" strokeWidth={1.5} /></a>
              <a href="#" className="text-[#A0A0A0] hover:text-white"><Youtube className="w-5 h-5" strokeWidth={1.5} /></a>
            </div>
          </div>

          <div>
            <p className="label-uppercase mb-4">Shop</p>
            <ul className="space-y-3 text-sm">
              <li><Link to="/category/silver-grills" className="text-white hover:text-[#A0A0A0]">Silver</Link></li>
              <li><Link to="/category/gold-grills" className="text-white hover:text-[#A0A0A0]">Gold</Link></li>
              <li><Link to="/category/diamond-grills" className="text-white hover:text-[#A0A0A0]">Diamond</Link></li>
              <li><Link to="/category/iced-out-grills" className="text-white hover:text-[#A0A0A0]">Iced Out</Link></li>
              <li><Link to="/category/teeth-gems" className="text-white hover:text-[#A0A0A0]">Gems</Link></li>
              <li><Link to="/custom-grill" className="text-white hover:text-[#A0A0A0]">Custom</Link></li>
            </ul>
          </div>

          <div>
            <p className="label-uppercase mb-4">Brand</p>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="text-white hover:text-[#A0A0A0]">About</Link></li>
              <li><Link to="/contact" className="text-white hover:text-[#A0A0A0]">Contact</Link></li>
              <li><Link to="/faq" className="text-white hover:text-[#A0A0A0]">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="label-uppercase mb-4">Legal</p>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy" className="text-white hover:text-[#A0A0A0]">Privacy</Link></li>
              <li><Link to="/returns" className="text-white hover:text-[#A0A0A0]">Returns</Link></li>
              <li><Link to="/shipping" className="text-white hover:text-[#A0A0A0]">Shipping</Link></li>
              <li><Link to="/terms" className="text-white hover:text-[#A0A0A0]">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-xs text-[#666] tracking-wider">© 2026 ZIVORA. ALL RIGHTS RESERVED.</p>
          <p className="text-xs text-[#666] tracking-wider">CRAFTED IN INDIA — WORN WORLDWIDE</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
