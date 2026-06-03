import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";

const Shop = () => {
  const { category: routeCategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [category, setCategory] = useState(routeCategory || "all");
  const [searchParams] = useSearchParams();

  const categories = [
    { id: "all", name: "All" },
    { id: "silver-grills", name: "Silver" },
    { id: "gold-grills", name: "Gold" },
    { id: "diamond-grills", name: "Diamond" },
    { id: "iced-out-grills", name: "Iced Out" },
    { id: "custom-grills", name: "Custom" },
    { id: "teeth-gems", name: "Gems" },
  ];

  useEffect(() => {
    setCategory(routeCategory || "all");
  }, [routeCategory]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== "all") params.append("category", category);
    if (search) params.append("search", search);
    if (sortBy) params.append("sort_by", sortBy);
    
    api.get(`/products?${params.toString()}`)
      .then(({ data }) => setProducts(data))
      .catch((err) => console.warn("[Shop] fetch products:", err?.message || err))
      .finally(() => setLoading(false));
  }, [category, search, sortBy]);

  const categoryTitle = categories.find(c => c.id === category)?.name || "Shop";

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="shop-page">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="label-uppercase mb-4">Collection</p>
          <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter">{categoryTitle}</h1>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-12 pb-6 border-b border-[#111]">
          <div className="flex gap-2 flex-wrap" data-testid="category-filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors ${
                  category === cat.id
                    ? "bg-white text-black border-white"
                    : "border-[#222] text-[#A0A0A0] hover:border-white hover:text-white"
                }`}
                data-testid={`category-tab-${cat.id}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex items-center border-b border-[#333] focus-within:border-white">
              <Search className="w-4 h-4 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-white text-sm py-2 px-3 outline-none placeholder:text-[#666] w-44"
                data-testid="search-input"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-[#222] text-white text-xs uppercase tracking-wider py-2 px-3 hover:border-white"
              data-testid="sort-select"
            >
              <option value="created_at">Latest</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {(() => {
          if (loading) return <div className="text-center py-32 text-[#666]">Loading...</div>;
          if (products.length === 0) {
            return (
              <div className="text-center py-32">
                <p className="text-white text-xl mb-2">No products found</p>
                <p className="text-[#666] text-sm">Try different filters</p>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Shop;
