import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Heart, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, wishlist } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/shop", label: "Shop" },
    { to: "/category/silver-grills", label: "Silver" },
    { to: "/category/gold-grills", label: "Gold" },
    { to: "/category/diamond-grills", label: "Diamond" },
    { to: "/category/iced-out-grills", label: "Iced Out" },
    { to: "/category/teeth-gems", label: "Gems" },
    { to: "/custom-grill", label: "Custom" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.2, 0.9, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-nav py-3" : "bg-transparent py-5"
      }`}
      data-testid="navbar"
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group" data-testid="nav-logo">
          <motion.span 
            whileHover={{ letterSpacing: "0.3em" }}
            transition={{ duration: 0.4 }}
            className="font-display text-2xl md:text-3xl font-medium tracking-[0.25em] text-white"
          >
            ZIVORA
          </motion.span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
              className={({ isActive }) =>
                `hover-underline text-sm tracking-[0.15em] uppercase font-medium transition-colors ${
                  isActive ? "text-white" : "text-[#A0A0A0] hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate("/shop")}
            className="text-white hover:text-[#A0A0A0] transition-colors"
            data-testid="nav-search-btn"
            aria-label="Search"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white hover:text-[#A0A0A0] transition-colors"
                data-testid="nav-user-btn"
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-3 w-56 glass-nav border border-[#222] py-3"
                    onMouseLeave={() => setMenuOpen(false)}
                    data-testid="nav-user-menu"
                  >
                    <div className="px-5 pb-3 border-b border-[#222]">
                      <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Signed in</p>
                      <p className="text-sm text-white truncate">{user?.email}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-5 py-2 text-sm text-white hover:bg-[#1A1A1A]" data-testid="nav-admin-link">
                        Admin Panel
                      </Link>
                    )}
                    <Link to="/account" onClick={() => setMenuOpen(false)} className="block px-5 py-2 text-sm text-white hover:bg-[#1A1A1A]" data-testid="nav-account-link">
                      Account
                    </Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-5 py-2 text-sm text-white hover:bg-[#1A1A1A]" data-testid="nav-orders-link">
                      Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="block px-5 py-2 text-sm text-white hover:bg-[#1A1A1A]">
                      Wishlist
                    </Link>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                      className="w-full text-left px-5 py-2 text-sm text-[#FF3B30] hover:bg-[#1A1A1A] flex items-center gap-2"
                      data-testid="nav-logout-btn"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="text-white hover:text-[#A0A0A0] transition-colors" data-testid="nav-login-btn">
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          )}

          <Link to="/wishlist" className="text-white hover:text-[#A0A0A0] transition-colors relative" data-testid="nav-wishlist-btn">
            <Heart className="w-5 h-5" strokeWidth={1.5} />
            {wishlist?.product_ids?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlist.product_ids.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className="text-white hover:text-[#A0A0A0] transition-colors relative" data-testid="nav-cart-btn">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center" data-testid="nav-cart-count">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            className="lg:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="nav-mobile-toggle"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass-nav overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-5">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-base tracking-[0.15em] uppercase text-white"
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
