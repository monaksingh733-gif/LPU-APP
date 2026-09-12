"use client";

import { motion } from "motion/react";
import { Layers, Home, Calendar, Users, Compass, Settings, MessageSquare, User } from "lucide-react";
import type { Tab } from "@/app/page";

interface SidebarProps {
  currentTab: Tab;
  onNavigate: (tab: Tab) => void;
  badge?: number;
}

export function Sidebar({ currentTab, onNavigate, badge = 0 }: SidebarProps) {
  const navItems: { tab: Tab; label: string; icon: typeof Home }[] = [
    { tab: "home", label: "Home", icon: Home },
    { tab: "buddies", label: "Buddies", icon: Users },
    { tab: "campus", label: "Campus", icon: Compass },
    { tab: "chats", label: "Chats", icon: MessageSquare },
    { tab: "profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-50 flex w-20 flex-col items-center border-r border-slate-200/60 bg-white/80 py-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      {/* Brand Icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate("home")}
        className="mb-10 cursor-pointer text-slate-800 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
        title="LPU Campus Pulse"
      >
        <Layers className="h-7 w-7 text-slate-800" />
      </motion.div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-5">
        {navItems.map((item) => {
          const active = currentTab === item.tab;
          const IconComponent = item.icon;

          return (
            <motion.button
              key={item.tab}
              whileHover={{ scale: active ? 1 : 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onNavigate(item.tab)}
              title={item.label}
              className={`relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl transition-all duration-200 ${
                active
                  ? "bg-emerald-100/60 text-emerald-700 shadow-sm ring-1 ring-emerald-200/50"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <IconComponent className="h-5 w-5" />
              {item.tab === "chats" && badge > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-extrabold text-white shadow-xs">
                  {badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
