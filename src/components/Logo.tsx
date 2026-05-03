import React from 'react';
import { motion } from 'motion/react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Animated Infinite Background Circles */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-emerald-50 rounded-full border border-emerald-100"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-teal-50/50 rounded-full border border-teal-100/50 scale-110"
        />

        {/* The Root & Heart Symbol */}
        <svg viewBox="0 0 100 100" className="w-10 h-10 relative z-10 drop-shadow-sm">
          <motion.path
            d="M50 20 C50 20, 30 20, 30 45 C30 70, 50 85, 50 85 C50 85, 70 70, 70 45 C70 20, 50 20, 50 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-emerald-700"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          
          {/* Stylized Branches/Roots */}
          <motion.path
            d="M50 85 L50 65 M50 65 L35 50 M50 65 L65 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-teal-600"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Golden Core (The Soul/Legacy) */}
          <motion.circle
            cx="50"
            cy="45"
            r="6"
            className="fill-amber-400"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>

        {/* Floating Petals/Leaves */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full"
            animate={{
              x: [0, (i % 2 === 0 ? 30 : -30) * Math.random()],
              y: [0, -40 * Math.random()],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 bg-clip-text text-transparent leading-none font-serif tracking-tight">
          Family Shaastra
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="h-[1px] w-4 bg-slate-300" />
          <span className="text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase leading-none">
            Family in an app
          </span>
        </div>
      </div>
    </div>
  );
};
