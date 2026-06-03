import React from "react";
import { motion } from "framer-motion";

export const About = () => (
  <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="about-page">
    <div className="container mx-auto px-6 md:px-12 max-w-4xl">
      <p className="label-uppercase mb-4">Our Story</p>
      <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">Indian Luxury,<br/>Redefined.</h1>
      <div className="grid md:grid-cols-2 gap-12 text-[#A0A0A0] leading-relaxed">
        <div className="space-y-6">
          <p>ZIVORA was born from a simple belief: luxury should be deeply personal, unapologetically bold, and crafted with intention.</p>
          <p>Founded in 2024 in Mumbai, we set out to merge centuries of Indian jewelry craftsmanship with contemporary streetwear aesthetics. Every tooth grill, every gem is handcrafted by master artisans who pour 40-60 hours into each piece.</p>
          <p>From the streets of Mumbai to the global stage, ZIVORA is for those who refuse to blend in.</p>
        </div>
        <div className="space-y-6">
          <p className="text-white text-xl">Our Promise</p>
          <p>Every piece is certified, ethically sourced, and built to last generations. Whether you choose a single silver tooth grill or commission a fully iced custom masterpiece, the same obsessive attention to detail goes into every creation.</p>
          <p className="text-white text-xl pt-6">Craftsmanship</p>
          <p>Working with 12 master jewelers across India, we ensure each ZIVORA piece carries the soul of Indian craftsmanship and the precision of modern luxury.</p>
        </div>
      </div>
    </div>
  </div>
);

export const FAQ = () => {
  const faqs = [
    { q: "How are ZIVORA grills made?", a: "Each grill is custom-fitted by our certified jewelers using a dental impression of your teeth. We use only 925 sterling silver, 18K gold, or platinum bases with certified stones." },
    { q: "What is the delivery time?", a: "Standard products ship in 3-5 business days. Custom orders take 4-6 weeks due to the handcrafted nature." },
    { q: "Are ZIVORA grills safe to wear?", a: "Yes. All ZIVORA pieces are made from biocompatible metals and are dentist-approved for occasional wear." },
    { q: "Do you ship internationally?", a: "Currently we ship across India with select international destinations available on request." },
    { q: "What is your return policy?", a: "We offer 7-day returns on standard products. Custom orders are non-refundable but eligible for adjustments." },
    { q: "How do I care for my grill?", a: "Clean with mild soap and warm water. Store in the provided velvet pouch. Avoid harsh chemicals." },
  ];

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="faq-page">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <p className="label-uppercase mb-4">Help</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">Questions?</h1>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="border-b border-[#222] py-6 group">
              <summary className="cursor-pointer list-none flex justify-between items-center text-white text-lg font-display">
                {f.q}
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-[#A0A0A0] mt-4 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

const PolicyPage = ({ title, content }) => (
  <div className="bg-[#050505] min-h-screen pt-32 pb-24">
    <div className="container mx-auto px-6 md:px-12 max-w-3xl">
      <p className="label-uppercase mb-4">Policy</p>
      <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-16">{title}</h1>
      <div className="prose prose-invert text-[#A0A0A0] leading-relaxed space-y-6">
        {content}
      </div>
    </div>
  </div>
);

export const Privacy = () => (
  <PolicyPage title="Privacy Policy" content={
    <>
      <p>At ZIVORA, we take your privacy seriously. We collect only the information necessary to fulfill your orders and provide exceptional service.</p>
      <p><strong className="text-white">Information We Collect:</strong> Name, email, phone, shipping address, and payment information.</p>
      <p><strong className="text-white">How We Use It:</strong> To process orders, send updates, and improve our service. We never sell your data.</p>
      <p><strong className="text-white">Security:</strong> All data is encrypted in transit and at rest. Payment processing is PCI-DSS compliant via Razorpay.</p>
    </>
  } />
);

export const Returns = () => (
  <PolicyPage title="Return Policy" content={
    <>
      <p>We want you to be thrilled with your ZIVORA purchase. If for any reason you're not, we offer a 7-day return window on standard products.</p>
      <p><strong className="text-white">Eligibility:</strong> Items must be unworn, in original packaging, with all tags attached.</p>
      <p><strong className="text-white">Custom Orders:</strong> All custom-designed pieces are final sale due to their personalized nature. We do offer free adjustments.</p>
      <p><strong className="text-white">Process:</strong> Contact us at hello@zivora.in to initiate a return. We'll provide a prepaid shipping label.</p>
    </>
  } />
);

export const Shipping = () => (
  <PolicyPage title="Shipping Policy" content={
    <>
      <p>ZIVORA ships across India with reliable courier partners.</p>
      <p><strong className="text-white">Standard Delivery:</strong> 3-5 business days (Free over ₹5,000)</p>
      <p><strong className="text-white">Express Delivery:</strong> 1-2 business days (₹500)</p>
      <p><strong className="text-white">Custom Orders:</strong> 4-6 weeks production + standard delivery</p>
      <p><strong className="text-white">International:</strong> Available on request to select destinations.</p>
    </>
  } />
);

export const Terms = () => (
  <PolicyPage title="Terms & Conditions" content={
    <>
      <p>By using ZIVORA, you agree to these terms.</p>
      <p><strong className="text-white">Product Information:</strong> We strive for accuracy but reserve the right to correct errors in pricing or descriptions.</p>
      <p><strong className="text-white">Custom Orders:</strong> Final pricing for custom orders is provided after design consultation and is binding.</p>
      <p><strong className="text-white">Liability:</strong> ZIVORA's liability is limited to the purchase price of the product.</p>
      <p><strong className="text-white">Governing Law:</strong> These terms are governed by the laws of India, with jurisdiction in Mumbai.</p>
    </>
  } />
);

export const NotFound = () => (
  <div className="bg-[#050505] min-h-screen flex items-center justify-center" data-testid="not-found-page">
    <div className="text-center">
      <p className="font-display text-9xl text-white mb-4">404</p>
      <p className="text-[#A0A0A0] mb-8">This page doesn't exist.</p>
      <a href="/" className="text-white hover-underline uppercase tracking-[0.2em] text-sm">Return Home →</a>
    </div>
  </div>
);
