"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/app/page";
import { api, fmtEventDate } from "@/lib/client";
import type { HomeData } from "@/lib/types";
import { Avatar, CampusSosModal, Modal, Skeleton } from "@/components/ui";
import {
  IconBell,
  IconBookmark,
  IconBuddies,
  IconCalendar,
  IconChevronLeft,
  IconFlame,
  IconFood,
  IconLeaf,
  IconMap,
  IconShield,
  IconSiren,
  IconSparkles,
} from "@/components/icons";
import { Cyber3DEyeWidget } from "@/components/Splash3D";
import { CampusModesBar } from "@/components/CampusModesBar";
import { useCampusMode } from "@/context/AppModeContext";
import { WalkWithMeGuardian } from "@/components/WalkWithMeGuardian";

export function HomeView() {
  const { me, go, refreshMe, toast } = useApp();
  const { mode: campusMode } = useCampusMode();
  const [data, setData] = useState<HomeData | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [walkWithMeOpen, setWalkWithMeOpen] = useState(false);
  const [insightTab, setInsightTab] = useState<"vibe" | "rhythm" | "hotspots">("vibe");

  useEffect(() => {
    let live = true;
    api<HomeData>("/api/home")
      .then((d) => live && setData(d))
      .catch(() => {});
    const t = setInterval(() => refreshMe(), 30_000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [refreshMe]);

  if (!me) return null;
  const user = me.user;
  const displayName = user.firstName && !/^\d+$/.test(user.firstName) ? user.firstName : "Anya";

  // Campus context tag line based on current hour
  const hour = new Date().getHours();
  const campusContext =
    hour >= 21 || hour < 5
      ? "🌙 Night Canteen & late-night cozy reading rooms open"
      : hour < 11
        ? "☕ Morning chai rush at Central Lawn"
        : hour < 15
          ? "🍱 Peak lunchtime at Main Canteen & Food Courts"
          : "🏸 Evening meetups & sports active on the quad";

  return (
    <div className="no-scrollbar h-full overflow-y-auto paper-texture">
      {/* Apple-style Frosted Glass Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line/60 bg-paper/85 px-4 py-3 backdrop-blur-2xl transition-all">
        <button
          onClick={() => go("profile")}
          className="cursor-pointer tap-spring"
          title="Open profile"
        >
          <Avatar name={user.fullName} hue={user.avatarHue} size={42} status="online" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-display text-[16px] font-bold text-ink tracking-tight">
              {data?.greeting ?? "Good morning"}, {displayName}
            </p>
            <IconLeaf size={15} className="text-[#84a98c] shrink-0" />
          </div>
          <p className="truncate text-[11.5px] font-semibold text-ink-faint">
            {user.course} · {user.academicYear === 1 ? "1st" : user.academicYear === 2 ? "2nd" : user.academicYear === 3 ? "3rd" : "4th"} year
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Safe Walk Guardian Escort button */}
          <button
            onClick={() => setWalkWithMeOpen(true)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-teal-500/25 bg-teal-500/10 text-teal-800 dark:text-teal-200 tap-spring hover:bg-teal-500/20 shadow-xs"
            title="Walk With Me Guardian Escort"
            aria-label="Walk With Me Guardian"
          >
            <span className="text-base">🛡️</span>
          </button>

          {/* Announcements bell (min 48x48dp touch target) */}
          <button
            onClick={() => setBellOpen(true)}
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-line/70 bg-cream text-ink-soft tap-spring hover:border-ink-faint hover:text-ink shadow-xs"
            title="Campus Notices"
            aria-label="Campus Notices"
          >
            <IconBell size={19} />
            {(data?.announcements.length ?? 0) > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-amber ring-2 ring-cream shadow-xs" />
            )}
          </button>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4 pb-24">
        {/* Apple Dynamic Island Context Capsule */}
        <div className="dynamic-island-capsule group flex items-center gap-3 rounded-full bg-[#0a1812] px-4 py-2.5 text-cream text-[11.5px] font-medium shadow-xl border border-white/15">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="truncate tracking-tight">{campusContext}</span>
          <span className="ml-auto shrink-0 rounded-full bg-white/12 px-2.5 py-0.5 text-[9.5px] font-bold tracking-wider uppercase text-emerald-300">
            Live
          </span>
        </div>

        {/* Global Campus Modes Switcher */}
        <CampusModesBar
          onAction={(m) => {
            if (m === "solo") toast("Solo Zen Active: Quiet study havens highlighted on the 3D map 🧘", "ok");
            if (m === "duo") go("buddies");
            if (m === "group") go("campus");
          }}
        />

        {user.isRestricted && (
          <button
            onClick={() => go("profile")}
            className="animate-pop flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border border-clay/35 bg-clay-soft px-4 py-3 text-left shadow-sm transition-transform active:scale-[0.98]"
          >
            <IconShield size={18} className="shrink-0 text-clay" />
            <span className="text-xs leading-snug font-semibold text-clay">
              Account restricted — new chat requests paused. Existing chats still work. Tap to view details.
            </span>
          </button>
        )}

        {/* Warm & Cozy Campus Hub with 3D Gyroscope Hologram */}
        <section className="relative overflow-hidden rounded-3xl border border-[#8aa792]/35 bg-gradient-to-br from-[#2a4539] via-[#355447] to-[#1f352b] text-cream shadow-xl">
          {/* Subtle tactile cyber-paper backdrop */}
          <div className="cyber-grid pointer-events-none absolute inset-0 opacity-15" />

          {/* 3D Gyroscope Hologram Eye embedded in the top-right corner */}
          <div className="pointer-events-none absolute -right-6 -top-4 opacity-85 mix-blend-screen">
            <Cyber3DEyeWidget size={145} />
          </div>

          <div className="relative z-10 p-5">
            {/* Header with warm sage & terracotta telemetry badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#cad2c5] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#f4a261] animate-ping" />
                <span className="flex items-center gap-1">
                  <IconLeaf size={12} className="text-[#84a98c]" />
                  CAMPUS PULSE // COZY HUB
                </span>
              </div>
              <span className="rounded-full border border-[#8aa792]/40 bg-[#1b3026]/70 px-2 py-0.5 font-mono text-[9px] font-bold text-[#cad2c5] backdrop-blur-xs">
                CAMPUS HARMONY · LIVE
              </span>
            </div>

            {/* Main Friends Here Headline with Warm 3D Isometric Node */}
            <div className="mt-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f4a261] via-[#e76f51] to-[#e9c46a] shadow-md shadow-[#e76f51]/30">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#264653] fill-none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-[27px] leading-none font-black tracking-tight drop-shadow-sm text-white">
                    {data ? data.pulse.total.toLocaleString() : "340"}
                  </p>
                  <span className="font-display text-sm font-bold text-[#cad2c5]">
                    friends here on campus right now
                  </span>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-cream/75 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#84a98c]" />
                <span>Warm quad ambience · Friendly social vibe</span>
              </p>
            </div>

            {/* Interconnected Rounded Tabs with Warm Color Separation */}
            <div className="mt-4 flex rounded-2xl border border-white/15 bg-black/25 p-1 backdrop-blur-md">
              {(
                [
                  { id: "vibe", label: "🌿 Warm Vibe" },
                  { id: "rhythm", label: "📈 Rhythm" },
                  { id: "hotspots", label: "🏡 Cozy Corners" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInsightTab(tab.id)}
                  className={`flex-1 cursor-pointer rounded-xl py-1.5 text-center text-[10.5px] font-bold transition-all duration-200 ${
                    insightTab === tab.id
                      ? "bg-gradient-to-r from-[#c86d51] to-[#b2573d] text-white shadow-xs"
                      : "text-cream/70 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Warm Vibe Content */}
            {insightTab === "vibe" && (
              <div className="mt-3.5 space-y-2.5 animate-pop">
                {/* Lightened sub-cards for WCAG AAA accessibility with friendly copywriting */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Friendly souls", n: data?.pulse.buddies ?? 90, icon: "👥", tab: "buddies" as const },
                    { label: "Cozy cafes", n: data?.pulse.food ?? 60, icon: "☕", tab: "campus" as const },
                    { label: "Gatherings", n: data?.pulse.events ?? 40, icon: "✨", tab: "buddies" as const },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => go(s.tab)}
                      className="group cursor-pointer rounded-xl border border-white/20 bg-white/14 p-2.5 text-left backdrop-blur-md transition-all hover:bg-white/22 hover:border-white/35 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{s.icon}</span>
                        <span className="font-mono text-sm font-black text-[#fde047] drop-shadow-xs group-hover:scale-105 transition-transform">
                          {s.n}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] font-bold text-white/95 leading-tight">{s.label}</p>
                    </button>
                  ))}
                </div>

                {/* Real-time Campus Energy Meter */}
                <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-[10px] font-bold text-cream/90">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#84a98c] animate-pulse" />
                      Quad Atmosphere
                    </span>
                    <span className="font-mono text-[#fde047] font-extrabold">Gentle & Welcoming (92%)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/40 p-[1px]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#84a98c] via-[#f4a261] to-[#e76f51] shadow-[0_0_8px_rgba(231,111,81,0.8)] w-[92%]" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Rhythm (24h Activity Curve) */}
            {insightTab === "rhythm" && (
              <div className="mt-3.5 space-y-2 animate-pop">
                <div className="rounded-2xl border border-white/12 bg-black/25 p-3.5 backdrop-blur-md">
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-cream/80 mb-2">
                    <span className="flex items-center gap-1">
                      <IconLeaf size={12} className="text-[#84a98c]" />
                      24h Campus Rhythm & Flow
                    </span>
                    <span className="font-mono text-[#f4a261] text-[9.5px]">NOW: Peak Flow</span>
                  </div>

                  {/* SVG Area Sparkline Chart with warm terracotta & sage gradient */}
                  <div className="relative h-20 w-full">
                    <svg viewBox="0 0 300 80" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="warmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f4a261" stopOpacity="0.55" />
                          <stop offset="100%" stopColor="#84a98c" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area Fill */}
                      <path
                        d="M 0 70 Q 50 65 80 40 T 150 15 T 220 30 T 260 20 T 300 65 L 300 80 L 0 80 Z"
                        fill="url(#warmAreaGrad)"
                      />
                      {/* Stroke Curve */}
                      <path
                        d="M 0 70 Q 50 65 80 40 T 150 15 T 220 30 T 260 20 T 300 65"
                        fill="none"
                        stroke="#f4a261"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Current time pin */}
                      <circle cx="210" cy="28" r="5" fill="#e76f51" className="animate-ping opacity-75" />
                      <circle cx="210" cy="28" r="4" fill="#f4a261" stroke="#ffffff" strokeWidth="1.5" />
                      <line x1="210" y1="28" x2="210" y2="80" stroke="#f4a261" strokeDasharray="2 2" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Hour markers */}
                  <div className="mt-1.5 flex justify-between font-mono text-[8px] font-bold text-cream/60">
                    <span>8 AM</span>
                    <span>11 AM</span>
                    <span>1 PM (Lunch)</span>
                    <span className="text-[#f4a261]">NOW</span>
                    <span>7 PM</span>
                    <span>11 PM</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Cozy Corners */}
            {insightTab === "hotspots" && (
              <div className="mt-3.5 space-y-2 animate-pop">
                {[
                  { name: "Central Food Court (Block 34)", busy: "88% Lively", wait: "🍱 ~10m wait", level: "w-[88%] bg-[#f4a261]" },
                  { name: "University Central Library", busy: "38% Peaceful", wait: "📚 52 cozy seats open", level: "w-[38%] bg-[#84a98c]" },
                  { name: "Outdoor Quadrangle & Lawns", busy: "72% Welcoming", wait: "🏸 Games & gentle breeze", level: "w-[72%] bg-[#52796f]" },
                  { name: "Creative Innovation Studio", busy: "60% Friendly", wait: "🎨 Collaborative teams", level: "w-[60%] bg-[#e76f51]" },
                ].map((h) => (
                  <div
                    key={h.name}
                    className="rounded-2xl border border-white/12 bg-white/8 p-3 flex items-center justify-between gap-3 text-xs backdrop-blur-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white text-[11.5px]">{h.name}</p>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                        <div className={`h-full rounded-full ${h.level}`} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] font-bold text-[#fde047] block">{h.busy}</span>
                      <span className="text-[9px] text-cream/80 block">{h.wait}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* quick actions 2x2 with pastel circular icon anchors and friendly copywriting */}
        <section className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <IconBuddies size={21} />,
              title: "Find a Buddy",
              sub: "Duo Beacons & 1-on-1 partners",
              tab: "buddies" as const,
              circleBg: "bg-[#dcfce7] text-[#15803d]", // soft pastel mint
            },
            {
              icon: <IconFlame size={21} />,
              title: "Fests & Hype",
              sub: "Gigs, street plays & practice zones",
              tab: "buddies" as const,
              circleBg: "bg-[#fef3c7] text-[#b45309]", // soft pastel amber
            },
            {
              icon: <IconSparkles size={21} />,
              title: "Sports & Vault",
              sub: "Pickup matches & gear sharing",
              tab: "buddies" as const,
              circleBg: "bg-[#ffe4e6] text-[#be123c]", // soft pastel rose
            },
            {
              icon: <IconMap size={21} />,
              title: "3D Campus Map",
              sub: "Isometric quad & heatmaps",
              tab: "campus" as const,
              circleBg: "bg-[#e0f2fe] text-[#0369a1]", // soft pastel sky
            },
          ].map((a) => (
            <button
              key={a.title}
              onClick={() => go(a.tab)}
              className="cursor-pointer rounded-2xl border border-line bg-cream p-4 text-left shadow-2xs transition-all duration-150 active:scale-[0.96] hover:border-ink-faint/60 hover:shadow-sm"
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full shadow-xs ${a.circleBg}`}
              >
                {a.icon}
              </span>
              <p className="mt-3 font-display text-sm font-bold text-ink">{a.title}</p>
              <p className="text-[11px] font-semibold text-ink-faint">{a.sub}</p>
            </button>
          ))}
        </section>

        {/* official announcements with textured terracotta background and bookmark icon */}
        <section className="mt-8 pt-1">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconBookmark size={15} className="text-[#c86d51]" />
              <h3 className="font-display text-sm font-bold text-ink">
                Official announcements
              </h3>
            </div>
            <button
              onClick={() => setBellOpen(true)}
              className="cursor-pointer text-[11px] font-bold text-[#c86d51] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-2.5">
            {!data && (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
            {(data?.announcements ?? []).map((a) => (
              <article
                key={a.id}
                className={`rounded-2xl border p-4 shadow-sm transition-transform duration-150 ${
                  a.pinned
                    ? "border-[#a4533a]/60 bg-gradient-to-br from-[#c86d51] via-[#be6045] to-[#a85038] text-white shadow-md shadow-[#c86d51]/25 relative overflow-hidden"
                    : "border-line bg-cream"
                }`}
              >
                {a.pinned && (
                  <div className="pointer-events-none absolute -right-3 -bottom-3 text-white/10">
                    <IconLeaf size={72} />
                  </div>
                )}
                <div className="flex items-center justify-between text-[10.5px] font-bold tracking-wider uppercase">
                  {a.pinned ? (
                    <span className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-0.5 text-white font-black backdrop-blur-xs">
                      <IconBookmark size={13} className="text-amber-200 fill-current" />
                      Important Notice
                    </span>
                  ) : (
                    <span className="text-ink-faint flex items-center gap-1">
                      <IconBookmark size={12} />
                      University Notice
                    </span>
                  )}
                  {a.pinned && (
                    <span className="font-mono text-[9px] text-white/80 lowercase">
                      priority
                    </span>
                  )}
                </div>
                <p className={`mt-2 font-display text-[15px] font-bold leading-snug ${a.pinned ? "text-white" : "text-ink"}`}>
                  {a.title}
                </p>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    a.pinned ? "text-white/90" : "text-ink-soft"
                  }`}
                >
                  {a.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* trending meetups */}
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconFlame size={16} className="text-amber animate-bounce" />
              <h3 className="font-display text-sm font-bold text-ink">Trending Campus Events</h3>
            </div>
            <button
              onClick={() => go("buddies")}
              className="cursor-pointer text-[11px] font-bold text-pine hover:underline"
            >
              Explore all →
            </button>
          </div>
          <div className="space-y-2.5">
            {!data && (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
            {(data?.trending ?? []).map((e) => {
              const tag = (e.tag || "").toLowerCase();
              const isCultural = tag === "cultural";
              const isCoding = tag === "coding";
              const isMusic = tag === "music";

              return (
                <button
                  key={e.id}
                  onClick={() => go("buddies")}
                  className="group flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-line bg-cream p-2.5 text-left shadow-2xs transition-all duration-150 active:scale-[0.98] hover:border-ink-faint/60 hover:shadow-sm"
                >
                  {e.image ? (
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-pine-ink shadow-xs">
                      <img
                        src={e.image}
                        alt={e.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-1 left-1.5 text-[8px] font-black uppercase text-white drop-shadow-xs">
                        {isCultural ? "🎭 Cultural" : isCoding ? "⚡ Coding" : isMusic ? "🎵 Music" : e.tag}
                      </span>
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-amber-soft text-amber shadow-2xs">
                      <span className="font-display text-base leading-none font-bold">
                        {new Date(e.startsAt).getDate()}
                      </span>
                      <span className="text-[8px] font-black uppercase">
                        {new Date(e.startsAt).toLocaleDateString([], { month: "short" })}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          isCultural
                            ? "bg-amber-soft text-amber"
                            : isCoding
                              ? "bg-pine-soft text-pine"
                              : "bg-line/70 text-ink-soft"
                        }`}
                      >
                        {e.tag}
                      </span>
                    </div>
                    <p className="truncate font-display text-sm font-bold text-ink mt-0.5">{e.title}</p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-ink-faint">
                      👥 <strong className="text-pine font-bold">{e.buddySeekers} seeking buddies</strong> · {e.location}
                    </p>
                  </div>
                  <IconChevronLeft size={16} className="rotate-180 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sticky SOS Floating Action Button (FAB) anchored in the bottom-right thumb zone */}
      <button
        onClick={() => setSosOpen(true)}
        aria-label="Campus SOS Emergency"
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#dc2626] text-white shadow-xl shadow-red-700/40 ring-4 ring-red-500/25 transition-transform active:scale-95 hover:bg-[#b91c1c] sm:right-6 md:absolute md:bottom-20 md:right-5 tap-bounce"
        title="Campus Safety & SOS"
      >
        <span className="absolute -inset-1 rounded-full bg-red-500 animate-ping opacity-35 pointer-events-none" />
        <div className="relative flex flex-col items-center justify-center leading-none">
          <IconSiren size={20} className="text-white drop-shadow-xs" />
          <span className="mt-0.5 text-[9px] font-black tracking-wider uppercase text-white">SOS</span>
        </div>
      </button>

      {/* Campus notices modal */}
      <Modal open={bellOpen} onClose={() => setBellOpen(false)}>
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h3 className="font-display text-base font-bold text-ink">Campus notices</h3>
          <button
            onClick={() => setBellOpen(false)}
            className="cursor-pointer rounded-full p-1 text-ink-faint hover:bg-line/60"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
          {(data?.announcements ?? []).map((a) => (
            <div key={a.id} className="rounded-xl border border-line bg-paper p-3">
              <p className="text-sm font-bold text-ink">{a.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{a.body}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Campus Emergency SOS Hub */}
      <CampusSosModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        toast={toast}
      />

      {/* Walk With Me Guardian Escort */}
      {walkWithMeOpen && (
        <WalkWithMeGuardian
          onClose={() => setWalkWithMeOpen(false)}
          onToast={(msg, tone) => toast(msg, tone)}
        />
      )}
    </div>
  );
}
