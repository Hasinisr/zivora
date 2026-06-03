import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api, { formatINR } from "../lib/api";
import { toast } from "sonner";

const CustomGrillBuilder = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    metal_type: "",
    teeth_count: 2,
    stone_type: "",
    finish: "",
    engraving_text: "",
    gem_placement: "",
    customer_notes: ""
  });
  const [loading, setLoading] = useState(false);

  const metals = [
    { id: "silver", name: "Sterling Silver", base: 2000 },
    { id: "gold", name: "18K Gold", base: 8000 },
    { id: "platinum", name: "Platinum", base: 15000 },
  ];
  const stones = [
    { id: "none", name: "No Stones", multiplier: 1 },
    { id: "cz", name: "Cubic Zirconia", multiplier: 1.3 },
    { id: "diamond", name: "Diamond", multiplier: 2.5 },
    { id: "ruby", name: "Ruby", multiplier: 2.2 },
  ];
  const finishes = ["Mirror Polish", "Matte", "Brushed", "Hammered"];

  const calculatePrice = () => {
    const metal = metals.find(m => m.id === config.metal_type);
    const stone = stones.find(s => s.id === config.stone_type);
    if (!metal || !stone) return 0;
    return Math.round(metal.base * config.teeth_count * stone.multiplier);
  };

  const submitRequest = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to submit");
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const requestData = { ...config, estimated_price: calculatePrice() };
      await api.post("/custom-grills", requestData);
      toast.success("Custom grill request submitted!");
      navigate("/account");
    } catch {
      toast.error("Failed to submit request");
    }
    setLoading(false);
  };

  const canProceed = () => {
    if (step === 1) return !!config.metal_type;
    if (step === 2) return !!config.teeth_count && config.teeth_count >= 1;
    if (step === 3) return !!config.stone_type;
    if (step === 4) return !!config.finish;
    return true;
  };

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24" data-testid="custom-grill-page">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <p className="label-uppercase mb-4">Custom Builder</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-tighter mb-4">
          Design Your<br/><span className="text-chrome italic">Signature.</span>
        </h1>
        <p className="text-[#A0A0A0] mb-16">Craft a one-of-one grill made exclusively for you.</p>

        {/* Steps */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`flex-1 h-1 ${step >= s ? "bg-white" : "bg-[#222]"}`} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Step 1: Metal */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="custom-step-1">
                <h2 className="font-display text-3xl text-white mb-8">Choose Your Metal</h2>
                <div className="space-y-3">
                  {metals.map((m) => (
                    <button key={m.id} onClick={() => setConfig({ ...config, metal_type: m.id })} className={`w-full p-6 border text-left flex justify-between items-center ${config.metal_type === m.id ? "border-white bg-[#0A0A0A]" : "border-[#222] hover:border-[#444]"}`}>
                      <div>
                        <p className="text-white text-lg">{m.name}</p>
                        <p className="text-xs text-[#A0A0A0]">From {formatINR(m.base)} / tooth</p>
                      </div>
                      {config.metal_type === m.id && <Check className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Teeth Count */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="custom-step-2">
                <h2 className="font-display text-3xl text-white mb-8">How Many Teeth?</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
                    <button key={n} onClick={() => setConfig({ ...config, teeth_count: n })} className={`p-6 border text-center ${config.teeth_count === n ? "border-white bg-[#0A0A0A]" : "border-[#222] hover:border-[#444]"}`}>
                      <p className="font-display text-3xl text-white">{n}</p>
                      <p className="text-xs text-[#A0A0A0] mt-1">{n === 1 ? "tooth" : "teeth"}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Stones */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="custom-step-3">
                <h2 className="font-display text-3xl text-white mb-8">Add Stones</h2>
                <div className="space-y-3">
                  {stones.map((s) => (
                    <button key={s.id} onClick={() => setConfig({ ...config, stone_type: s.id })} className={`w-full p-6 border text-left flex justify-between items-center ${config.stone_type === s.id ? "border-white bg-[#0A0A0A]" : "border-[#222] hover:border-[#444]"}`}>
                      <p className="text-white">{s.name}</p>
                      {config.stone_type === s.id && <Check className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Finish */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="custom-step-4">
                <h2 className="font-display text-3xl text-white mb-8">Choose Finish</h2>
                <div className="grid grid-cols-2 gap-3">
                  {finishes.map((f) => (
                    <button key={f} onClick={() => setConfig({ ...config, finish: f })} className={`p-6 border text-center ${config.finish === f ? "border-white bg-[#0A0A0A]" : "border-[#222] hover:border-[#444]"}`}>
                      <p className="text-white">{f}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Engraving & Notes */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="custom-step-5">
                <h2 className="font-display text-3xl text-white mb-8">Final Touches</h2>
                <div className="space-y-6">
                  <div>
                    <label className="label-uppercase block mb-3">Engraving (Optional)</label>
                    <input value={config.engraving_text} onChange={(e) => setConfig({ ...config, engraving_text: e.target.value })} maxLength={20} placeholder="Up to 20 characters" className="w-full bg-transparent border-b border-[#333] focus:border-white py-3 text-white outline-none" />
                  </div>
                  <div>
                    <label className="label-uppercase block mb-3">Gem Placement</label>
                    <select value={config.gem_placement} onChange={(e) => setConfig({ ...config, gem_placement: e.target.value })} className="w-full bg-transparent border border-[#222] focus:border-white py-3 px-4 text-white outline-none">
                      <option value="">Select placement</option>
                      <option value="center">Center</option>
                      <option value="full-coverage">Full Coverage</option>
                      <option value="edges">Edges Only</option>
                      <option value="custom">Custom Pattern</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-uppercase block mb-3">Notes (Optional)</label>
                    <textarea value={config.customer_notes} onChange={(e) => setConfig({ ...config, customer_notes: e.target.value })} rows={4} placeholder="Any specific requests..." className="w-full bg-transparent border border-[#222] focus:border-white py-3 px-4 text-white outline-none resize-none" />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 mt-12">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="border border-[#222] text-white px-6 py-4 text-sm uppercase tracking-[0.2em] hover:border-white" data-testid="custom-back">
                  Back
                </button>
              )}
              {step < 5 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] disabled:opacity-30 inline-flex items-center gap-3" data-testid="custom-next">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={submitRequest} disabled={loading} className="bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.2em] hover:bg-[#E5E5E5] inline-flex items-center gap-3" data-testid="custom-submit">
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="border border-[#222] p-6 bg-[#0A0A0A] sticky top-32">
              <Sparkles className="w-6 h-6 text-white mb-4" strokeWidth={1.5} />
              <p className="label-uppercase mb-6">Your Design</p>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-[#A0A0A0]">Metal</span><span className="text-white">{metals.find(m => m.id === config.metal_type)?.name || "—"}</span></div>
                <div className="flex justify-between"><span className="text-[#A0A0A0]">Teeth</span><span className="text-white">{config.teeth_count || "—"}</span></div>
                <div className="flex justify-between"><span className="text-[#A0A0A0]">Stones</span><span className="text-white">{stones.find(s => s.id === config.stone_type)?.name || "—"}</span></div>
                <div className="flex justify-between"><span className="text-[#A0A0A0]">Finish</span><span className="text-white">{config.finish || "—"}</span></div>
                {config.engraving_text && (
                  <div className="flex justify-between"><span className="text-[#A0A0A0]">Engraving</span><span className="text-white">"{config.engraving_text}"</span></div>
                )}
              </div>
              <div className="pt-6 border-t border-[#222]">
                <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Estimated</p>
                <p className="font-display text-3xl text-white" data-testid="custom-price">{formatINR(calculatePrice())}</p>
                <p className="text-xs text-[#666] mt-2">Final quote provided by our team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomGrillBuilder;
