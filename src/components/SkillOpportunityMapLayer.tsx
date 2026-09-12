"use client";

import { useState } from "react";
import { Avatar, Modal } from "@/components/ui";
import {
  IconBuilding,
  IconCheck,
  IconClock,
  IconFlame,
  IconNavigation,
  IconPin,
  IconSparkles,
  IconUsers,
  IconX,
} from "@/components/icons";

export type OpportunityKind = "skill" | "bounty" | "hackathon" | "study";

export interface OpportunityBeacon {
  id: string;
  kind: OpportunityKind;
  title: string;
  creatorName: string;
  creatorCourse: string;
  creatorAvatarHue: number;
  locationName: string;
  blockName: string;
  roomNumber?: string;
  reward?: string;
  x: number;
  y: number;
  expiresMinutes: number;
  totalMinutes: number;
  description: string;
  tags: string[];
  activeParticipants?: number;
}

export const INITIAL_OPPORTUNITIES: OpportunityBeacon[] = [
  {
    id: "opp-1",
    kind: "skill",
    title: "React & Git 1-on-1 Code Review",
    creatorName: "Aarav Mehta",
    creatorCourse: "B.Tech CSE 3rd Yr",
    creatorAvatarHue: 142,
    locationName: "Central Library · Floor 3 Quiet Nook",
    blockName: "Central Library",
    roomNumber: "Desk #14 (Window Side)",
    reward: "Free Peer Mentoring · 2 hrs available",
    x: 43,
    y: 22,
    expiresMinutes: 35,
    totalMinutes: 60,
    description:
      "Sitting near window desk 14. Free for the next 40 mins—happy to review your React components, Tailwind styling, or debug Git rebase conflicts.",
    tags: ["React", "Git", "Web Dev"],
    activeParticipants: 1,
  },
  {
    id: "opp-2",
    kind: "bounty",
    title: "Dance Fest Event Photographer Needed",
    creatorName: "Cine-Club LPU",
    creatorCourse: "Official Campus Society",
    creatorAvatarHue: 330,
    locationName: "Baldev Raj Mittal Unipolis Steps",
    blockName: "Unipolis",
    roomNumber: "Main Stage Sound Booth",
    reward: "₹500 Cash Payout on Completion",
    x: 68,
    y: 55,
    expiresMinutes: 18,
    totalMinutes: 45,
    description:
      "Urgent! Our event photographer had a timetable clash. Need someone with DSLR/mirrorless for 45 mins at the stage. Immediate payout right after.",
    tags: ["Photography", "₹500 Cash", "Fest"],
    activeParticipants: 0,
  },
  {
    id: "opp-3",
    kind: "bounty",
    title: "Arduino Uno I2C OLED Display Debugging",
    creatorName: "Meera Pillai",
    creatorCourse: "B.Tech ECE 2nd Yr",
    creatorAvatarHue: 262,
    locationName: "Block 32 · Embedded IoT Lab",
    blockName: "Block 32",
    roomNumber: "Room 204 (Workbench 3)",
    reward: "₹250 + Cold Coffee & Notes",
    x: 32,
    y: 38,
    expiresMinutes: 38,
    totalMinutes: 60,
    description:
      "Sensor readings freezing after 10 loops on Adafruit SSD1306. Need someone familiar with wire.h library or logic analyzer to check SDA/SCL pullups.",
    tags: ["Hardware", "Arduino", "IoT"],
    activeParticipants: 1,
  },
  {
    id: "opp-4",
    kind: "hackathon",
    title: "FastAPI / Node Backend Partner Wanted",
    creatorName: "Anya Sharma",
    creatorCourse: "B.Des & Frontend 2nd Yr",
    creatorAvatarHue: 18,
    locationName: "Block 34 · Innovation & Design Lab",
    blockName: "Block 34",
    roomNumber: "Room 402 (Mac Lab)",
    reward: "Smart India Hackathon 2026 Team",
    x: 21,
    y: 34,
    expiresMinutes: 80,
    totalMinutes: 120,
    description:
      "Building an AI-powered campus navigation app. UI/UX prototypes are ready in Next.js. Looking for a teammate strong in vector databases and REST APIs.",
    tags: ["Hackathon", "FastAPI", "SIH 2026"],
    activeParticipants: 2,
  },
  {
    id: "opp-5",
    kind: "study",
    title: "Operating Systems Midterm Prep Squad",
    creatorName: "Rohan Iyer",
    creatorCourse: "B.Tech CSE 3rd Yr",
    creatorAvatarHue: 210,
    locationName: "Block 14 · Ground Floor Lecture Hall",
    blockName: "Block 14",
    roomNumber: "Room 102",
    reward: "Handwritten Cheatsheets & PYQs",
    x: 55,
    y: 68,
    expiresMinutes: 48,
    totalMinutes: 90,
    description:
      "Solving past 5 years midterm questions for Process Scheduling & Semaphores. 8 students already here collaborating.",
    tags: ["OS Exam", "PYQs", "Study Hotspot"],
    activeParticipants: 8,
  },
];

export const LPU_BLOCK_PRESETS = [
  { name: "Block 34 (Design & IT Hub)", x: 21, y: 34 },
  { name: "Central Library (Reading Halls)", x: 43, y: 22 },
  { name: "Baldev Raj Mittal Unipolis", x: 68, y: 55 },
  { name: "Block 32 (Engineering & Labs)", x: 32, y: 38 },
  { name: "Block 14 (Academic Classrooms)", x: 55, y: 68 },
  { name: "Uni-Mall Food & Startup Hub", x: 74, y: 36 },
];

export function DropOpportunityModal({
  open,
  onClose,
  onDrop,
  initialCoordinates,
}: {
  open: boolean;
  onClose: () => void;
  onDrop: (beacon: OpportunityBeacon) => void;
  initialCoordinates?: { x: number; y: number } | null;
}) {
  const [kind, setKind] = useState<OpportunityKind>("bounty");
  const [title, setTitle] = useState("");
  const [blockIndex, setBlockIndex] = useState(0);
  const [room, setRoom] = useState("");
  const [reward, setReward] = useState("");
  const [duration, setDuration] = useState(45);
  const [desc, setDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const block = LPU_BLOCK_PRESETS[blockIndex];
    const targetX = initialCoordinates ? initialCoordinates.x : block.x + (Math.random() * 4 - 2);
    const targetY = initialCoordinates ? initialCoordinates.y : block.y + (Math.random() * 4 - 2);

    const newBeacon: OpportunityBeacon = {
      id: "opp-" + Date.now(),
      kind,
      title: title.trim(),
      creatorName: "You (Verified Student)",
      creatorCourse: "B.Tech CS",
      creatorAvatarHue: 140,
      locationName: initialCoordinates ? `Campus Spot (${Math.round(targetX)}%, ${Math.round(targetY)}%)${room ? ` · ${room}` : ""}` : `${block.name}${room ? ` · ${room}` : ""}`,
      blockName: initialCoordinates ? "Custom Spot" : (block.name.split(" ")[0] + " " + (block.name.split(" ")[1] || "")),
      roomNumber: room.trim() || undefined,
      reward: reward.trim() || undefined,
      x: targetX,
      y: targetY,
      expiresMinutes: duration,
      totalMinutes: duration,
      description: desc.trim(),
      tags: [kind === "bounty" ? "Gig" : kind === "skill" ? "Skill" : kind === "hackathon" ? "Partner" : "Study", "Live Beacon"],
      activeParticipants: 1,
    };

    onDrop(newBeacon);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-soft text-[#8a5c12] text-sm">
            📍
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-ink">
              Drop Skill or Opportunity Pin
            </h3>
            <p className="text-[11px] font-semibold text-ink-faint">
              Broadcast a live collaboration beacon on the 3D campus map
            </p>
          </div>
        </div>
        <button onClick={onClose} className="cursor-pointer rounded-full p-1.5 text-ink-faint hover:bg-line/60">
          <IconX size={17} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        {/* Kind Picker */}
        <div>
          <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">
            Opportunity Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { k: "bounty", label: "⚡ Micro-Gig / Bounty", sub: "Earn or pay cash" },
              { k: "skill", label: "💡 Peer Skill Share", sub: "1-on-1 teaching / review" },
              { k: "hackathon", label: "🤝 Hackathon Partner", sub: "Find complementary stack" },
              { k: "study", label: "📚 Study Squad Hotspot", sub: "Exam cramming group" },
            ].map((t) => (
              <button
                key={t.k}
                type="button"
                onClick={() => setKind(t.k as OpportunityKind)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  kind === t.k
                    ? "border-pine bg-pine-soft/60 shadow-xs ring-1 ring-pine/30"
                    : "border-line bg-paper/60 hover:bg-cream"
                }`}
              >
                <p className="text-xs font-bold text-ink">{t.label}</p>
                <p className="text-[10px] text-ink-faint mt-0.5">{t.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">
            Title / Callout
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Need someone to debug Arduino OLED or React component review"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink outline-none focus:border-pine"
            required
          />
        </div>

        {/* Tapped GPS Coordinate Pill if dropped by map click */}
        {initialCoordinates && (
          <div className="flex items-center justify-between rounded-xl bg-pine/10 px-3 py-2 border border-pine/20">
            <span className="flex items-center gap-1.5 text-xs font-bold text-pine">
              <span>🎯</span> Exact Map Coordinates: {initialCoordinates.x}%, {initialCoordinates.y}%
            </span>
            <span className="text-[10px] font-semibold text-pine-deep bg-cream px-2 py-0.5 rounded-full border border-pine/30">
              Pinned on Quad
            </span>
          </div>
        )}

        {/* Location Block & Room */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">
              Campus Block
            </label>
            <select
              value={blockIndex}
              onChange={(e) => setBlockIndex(Number(e.target.value))}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-pine"
            >
              {LPU_BLOCK_PRESETS.map((b, i) => (
                <option key={b.name} value={i}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">
              Room / Desk (Optional)
            </label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g., Room 402 or Desk 14"
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-pine"
            />
          </div>
        </div>

        {/* Reward & Expiration */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">
              Reward / Payout
            </label>
            <input
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="e.g. ₹500 cash or Coffee"
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-pine"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">
              Expires After
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-pine"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>1 Hour</option>
              <option value={120}>2 Hours</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">
            Details & What you need
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            placeholder="Describe what you're looking for, exact workbench, or what you can offer..."
            className="w-full rounded-xl border border-line bg-paper p-2.5 text-xs font-semibold text-ink outline-none focus:border-pine resize-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-2xl bg-pine py-3 font-display text-sm font-bold text-cream shadow-md shadow-pine/20 active:scale-[0.98] transition-transform"
        >
          🚀 Drop Beacon onto Campus Map
        </button>
      </form>
    </Modal>
  );
}

export function OpportunityDetailModal({
  beacon,
  onClose,
  onOpenIndoor,
  onConnect,
}: {
  beacon: OpportunityBeacon | null;
  onClose: () => void;
  onOpenIndoor?: (building: string) => void;
  onConnect: (b: OpportunityBeacon) => void;
}) {
  if (!beacon) return null;

  const pct = Math.max(0, Math.min(1, beacon.expiresMinutes / beacon.totalMinutes));
  const isExpiringSoon = pct <= 0.3;

  return (
    <Modal open={Boolean(beacon)} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-3">
          <div className="flex items-center gap-3">
            <Avatar name={beacon.creatorName} hue={beacon.creatorAvatarHue} size={42} />
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    beacon.kind === "bounty"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : beacon.kind === "skill"
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : beacon.kind === "hackathon"
                      ? "bg-purple-100 text-purple-800 border border-purple-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {beacon.kind === "bounty"
                    ? "⚡ Campus Micro-Gig"
                    : beacon.kind === "skill"
                    ? "💡 Peer Skill Beacon"
                    : beacon.kind === "hackathon"
                    ? "🤝 Hackathon Radar"
                    : "📚 Study Hotspot"}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-pine">
                  <IconCheck size={11} /> Verified LPU
                </span>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-ink leading-snug">
                {beacon.title}
              </h3>
              <p className="text-[11px] font-semibold text-ink-faint">
                Posted by {beacon.creatorName} · {beacon.creatorCourse}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-full p-1 text-ink-faint hover:bg-line/60">
            <IconX size={17} />
          </button>
        </div>

        {/* Expiration Timer Ring Banner */}
        <div
          className={`flex items-center justify-between rounded-2xl p-3 border ${
            isExpiringSoon
              ? "border-red-300 bg-red-50 text-red-900"
              : "border-amber-200 bg-amber-50/80 text-[#7a5210]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke={isExpiringSoon ? "#ef4444" : "#f59e0b"}
                  strokeWidth="3"
                  strokeDasharray={88}
                  strokeDashoffset={88 * (1 - pct)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px]">⏱️</span>
            </div>
            <div>
              <p className="text-xs font-bold">
                {beacon.expiresMinutes}m remaining on map
              </p>
              <p className="text-[10px] font-semibold opacity-85">
                {isExpiringSoon ? "⚠️ Expiring soon · hurry to collaborate" : "Active live beacon"}
              </p>
            </div>
          </div>
          {beacon.reward && (
            <span className="rounded-xl bg-paper px-2.5 py-1 text-xs font-black text-pine border border-pine/30 shadow-2xs">
              {beacon.reward}
            </span>
          )}
        </div>

        {/* Location & Room */}
        <div className="rounded-2xl border border-line bg-paper/70 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <IconPin size={14} className="text-red-500" /> {beacon.locationName}
            </span>
            {onOpenIndoor && (
              <button
                type="button"
                onClick={() => onOpenIndoor(beacon.blockName)}
                className="flex items-center gap-1 text-[11px] font-bold text-pine hover:underline cursor-pointer"
              >
                <IconBuilding size={12} /> View Floor Map
              </button>
            )}
          </div>
          {beacon.roomNumber && (
            <p className="text-[11px] font-semibold text-ink-faint pl-5">
              Exact Spot: <strong className="text-ink">{beacon.roomNumber}</strong>
            </p>
          )}
        </div>

        {/* Description & Tags */}
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-ink-soft bg-cream p-3 rounded-2xl border border-line/60">
            {beacon.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {beacon.tags.map((t) => (
              <span key={t} className="rounded-lg bg-paper px-2.5 py-1 text-[10px] font-bold text-ink-soft border border-line/60">
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-[1fr_auto] gap-2 pt-1 border-t border-line">
          <button
            type="button"
            onClick={() => {
              onConnect(beacon);
              onClose();
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-pine py-3 font-display text-xs font-bold text-cream shadow-md shadow-pine/20 active:scale-98 transition-all cursor-pointer"
          >
            <span>💬</span> Connect with {beacon.creatorName.split(" ")[0]}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-2xl border border-line bg-paper px-4 font-display text-xs font-bold text-ink-soft active:scale-98"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
