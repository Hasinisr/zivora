import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const { wishlist } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const ids = wishlist.product_ids || [];
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const all = await Promise.all(
        ids.map((id) =>
          api.get(`/products/${id}`).then((r) => r.data).catch((err) => {
            console.warn("[Wishlist] product fetch:", err?.message || err);
            return null;
          })
        )
      );
      setProducts(all.filter(Boolean));
    } catch (err) {
      console.warn("[Wishlist] fetch:", err?.message || err);
    }
    setLoading(false);
  }, [wishlist]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="wishlist-page">
      <div className="container mx-auto px-6 md:px-12">
        <p className="label-uppercase mb-4">Wishlist</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">Saved Pieces.</h1>

        {(() => {
          if (loading) return <p className="text-[#666]">Loading...</p>;
          if (products.length === 0) {
            return (
              <div className="border border-[#222] p-16 text-center bg-[#0A0A0A]">
                <Heart className="w-16 h-16 mx-auto mb-6 text-[#333]" strokeWidth={1} />
                <p className="text-white text-xl mb-2">No items in wishlist</p>
                <Link to="/shop" className="text-[#A0A0A0] hover:text-white hover-underline">Browse Collection →</Link>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Wishlist;
