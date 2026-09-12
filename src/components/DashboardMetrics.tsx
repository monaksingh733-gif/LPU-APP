"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Flame, Music, Sofa, Users, Coffee, Sparkles, Leaf, ArrowRight } from "lucide-react";
import type { Tab } from "@/app/page";

interface DashboardMetricsProps {
  onNavigate?: (tab: Tab) => void;
  buddiesCount?: number;
  foodCount?: number;
  gatheringsCount?: number;
}

export function DashboardMetrics({
  onNavigate,
  buddiesCount = 141,
  foodCount = 62,
  gatheringsCount = 57,
}: DashboardMetricsProps) {
  const [activeSegment, setActiveSegment] = useState<"vibe" | "rhythm" | "corners">("vibe");

  const cards = [
    {
      value: buddiesCount.toString(),
      label: "Friendly souls",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-[#eef2ff]",
      iconBg: "bg-indigo-100/60",
      tab: "buddies" as Tab,
    },
    {
      value: foodCount.toString(),
      label: "Cozy cafes",
      icon: Coffee,
      color: "text-emerald-700",
      bg: "bg-[#ecfdf5]",
      iconBg: "bg-emerald-100/60",
      tab: "campus" as Tab,
    },
    {
      value: gatheringsCount.toString(),
      label: "Gatherings",
      icon: Sparkles,
      color: "text-amber-700",
      bg: "bg-[#fffbeb]",
      iconBg: "bg-amber-100/60",
      tab: "buddies" as Tab,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Segmented Controls with soft orange highlight */}
      <div className="flex w-full rounded-3xl bg-white p-1.5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] ring-1 ring-slate-100/80">
        <button
          type="button"
          onClick={() => setActiveSegment("vibe")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeSegment === "vibe"
              ? "bg-[#fed7aa]/50 text-slate-800 shadow-xs ring-1 ring-orange-200/50"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Flame className="h-4 w-4 text-orange-500" />
          <span>Warm Vibe</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSegment("rhythm")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeSegment === "rhythm"
              ? "bg-[#fed7aa]/50 text-slate-800 shadow-xs ring-1 ring-orange-200/50"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Music className="h-4 w-4" />
          <span>Rhythm</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSegment("corners")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeSegment === "corners"
              ? "bg-[#fed7aa]/50 text-slate-800 shadow-xs ring-1 ring-orange-200/50"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Sofa className="h-4 w-4" />
          <span>Cozy Corners</span>
        </button>
      </div>

      {/* Conditional Content based on Segmented Tab */}
      {activeSegment === "vibe" && (
        <>
          {/* Pastel Metric Cards: Compact 3-col on all phones */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate?.(card.tab)}
                className={`group relative overflow-hidden rounded-2xl p-3 sm:p-4 ${card.bg} cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all`}
              >
                <div className={`mb-3 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${card.iconBg} ${card.color}`}>
                  <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
                  {card.value}
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs font-semibold text-slate-600 line-clamp-1">
                  {card.label}
                </p>
                <ArrowRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-slate-400 opacity-60 transition-transform group-hover:translate-x-1" />
              </motion.div>
            ))}
          </div>

          {/* Atmosphere Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-3.5 rounded-2xl bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] ring-1 ring-slate-100/80"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-600">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1.5 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Quad Atmosphere</h4>
                <span className="text-[11px] sm:text-xs font-bold text-emerald-600">
                  Gentle & Welcoming (92%)
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-emerald-400"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Rhythm: Activity Trend Curve */}
      {activeSegment === "rhythm" && (
        <div className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] ring-1 ring-slate-100/80 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 text-sm">24-Hour Campus Flow & Energy</h4>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
              Current Peak Vibe
            </span>
          </div>
          <div className="relative h-24 w-full">
            <svg viewBox="0 0 300 80" className="h-full w-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="rhythmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 70 Q 50 65 80 40 T 150 15 T 220 30 T 260 20 T 300 65 L 300 80 L 0 80 Z"
                fill="url(#rhythmAreaGrad)"
              />
              <path
                d="M 0 70 Q 50 65 80 40 T 150 15 T 220 30 T 260 20 T 300 65"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="210" cy="28" r="5" fill="#10b981" className="animate-ping opacity-75" />
              <circle cx="210" cy="28" r="4" fill="#059669" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
          <div className="mt-2 flex justify-between font-mono text-[9px] font-bold text-slate-400">
            <span>8 AM</span>
            <span>11 AM</span>
            <span>1 PM (Lunch)</span>
            <span className="text-emerald-600 font-extrabold">NOW</span>
            <span>7 PM</span>
            <span>11 PM</span>
          </div>
        </div>
      )}

      {/* Cozy Corners: Campus Spots */}
      {activeSegment === "corners" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-up">
          {[
            { name: "Central Food Court (Block 34)", stat: "88% Lively", desc: "🍱 Fresh kathi rolls & coffee", color: "text-amber-600 bg-amber-50" },
            { name: "Central Library Floor 2 Nook", stat: "38% Peaceful", desc: "📚 52 quiet window desks", color: "text-emerald-600 bg-emerald-50" },
            { name: "Unipolis Steps & Quad", stat: "72% Welcoming", desc: "🏸 Gentle evening breeze", color: "text-teal-600 bg-teal-50" },
            { name: "Block 32 Embedded IoT Lab", stat: "60% Collaborative", desc: "⚡ Active peer debugging", color: "text-indigo-600 bg-indigo-50" },
          ].map((spot) => (
            <div
              key={spot.name}
              className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <h5 className="font-bold text-xs text-slate-800">{spot.name}</h5>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${spot.color}`}>
                  {spot.stat}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-slate-500">{spot.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
