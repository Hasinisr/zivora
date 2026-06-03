import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent. We'll respond within 24 hours.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Failed to send");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="contact-page">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <p className="label-uppercase mb-4">Contact</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">Get in Touch.</h1>

        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div>
              <Mail className="w-6 h-6 text-white mb-3" strokeWidth={1.5} />
              <p className="label-uppercase mb-1">Email</p>
              <p className="text-white">hello@zivora.in</p>
            </div>
            <div>
              <Phone className="w-6 h-6 text-white mb-3" strokeWidth={1.5} />
              <p className="label-uppercase mb-1">Phone</p>
              <p className="text-white">+91 98765 43210</p>
            </div>
            <div>
              <MapPin className="w-6 h-6 text-white mb-3" strokeWidth={1.5} />
              <p className="label-uppercase mb-1">Studio</p>
              <p className="text-white">Bandra West, Mumbai<br />Maharashtra, India</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6" data-testid="contact-form">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your Name" className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" data-testid="contact-name" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="Email" className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" data-testid="contact-email" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (Optional)" className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none placeholder:text-[#666]" />
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} placeholder="Your message..." className="w-full bg-transparent border border-[#222] focus:border-white py-3 px-4 text-white outline-none resize-none placeholder:text-[#666]" data-testid="contact-message" />
            <button type="submit" disabled={loading} className="bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] disabled:opacity-50" data-testid="contact-submit">
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
