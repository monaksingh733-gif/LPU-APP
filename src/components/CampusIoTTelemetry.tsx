"use client";

import { useState } from "react";
import {
  IconCheck,
  IconFlame,
  IconSparkles,
} from "@/components/icons";

interface LaundryMachine {
  id: string;
  type: "washer" | "dryer";
  name: string;
  dorm: string;
  status: "available" | "in_use";
  minutesLeft?: number;
}

const INITIAL_LAUNDRY: LaundryMachine[] = [
  { id: "w-1", type: "washer", name: "Washer #01 (Front Load)", dorm: "Hostel A", status: "available" },
  { id: "w-2", type: "washer", name: "Washer #02 (Heavy Cycle)", dorm: "Hostel A", status: "in_use", minutesLeft: 14 },
  { id: "w-3", type: "washer", name: "Washer #03 (Eco Wash)", dorm: "Hostel A", status: "available" },
  { id: "w-4", type: "washer", name: "Washer #04 (Speed 30)", dorm: "Hostel B", status: "in_use", minutesLeft: 8 },
  { id: "d-1", type: "dryer", name: "Dryer #01 (High Heat)", dorm: "Hostel A", status: "available" },
  { id: "d-2", type: "dryer", name: "Dryer #02 (Tumble Dry)", dorm: "Hostel A", status: "in_use", minutesLeft: 22 },
  { id: "d-3", type: "dryer", name: "Dryer #03 (High Capacity)", dorm: "Hostel B", status: "available" },
];

interface NoiseZone {
  id: string;
  zone: string;
  category: "silent" | "chatter" | "energy";
  db: number;
  description: string;
  recommendedFor: string;
}

const NOISE_ZONES: NoiseZone[] = [
  {
    id: "nz-1",
    zone: "Central Library Floor 2 (Reading Room 3)",
    category: "silent",
    db: 18,
    description: "Whisper-enforced · Deep solo study",
    recommendedFor: "Exam cramming & Thesis writing",
  },
  {
    id: "nz-2",
    zone: "Block 34 4th Floor Studio Nook",
    category: "silent",
    db: 22,
    description: "Low footfall · High natural light",
    recommendedFor: "UI/UX drafting & coding sprints",
  },
  {
    id: "nz-3",
    zone: "Green Bowl Cafe & Sports Terrace",
    category: "chatter",
    db: 48,
    description: "Ambient lofi tunes & low murmur",
    recommendedFor: "Casual study & group brainstorming",
  },
  {
    id: "nz-4",
    zone: "Central Quad Lawn & Water Fountain",
    category: "chatter",
    db: 54,
    description: "Outdoor breeze & passing conversations",
    recommendedFor: "Chai chats & reading novels",
  },
  {
    id: "nz-5",
    zone: "Main Canteen Dining Pavilion",
    category: "energy",
    db: 78,
    description: "Peak rush · Lively chatter & order calls",
    recommendedFor: "Social lunches & team catchups",
  },
  {
    id: "nz-6",
    zone: "Sports Complex Indoor Courts",
    category: "energy",
    db: 84,
    description: "High reverberation · Sneaker squeaks & whistles",
    recommendedFor: "Badminton & basketball matches",
  },
];

export function CampusIoTTelemetry({
  onToast,
}: {
  onToast?: (msg: string, tone?: "ok" | "warn") => void;
}) {
  const [activeDormTab, setActiveDormTab] = useState<"Hostel A" | "Hostel B">("Hostel A");
  const [machines, setMachines] = useState<LaundryMachine[]>(INITIAL_LAUNDRY);
  const [notifiedMachines, setNotifiedMachines] = useState<string[]>([]);

  const filteredMachines = machines.filter((m) => m.dorm === activeDormTab);
  const freeWashers = filteredMachines.filter((m) => m.type === "washer" && m.status === "available").length;
  const freeDryers = filteredMachines.filter((m) => m.type === "dryer" && m.status === "available").length;

  const toggleNotify = (id: string, name: string) => {
    if (notifiedMachines.includes(id)) {
      setNotifiedMachines((prev) => prev.filter((x) => x !== id));
      onToast?.(`Removed alert for ${name}`, "warn");
    } else {
      setNotifiedMachines((prev) => [...prev, id]);
      onToast?.(`🔔 We'll ping your phone when ${name} cycle finishes!`, "ok");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. HOSTEL LAUNDRY TELEMETRY */}
      <div className="rounded-2xl border border-line bg-cream p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                🧺
              </span>
              <h3 className="font-display text-sm font-bold text-ink">
                Hostel Laundry Room Telemetry
              </h3>
            </div>
            <p className="text-[11px] text-ink-faint mt-0.5">
              Live IoT cycle sensors on washers & dryers
            </p>
          </div>

          {/* Dorm selector */}
          <div className="flex rounded-xl bg-paper p-1 border border-line/60">
            {(["Hostel A", "Hostel B"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setActiveDormTab(d)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  activeDormTab === d
                    ? "bg-pine text-cream shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Availability Stat Bar */}
        <div className="grid grid-cols-2 gap-2 bg-paper/80 p-2.5 rounded-xl border border-line/60 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-ink-faint">Available Washers:</span>
            <strong className="text-pine font-bold text-sm">{freeWashers} open</strong>
          </div>
          <div className="flex items-center justify-between border-l border-line/60 pl-2">
            <span className="text-ink-faint">Available Dryers:</span>
            <strong className="text-pine font-bold text-sm">{freeDryers} open</strong>
          </div>
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-2 gap-2">
          {filteredMachines.map((m) => {
            const isAvail = m.status === "available";
            const isNotified = notifiedMachines.includes(m.id);

            return (
              <div
                key={m.id}
                className={`rounded-xl border p-2.5 text-left space-y-1.5 transition-all ${
                  isAvail
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-line bg-paper"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">
                    {m.type === "washer" ? "🫧" : "💨"}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-black uppercase ${
                      isAvail ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isAvail ? "Free" : `${m.minutesLeft}m left`}
                  </span>
                </div>

                <p className="font-display text-[11px] font-bold text-ink truncate">
                  {m.name}
                </p>

                {!isAvail && (
                  <button
                    onClick={() => toggleNotify(m.id, m.name)}
                    className={`w-full cursor-pointer rounded-lg py-1 text-[10px] font-bold border transition-all ${
                      isNotified
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-cream text-ink-soft border-line hover:bg-paper"
                    }`}
                  >
                    {isNotified ? "Alert Set ✓" : "Ping when free"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LIBRARY & READING HALLS VACANCY */}
      <div className="rounded-2xl border border-line bg-cream p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
              📚
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-ink">
                Central Library & 24/7 Hall Sensors
              </h3>
              <p className="text-[11px] text-ink-faint">
                Live chair occupancy counters
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Realtime IoT
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { name: "Floor 2 · Silent Research Nook", total: 50, taken: 16, status: "High Availability (34 Desks Open)" },
            { name: "Floor 1 · High-Speed Digital Lab", total: 60, taken: 42, status: "Moderate (18 Workstations Open)" },
            { name: "Ground Floor · General Reading Hall", total: 80, taken: 68, status: "Busy (12 Desks Open)" },
            { name: "24/7 Air-Conditioned Night Study Hall", total: 40, taken: 26, status: "14 AC Benches Free" },
          ].map((lib, i) => {
            const pct = Math.round((lib.taken / lib.total) * 100);
            return (
              <div key={i} className="rounded-xl bg-paper p-2.5 border border-line/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-ink">{lib.name}</span>
                  <span className="font-mono text-[11px] font-bold text-pine">{pct}% Full</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      pct > 75 ? "bg-amber-500" : pct > 50 ? "bg-blue-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] font-medium text-ink-faint">{lib.status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ACOUSTIC NOISE LEVEL HEATMAP */}
      <div className="rounded-2xl border border-line bg-cream p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
              🔊
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-ink">
                Acoustic & Noise Level Mapping
              </h3>
              <p className="text-[11px] text-ink-faint">
                Sensor decibel ratings to pick your ideal work atmosphere
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {NOISE_ZONES.map((nz) => (
            <div
              key={nz.id}
              className="flex items-center justify-between gap-2.5 rounded-xl bg-paper p-2.5 border border-line/60 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-md px-1.5 py-0.2 text-[9px] font-black uppercase ${
                      nz.category === "silent"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : nz.category === "chatter"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {nz.category === "silent" ? "Silent Focus" : nz.category === "chatter" ? "Casual Chatter" : "High Energy"}
                  </span>
                  <span className="font-display text-xs font-bold text-ink truncate">{nz.zone}</span>
                </div>
                <p className="text-[10.5px] text-ink-soft mt-0.5">{nz.recommendedFor}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-black text-pine">{nz.db} dB</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
