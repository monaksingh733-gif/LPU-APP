"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  Code,
  Gamepad2,
  Cpu,
  Sparkles,
  ArrowRight,
  Bookmark,
  Check,
  X,
  FileText,
  Send,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search,
  Building2,
  MapPin,
  Clock,
  Coins,
  Layers,
  Columns3,
  Rows3,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/app/page";

export interface OpportunityItem {
  id: string | number;
  role: string;
  company: string;
  type: string;
  category: "For You" | "Freshers" | "All Campus";
  stipend: string;
  icon: typeof Code;
  match: string;
  reason: string;
  color: string;
  bg: string;
  iconBg: string;
  requirements: string[];
}

const OPPORTUNITIES_DATA: OpportunityItem[] = [
  {
    id: 1,
    role: "Front-End Developer Intern",
    company: "Campus Innovation Labs · Block 34",
    type: "Final Year Internship",
    category: "For You",
    stipend: "₹18,000 / mo",
    icon: Code,
    match: "98%",
    reason: "Matches your Next.js & React stack",
    color: "text-blue-600",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100/60",
    requirements: ["React / Next.js", "Tailwind CSS", "Git workflows"],
  },
  {
    id: 2,
    role: "Interactive Web Game Dev",
    company: "Student Tech Hub · Uni-Mall",
    type: "Part-time Gig",
    category: "For You",
    stipend: "₹12,000 / mo",
    icon: Gamepad2,
    match: "94%",
    reason: "Aligns with canvas & physics scripting",
    color: "text-orange-600",
    bg: "bg-orange-50",
    iconBg: "bg-orange-100/60",
    requirements: ["HTML5 Canvas", "JavaScript", "Animation states"],
  },
  {
    id: 3,
    role: "AI Perception & Robotics Intern",
    company: "Advanced Credit Program · Block 32",
    type: "Summer Research",
    category: "Freshers",
    stipend: "Academic Credits + ₹10,000",
    icon: Cpu,
    match: "89%",
    reason: "Fits your recent AI mapping coursework",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100/60",
    requirements: ["Python", "OpenCV basics", "ROS / Arduino"],
  },
];

export function PersonalizedOpportunities() {
  const { me, toast, go } = useApp();
  const [activeFilter, setActiveFilter] = useState<"For You" | "Freshers" | "All Campus">("For You");
  const [bookmarkedIds, setBookmarkedIds] = useState<(string | number)[]>([]);
  const [selectedRole, setSelectedRole] = useState<OpportunityItem | null>(null);
  const [appliedRoles, setAppliedRoles] = useState<(string | number)[]>([]);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [opportunitiesList, setOpportunitiesList] = useState<OpportunityItem[]>(OPPORTUNITIES_DATA);
  const [layoutMode, setLayoutMode] = useState<"reel" | "stack">("reel");
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const reelRef = useRef<HTMLDivElement>(null);

  // Synchronize with PostgreSQL matchmaking pipeline
  useEffect(() => {
    let active = true;
    fetch("/api/opportunities/matches")
      .then((res) => (res.ok ? res.json() : fetch("/api/matchmaking").then((r) => r.json())))
      .then((data) => {
        const opps = data?.openOpportunities || data?.opportunities;
        if (active && opps?.length > 0) {
          const mapped: OpportunityItem[] = opps.map((opp: any, idx: number) => {
            const fallback = OPPORTUNITIES_DATA[idx % OPPORTUNITIES_DATA.length];
            return {
              id: opp.id,
              role: opp.title,
              company: opp.company,
              type: opp.type,
              category: opp.category as "For You" | "Freshers" | "All Campus",
              stipend: opp.stipend,
              icon: fallback.icon,
              match: opp.match,
              reason: opp.reason,
              color: fallback.color,
              bg: fallback.bg,
              iconBg: fallback.iconBg,
              requirements: opp.requirements?.length > 0 ? opp.requirements : fallback.requirements,
            };
          });
          setOpportunitiesList(mapped);
          const alreadyApplied = opps
            .filter((o: any) => o.hasApplied)
            .map((o: any) => o.id);
          if (alreadyApplied.length > 0) {
            setAppliedRoles(alreadyApplied);
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const toggleBookmark = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    const item = opportunitiesList.find((o) => o.id === id);
    if (!bookmarkedIds.includes(id)) {
      toast(`Saved "${item?.role}" to bookmarks 🔖`, "ok");
    }
  };

  const filteredList = opportunitiesList.filter((item) => {
    if (activeFilter === "All Campus") return true;
    return item.category === activeFilter;
  });

  const scrollReel = (direction: "left" | "right") => {
    if (!reelRef.current) return;
    const amount = 300;
    reelRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleInstantApply = async (item: OpportunityItem) => {
    setGeneratingResume(true);
    try {
      await fetch("/api/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply", opportunityId: item.id }),
      });
    } catch {}
    setTimeout(() => {
      setGeneratingResume(false);
      setAppliedRoles((prev) => [...prev, item.id]);
      setSelectedRole(null);
      toast(`1-Click Application Sent for ${item.role}! Verified profile shared 🚀`, "ok");
    }, 600);
  };

  const searchedExplorerList = opportunitiesList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.role.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.requirements.some((r) => r.toLowerCase().includes(q)) ||
      item.stipend.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full pb-2">
      {/* Header & Dimensions Controls */}
      <div className="mb-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Internship Opportunities
            </h2>
            <span className="rounded-full bg-emerald-100/90 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-800">
              AI MATCH
            </span>
          </div>

          {/* Reel vs Stack Dimension Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-0.5 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setLayoutMode("reel")}
              title="Horizontal Reel (Page side bleed)"
              aria-label="Horizontal Reel View"
              className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all ${
                layoutMode === "reel"
                  ? "bg-white text-emerald-700 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("stack")}
              title="Vertical Stack View"
              aria-label="Vertical Stack View"
              className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all ${
                layoutMode === "stack"
                  ? "bg-white text-emerald-700 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Rows3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <p className="truncate font-medium text-[11.5px]">
            {filteredList.length} roles matched to your course & project stack
          </p>
          <button
            type="button"
            onClick={() => setIsExplorerOpen(true)}
            className="shrink-0 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 ml-2 cursor-pointer tap-spring"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Horizontal Category Filters & Navigation */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {(["For You", "Freshers", "All Campus"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`relative whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === filter
                    ? "text-emerald-800 font-extrabold"
                    : "text-slate-500 hover:text-slate-700 bg-white/70 border border-slate-100"
                }`}
              >
                {activeFilter === filter && (
                  <motion.div
                    layoutId="activeInternshipFilter"
                    className="absolute inset-0 -z-10 rounded-xl bg-emerald-100/90 border border-emerald-300/60 shadow-2xs"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                  />
                )}
                {filter}
              </button>
            ))}
          </div>

          {/* Next / Prev buttons for Horizontal Reel mode */}
          {layoutMode === "reel" && filteredList.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => scrollReel("left")}
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollReel("right")}
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="Next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards Layout - Dual Dimension Handling */}
      {layoutMode === "reel" ? (
        /* HORIZONTAL REEL: Page-side bleed with -mx-4 px-4 and smooth snap-scroll */
        <div
          ref={reelRef}
          className="-mx-4 px-4 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pt-0.5 pb-2"
        >
          <AnimatePresence mode="popLayout">
            {filteredList.map((job, i) => {
              const isBookmarked = bookmarkedIds.includes(job.id);
              const isApplied = appliedRoles.includes(job.id);

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  onClick={() => setSelectedRole(job)}
                  className="w-[285px] sm:w-[300px] shrink-0 snap-start group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-white p-4.5 shadow-[0_4px_16px_rgb(0,0,0,0.03)] border border-slate-100 hover:border-emerald-200 hover:shadow-[0_6px_24px_rgb(0,0,0,0.06)] transition-all cursor-pointer"
                >
                  <div>
                    {/* Top card bar: Logo + Category + Bookmark */}
                    <div className="mb-2.5 flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${job.iconBg} ${job.color}`}
                        >
                          <job.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-600 truncate max-w-[150px]">
                            {job.type}
                          </span>
                          <p className="text-[10.5px] font-medium text-slate-400 truncate">
                            Verified Opportunity
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(job.id, e)}
                        className="rounded-full p-1.5 text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
                        title={isBookmarked ? "Remove Bookmark" : "Save Role"}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            isBookmarked ? "fill-orange-500 text-orange-500" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Role title & Company location */}
                    <h3 className="font-display text-[15px] font-extrabold leading-snug text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {job.role}
                    </h3>
                    <p className="mt-0.5 text-[11.5px] font-medium text-slate-500 truncate">
                      {job.company}
                    </p>

                    {/* AI Match Compatibility Badge */}
                    <div
                      className={`mt-2.5 flex items-center gap-1.5 rounded-xl ${job.bg} px-2.5 py-1.5 text-[10px] font-bold ${job.color}`}
                    >
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        <strong>{job.match} Match</strong> · {job.reason}
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {job.requirements.slice(0, 2).map((req) => (
                        <span
                          key={req}
                          className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 truncate max-w-[130px]"
                        >
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 2 && (
                        <span className="rounded-lg bg-slate-50 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-400">
                          +{job.requirements.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Stipend & 1-Click Action */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-slate-50 pt-2.5">
                    <div className="min-w-0 pr-2">
                      <span className="block text-[11.5px] font-extrabold text-slate-900 leading-tight">
                        {job.stipend}
                      </span>
                      <span className="block text-[9.5px] font-medium text-slate-400 truncate">
                        Fast-Track Application
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRole(job);
                      }}
                      className={`flex h-7.5 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-transform active:scale-95 shadow-2xs ${
                        isApplied
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <span>Apply</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* VERTICAL STACK: Clean single-column layout with consistent vertical rhythm */
        <div className="grid grid-cols-1 gap-3 pt-0.5">
          <AnimatePresence mode="popLayout">
            {filteredList.map((job, i) => {
              const isBookmarked = bookmarkedIds.includes(job.id);
              const isApplied = appliedRoles.includes(job.id);

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  onClick={() => setSelectedRole(job)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-4 shadow-2xs border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${job.iconBg} ${job.color}`}
                      >
                        <job.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-600">
                            {job.type}
                          </span>
                          <span
                            className={`rounded-md ${job.bg} px-1.5 py-0.5 text-[9.5px] font-extrabold ${job.color}`}
                          >
                            {job.match} Match
                          </span>
                        </div>
                        <h3 className="mt-1 font-display text-[15px] font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {job.role}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 truncate">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(job.id, e)}
                      className="rounded-full p-1.5 text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-colors shrink-0 cursor-pointer"
                      title={isBookmarked ? "Remove Bookmark" : "Save Role"}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          isBookmarked ? "fill-orange-500 text-orange-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Skills and Stipend in horizontal row */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2.5">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className="text-xs font-black text-slate-900">{job.stipend}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] text-slate-500 truncate">
                        {job.requirements.slice(0, 2).join(", ")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRole(job);
                      }}
                      className={`flex h-7.5 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-transform active:scale-95 shrink-0 ${
                        isApplied
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <span>Apply</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* EXPANDED FULL-DIMENSION DIRECTORY MODAL ("View All") */}
      {isExplorerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="w-full max-w-sm sm:max-w-md rounded-t-[2.25rem] sm:rounded-[2.25rem] bg-white p-5 shadow-2xl ring-1 ring-slate-100 max-h-[90dvh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Campus Internship Directory
                  </h3>
                  <p className="text-[10.5px] text-slate-500">
                    {opportunitiesList.length} total active university postings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExplorerOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by role, stack (React, Python), or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Scrollable list */}
            <div className="mt-3 flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
              {searchedExplorerList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No internships match &quot;{searchQuery}&quot;.
                </div>
              ) : (
                searchedExplorerList.map((job) => {
                  const isApplied = appliedRoles.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedRole(job);
                      }}
                      className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3 hover:bg-slate-100/80 transition-colors border border-slate-100 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {job.role}
                          </span>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 shrink-0">
                            {job.match}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{job.company}</p>
                        <span className="text-[10.5px] font-extrabold text-emerald-700 block mt-0.5">
                          {job.stipend} · {job.type}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRole(job);
                        }}
                        className={`h-7 rounded-full px-2.5 text-[10px] font-bold shrink-0 ${
                          isApplied ? "bg-emerald-200 text-emerald-900" : "bg-slate-900 text-white"
                        }`}
                      >
                        {isApplied ? "Applied" : "Details"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setIsExplorerOpen(false)}
                className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close Directory
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ROLE DETAIL & 1-CLICK RESUME APPLY MODAL */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="w-full max-w-sm sm:max-w-md rounded-t-[2.25rem] sm:rounded-[2.25rem] bg-white p-5 sm:p-6 shadow-2xl ring-1 ring-slate-100 max-h-[88dvh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${selectedRole.iconBg} ${selectedRole.color}`}
                >
                  <selectedRole.icon className="h-5.5 w-5.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight truncate">
                    {selectedRole.role}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 truncate">
                    {selectedRole.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3.5">
              {/* Match Reason Banner */}
              <div
                className={`rounded-2xl ${selectedRole.bg} p-3 text-xs ${selectedRole.color}`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Compatibility: {selectedRole.match} Match</span>
                </div>
                <p className="text-[11px] opacity-90">{selectedRole.reason}</p>
              </div>

              {/* Stipend & Duration Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Stipend
                  </span>
                  <span className="font-extrabold text-slate-900">{selectedRole.stipend}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Type
                  </span>
                  <span className="font-extrabold text-slate-900">{selectedRole.type}</span>
                </div>
              </div>

              {/* Core Requirements */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Coursework & Skills Needed
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRole.requirements.map((req) => (
                    <span
                      key={req}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700"
                    >
                      ✓ {req}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Auto-Compiled Student Portfolio */}
              <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-900 truncate">
                    Verified LPU Academic Portfolio
                  </p>
                  <p className="text-[10.5px] text-slate-500 truncate">
                    {me?.user.fullName || "Student"} · {me?.user.course || "B.Tech"} · CGPA Verified
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={generatingResume || appliedRoles.includes(selectedRole.id)}
                onClick={() => handleInstantApply(selectedRole)}
                className="flex-1 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {generatingResume ? (
                  <span>Submitting...</span>
                ) : appliedRoles.includes(selectedRole.id) ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Applied</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>1-Click Apply</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
