import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#050505]" data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-screen bg-[#050505] overflow-hidden pt-28">
        <div className="absolute inset-0">
          <img
            src="/zivora-hero-new.png"
            alt="ZIVORA Silver Grill"
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <p className="label-uppercase mb-6">
              Indian Street Luxury Reimagined
            </p>

            <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] text-white tracking-tighter leading-[0.85] mb-8 max-w-5xl">
              Own Your<br />
              <span className="text-chrome italic">Shine.</span>
            </h1>

            <p className="text-[#A0A0A0] max-w-md text-base leading-relaxed mb-10">
              Handcrafted tooth grills and gems for those who refuse to blend in.
              Luxury made for your smile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                data-testid="hero-shop-cta"
                className="group bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#E5E5E5] transition-colors"
              >
                Shop Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/custom-grill"
                data-testid="hero-custom-cta"
                className="border border-[#444] text-white px-8 py-4 text-sm uppercase tracking-[0.2em] text-center hover:border-white transition-colors"
              >
                Build Custom
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;