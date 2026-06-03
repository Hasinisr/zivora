import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingIntro = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setExit(true), 500);
          setTimeout(() => onComplete?.(), 1300);
          return 100;
        }
        return p + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center overflow-hidden"
          data-testid="loading-intro"
        >
          <div className="absolute inset-0 noise-overlay" />
          
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ letterSpacing: "0.05em", opacity: 0 }}
              animate={{ letterSpacing: "0.4em", opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.2, 0.9, 0.3, 1] }}
              className="font-display text-6xl md:text-8xl text-white font-medium relative"
            >
              {"ZIVORA".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.05, ease: [0.2, 0.9, 0.3, 1] }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="label-uppercase mt-8 text-[#666]"
            >
              Luxury Made for Your Smile
            </motion.p>

            <div className="mt-16 w-64 h-px bg-[#222] relative overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="absolute left-0 top-0 h-full bg-white"
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="font-mono-luxury text-xs text-[#666] mt-4">{String(progress).padStart(3, '0')}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingIntro;
