import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, Star, ShoppingBag, Shield, Truck, Award } from "lucide-react";
import api, { formatINR } from "../lib/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { toast } from "sonner";

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [customization, setCustomization] = useState({});
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/products/slug/${slug}`)
      .then(async ({ data }) => {
        if (cancelled) return;
        setProduct(data);
        setSelectedImage(0);
        const [{ data: rel }, { data: rev }] = await Promise.all([
          api.get(`/products?category=${data.category}&limit=4`),
          api.get(`/reviews/${data.id}`),
        ]);
        if (cancelled) return;
        setRelated(rel.filter((p) => p.id !== data.id).slice(0, 4));
        setReviews(rev);
      })
      .catch((err) => console.warn("[ProductDetail] fetch:", err?.message || err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div className="min-h-screen pt-40 text-center text-[#666]">Loading...</div>;
  if (!product) return <div className="min-h-screen pt-40 text-center text-white">Product not found</div>;

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="product-detail-page">
      <div className="container mx-auto px-6 md:px-12">
        {/* Breadcrumb */}
        <div className="mb-8 text-xs text-[#666] tracking-wider">
          <Link to="/" className="hover:text-white">HOME</Link> / <Link to="/shop" className="hover:text-white">SHOP</Link> / <span className="text-white">{product.name.toUpperCase()}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
          {/* Images */}
          <div>
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="aspect-square bg-[#111] mb-4 overflow-hidden"
            >
              <img src={product.images?.[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 bg-[#111] border ${selectedImage === i ? "border-white" : "border-[#222]"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="label-uppercase mb-4">{product.material}</p>
            <h1 className="font-display text-4xl md:text-6xl text-white tracking-tighter mb-6" data-testid="product-detail-name">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-8">
              <div className="flex gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-white text-white" : "text-[#333]"}`} />
                ))}
              </div>
              <span className="text-sm text-[#A0A0A0]">{product.rating} ({product.reviews_count} reviews)</span>
            </div>

            <div className="mb-8 pb-8 border-b border-[#222]">
              <p className="font-display text-4xl text-white" data-testid="product-detail-price">
                {formatINR(product.sale_price || product.price)}
              </p>
              {product.sale_price && (
                <p className="text-[#666] line-through text-base mt-1">{formatINR(product.price)}</p>
              )}
              <p className="text-xs text-[#A0A0A0] mt-2">Incl. of all taxes. Free shipping in India.</p>
            </div>

            <p className="text-[#A0A0A0] text-base leading-relaxed mb-8">{product.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-[#222]">
              {product.teeth_count && (
                <div>
                  <p className="label-uppercase mb-1">Teeth Count</p>
                  <p className="text-white">{product.teeth_count}</p>
                </div>
              )}
              {product.finish && (
                <div>
                  <p className="label-uppercase mb-1">Finish</p>
                  <p className="text-white">{product.finish}</p>
                </div>
              )}
              {product.gem_type && (
                <div>
                  <p className="label-uppercase mb-1">Gems</p>
                  <p className="text-white">{product.gem_type}</p>
                </div>
              )}
              <div>
                <p className="label-uppercase mb-1">Stock</p>
                <p className={`${product.stock > 0 ? "text-white" : "text-[#FF3B30]"}`}>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6 mb-6">
              <p className="label-uppercase">Quantity</p>
              <div className="flex items-center border border-[#222]">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-white hover:bg-[#1A1A1A]" data-testid="qty-decrease">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-6 text-white" data-testid="qty-value">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-white hover:bg-[#1A1A1A]" data-testid="qty-increase">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Engraving (Custom) */}
            {product.category === "custom-grills" && (
              <div className="mb-6">
                <label className="label-uppercase mb-2 block">Engraving (Optional)</label>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="Up to 20 characters"
                  value={customization.engraving || ""}
                  onChange={(e) => setCustomization({ ...customization, engraving: e.target.value })}
                  className="w-full bg-transparent border-b border-[#333] text-white py-3 outline-none focus:border-white"
                  data-testid="engraving-input"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => addToCart(product, quantity, customization)}
                disabled={product.stock === 0}
                className="flex-1 bg-white text-black py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] disabled:opacity-50 flex items-center justify-center gap-3"
                data-testid="add-to-cart-btn"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-14 h-14 border border-[#222] text-white flex items-center justify-center hover:border-white"
                data-testid="wishlist-toggle-btn"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-white" : ""}`} strokeWidth={1.5} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#222]">
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-[#A0A0A0]" strokeWidth={1.5} />
                <p className="text-xs text-[#A0A0A0]">Authentic</p>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-[#A0A0A0]" strokeWidth={1.5} />
                <p className="text-xs text-[#A0A0A0]">Free Shipping</p>
              </div>
              <div className="text-center">
                <Award className="w-6 h-6 mx-auto mb-2 text-[#A0A0A0]" strokeWidth={1.5} />
                <p className="text-xs text-[#A0A0A0]">Handcrafted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-3xl md:text-5xl text-white tracking-tighter mb-12">You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
