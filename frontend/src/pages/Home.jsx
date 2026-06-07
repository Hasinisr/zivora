import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import api, { formatINR } from "../lib/api";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    api.get("/products?featured=true&limit=8").then(({ data }) => setFeatured(data)).catch(() => {});
    api.get("/products?bestseller=true&limit=4").then(({ data }) => setBestsellers(data)).catch(() => {});
  }, []);

  const stats = [
    { label: "Crafted Pieces", value: "10,000+" },
    { label: "Happy Clients", value: "5,000+" },
    { label: "Cities Served", value: "120+" },
    { label: "Avg. Rating", value: "4.9" },
  ];

  const categories = [
    { slug: "silver-grills", name: "Silver", image: "/category-silver.jpg" },
    { slug: "gold-grills", name: "Gold", image: "/category-gold.jpg" },
    { slug: "diamond-grills", name: "Diamond", image: "/category-diamond.jpg" },
    { slug: "teeth-gems", name: "Gems", image: "/category-gems.jpg" },
  ];

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-0 overflow-hidden noise-overlay">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1634648852208-fc7e55a15751?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Hero"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60" />
        </div>

        {/* Floating Grill — right of Own Your Shine */}
        <motion.div
          initial={{ opacity: 0, x: 120, scale: 0.85 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.2, 0.9, 0.3, 1] }}
          className="hidden md:block absolute right-[-5%] top-[-10%] -translate-y-1/2 w-[90%] lg:w-[85%] xl:w-[80%] z-[5] pointer-events-none"
          data-testid="hero-grill-image"
        >
          <motion.div
            animate={{ y: [0, -22, 0], rotate: [0, 0.6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <img
              src="/zivora-hero-new.png"
              alt="ZIVORA Signature Grill"
              className="w-full h-full object-contain select-none"
              style={{
                mixBlendMode: "lighten",
                filter: "drop-shadow(0 30px 60px rgba(255,255,255,0.06)) contrast(1.05) brightness(1.05)",
                maskImage:
                  "radial-gradient(ellipse 80% 70% at 50% 50%, #000 55%, transparent 95%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 70% at 50% 50%, #000 55%, transparent 95%)",
              }}
              draggable={false}
            />
            {/* Subtle chrome glow halo */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(229,229,229,0.08) 0%, transparent 70%)",
                mixBlendMode: "screen",
              }}
            />
          </motion.div>
        </motion.div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="label-uppercase mb-6"
          >
            Indian Street Luxury Reimagined
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.2, 0.9, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-[8rem] text-white tracking-tighter leading-[0.85] mb-8 max-w-5xl"
          >
            Own Your<br />
            <span className="text-chrome italic">Shine.</span>
          </motion.h1>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-[#A0A0A0] max-w-md text-base leading-relaxed"
            >
              Handcrafted tooth grills and gems for those who refuse to blend in. Luxury made for your smile.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex gap-4 absolute right-24 bottom-10 z-20"
            >
              <Link to="/shop" data-testid="hero-shop-cta" className="group bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#E5E5E5] transition-colors">
                Shop Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/custom-grill" data-testid="hero-custom-cta" className="border border-[#333] text-white px-8 py-4 text-sm uppercase tracking-[0.2em] hover:border-white transition-colors">
                Build Custom
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="border-y border-[#111] py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {["marquee-a", "marquee-b"].map((id) => (
            <div key={id} className="flex items-center gap-16 mr-16">
              <span className="font-display text-2xl text-[#666]">CRAFTED FOR THE BOLD</span>
              <span className="text-[#222]">✦</span>
              <span className="font-display text-2xl text-[#666]">LUXURY MADE FOR YOUR SMILE</span>
              <span className="text-[#222]">✦</span>
              <span className="font-display text-2xl text-[#666]">OWN YOUR SHINE</span>
              <span className="text-[#222]">✦</span>
              <span className="font-display text-2xl text-[#666]">INDIAN STREET LUXURY</span>
              <span className="text-[#222]">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Tetris Grid */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-16">
            <div>
              <p className="label-uppercase mb-4">Collections</p>
              <h2 className="font-display text-5xl md:text-7xl text-white tracking-tighter">
                Choose Your<br />Element.
              </h2>
            </div>
            <Link to="/shop" className="hover-underline text-sm uppercase tracking-[0.2em]">View All →</Link>
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.2, 0.9, 0.3, 1] }}
                className={i % 3 === 0 ? "col-span-12 md:col-span-8" : "col-span-12 md:col-span-4"}
              >
                <Link to={`/category/${cat.slug}`} className="group block relative overflow-hidden aspect-[4/3] md:aspect-[5/4] bg-[#111]" data-testid={`category-${cat.slug}`}>
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-110 opacity-95 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-end p-6 md:p-10 bg-gradient-to-t from-[#050505]/80 to-transparent">
                    <div>
                      <h3 className="font-display text-3xl md:text-5xl text-white mb-2">{cat.name}</h3>
                      <p className="text-sm text-[#A0A0A0] flex items-center gap-2 hover-underline w-fit">
                        Explore <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 flex justify-between items-end">
            <div>
              <p className="label-uppercase mb-4">Featured</p>
              <h2 className="font-display text-5xl md:text-7xl text-white tracking-tighter">Latest Drops.</h2>
            </div>
            <Link to="/shop" className="hover-underline text-sm uppercase tracking-[0.2em]">Shop All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 md:py-32 border-y border-[#111]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <p className="font-display text-5xl md:text-6xl text-white mb-3 tracking-tighter">{s.value}</p>
                <p className="label-uppercase">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="aspect-[4/5] bg-[#111]"
          >
            <img src="https://images.unsplash.com/photo-1635151227785-429f420c6b9d?crop=entropy&cs=srgb&fm=jpg&q=85" alt="Craft" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          >
            <p className="label-uppercase mb-6">Craftsmanship</p>
            <h2 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-8">
              Handcrafted.<br />Heirloom.<br />Forever.
            </h2>
            <p className="text-[#A0A0A0] text-base leading-relaxed mb-8 max-w-md">
              Every ZIVORA piece is meticulously crafted by India's master jewelers using ethically sourced precious metals and certified stones. Each grill takes 40-60 hours of artisan work.
            </p>
            <Link to="/about" className="hover-underline text-sm uppercase tracking-[0.2em] text-white">Our Process →</Link>
          </motion.div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="label-uppercase mb-4">Most Loved</p>
            <h2 className="font-display text-5xl md:text-7xl text-white tracking-tighter">Bestsellers.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bestsellers.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12">
          <p className="label-uppercase mb-4">Testimonials</p>
          <h2 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">
            Words From<br />The Bold.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Arjun K.", city: "Mumbai", text: "ZIVORA's diamond grill is unreal. Quality is on another level." },
              { name: "Priya S.", city: "Delhi", text: "My teeth gems get compliments every single day. Pure luxury." },
              { name: "Rohan M.", city: "Bangalore", text: "The custom builder is genius. Got exactly what I designed." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border border-[#222] p-8 bg-[#0A0A0A]"
              >
                <div className="flex gap-1 mb-4">
                  {["s1","s2","s3","s4","s5"].map((sid) => <Star key={sid} className="w-4 h-4 fill-white text-white" />)}
                </div>
                <p className="text-white text-lg mb-6 leading-relaxed">"{t.text}"</p>
                <p className="text-sm text-white font-medium">{t.name}</p>
                <p className="text-xs text-[#666] uppercase tracking-wider">{t.city}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-[#0A0A0A] border-t border-[#111]">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-display text-6xl md:text-9xl text-white tracking-tighter leading-[0.85] mb-10"
          >
            Make It<br /><span className="text-chrome italic">Yours.</span>
          </motion.h2>
          <Link to="/custom-grill" className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5]" data-testid="cta-custom-grill">
            Start Custom Design <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
