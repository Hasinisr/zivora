import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { formatINR } from "../lib/api";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product, index = 0 }) => {
  const { toggleWishlist, isInWishlist, addToCart } = useCart();
  const inWishlist = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.2, 0.9, 0.3, 1] }}
      className="group product-card bg-[#111] border border-[#222] relative overflow-hidden"
      data-testid={`product-card-${product.slug}`}
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-[4/5] bg-[#0A0A0A] relative overflow-hidden">
          <img
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.bestseller && (
              <span className="bg-white text-black text-[10px] tracking-[0.2em] uppercase px-2 py-1 font-medium">
                Bestseller
              </span>
            )}
            {product.featured && (
              <span className="bg-black/60 backdrop-blur text-white text-[10px] tracking-[0.2em] uppercase px-2 py-1 border border-white/20">
                Featured
              </span>
            )}
            {product.stock < 5 && product.stock > 0 && (
              <span className="bg-[#FF3B30]/20 backdrop-blur text-[#FF3B30] text-[10px] tracking-[0.2em] uppercase px-2 py-1">
                Last {product.stock}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all"
        data-testid={`wishlist-btn-${product.slug}`}
        aria-label="Add to wishlist"
      >
        <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} strokeWidth={1.5} />
      </button>

      <div className="p-5">
        <Link to={`/product/${product.slug}`}>
          <p className="label-uppercase mb-2">{product.material}</p>
          <h3 className="font-display text-lg text-white mb-3 truncate" data-testid={`product-name-${product.slug}`}>
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-white text-base font-medium" data-testid={`product-price-${product.slug}`}>
              {formatINR(product.sale_price || product.price)}
            </p>
            {product.sale_price && (
              <p className="text-xs text-[#666] line-through">{formatINR(product.price)}</p>
            )}
          </div>
          
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product, 1); }}
            className="text-xs uppercase tracking-[0.2em] text-white hover-underline"
            data-testid={`add-to-cart-${product.slug}`}
          >
            Add +
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
