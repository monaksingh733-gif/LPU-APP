"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Briefcase,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  FileCheck,
  Send,
  Zap,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Layers,
  Search,
  Code2,
  Users2,
  ExternalLink,
  Bot,
  BrainCircuit,
  Compass,
  Building,
  Target
} from "lucide-react";
import { useApp } from "@/app/page";

interface SkillTrack {
  id: string;
  title: string;
  category: "Tech & AI" | "Core Engineering" | "Product & Design" | "Management";
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  credits: string;
  progressPercent: number;
  badge: string;
  skillsGained: string[];
  recommendedInternships: string[];
  syllabus: { title: string; done: boolean }[];
}

const SKILL_TRACKS: SkillTrack[] = [
  {
    id: "st-fullstack",
    title: "Enterprise Full-Stack & Next.js Systems",
    category: "Tech & AI",
    level: "Intermediate",
    estimatedHours: 42,
    credits: "3 Academic Elective Credits",
    progressPercent: 78,
    badge: "🔥 High Industry Demand",
    skillsGained: ["Next.js App Router", "Server Actions", "PostgreSQL / Drizzle", "Tailwind CSS"],
    recommendedInternships: ["Campus Innovation Labs", "FinTech Venture Lab"],
    syllabus: [
      { title: "Client & Server Component Hydration Patterns", done: true },
      { title: "Database schema migrations with Drizzle ORM", done: true },
      { title: "JWT Auth & Session Guards", done: true },
      { title: "Edge caching & streaming server rendered responses", done: false },
    ],
  },
  {
    id: "st-ai-agentic",
    title: "Agentic AI & LLM Systems Engineering",
    category: "Tech & AI",
    level: "Advanced",
    estimatedHours: 50,
    credits: "4 Advanced Specialization Credits",
    progressPercent: 45,
    badge: "⭐ 2026 Top Tier",
    skillsGained: ["LangChain / LlamaIndex", "Vector Search & RAG", "Model Fine-Tuning", "Python FastAPI"],
    recommendedInternships: ["Advanced Credit AI Lab · Block 32", "Autonomous Robotics Unit"],
    syllabus: [
      { title: "Vector Embeddings & Cosine Similarity indexation", done: true },
      { title: "Autonomous Tool Calling & Multi-Agent routing", done: true },
      { title: "Retrieval Augmented Generation evaluation metrics", done: false },
      { title: "Local ONNX and quantized model execution", done: false },
    ],
  },
  {
    id: "st-product-design",
    title: "Mobile UI/UX Systems & Micro-Interactions",
    category: "Product & Design",
    level: "Beginner",
    estimatedHours: 28,
    credits: "2 Department Credits",
    progressPercent: 90,
    badge: "🎨 Portfolio Ready",
    skillsGained: ["Figma Design Systems", "Motion / Framer", "Accessibility WCAG", "Design Hand-off"],
    recommendedInternships: ["Student Tech Hub · Uni-Mall"],
    syllabus: [
      { title: "Fluid Typography & Responsive Mobile Canvas grids", done: true },
      { title: "Micro-animations & tactile haptic visual states", done: true },
      { title: "Design system token architecture", done: true },
      { title: "Figma to React Tailwind CSS hand-off", done: true },
    ],
  },
  {
    id: "st-embedded-iot",
    title: "Autonomous Embedded Systems & ROS",
    category: "Core Engineering",
    level: "Intermediate",
    estimatedHours: 36,
    credits: "3 Department Credits",
    progressPercent: 30,
    badge: "🤖 Hardware Lab",
    skillsGained: ["Embedded C++", "ROS 2", "Raspberry Pi 5", "Sensor Telemetry"],
    recommendedInternships: ["Innovation Lab · Block 34"],
    syllabus: [
      { title: "RTOS basics & interrupt service routines", done: true },
      { title: "CAN & I2C sensor bus communication", done: false },
      { title: "ROS2 node publishers & subscribers", done: false },
      { title: "Motor driver PWM closed-loop PID control", done: false },
    ],
  },
];

interface AcademicMilestone {
  term: string;
  cgpaGoal: string;
  currentCgpa: string;
  attendancePercent: number;
  requiredInternshipHours: number;
  completedInternshipHours: number;
  certificationsTarget: string[];
}

const CURRENT_ACADEMIC: AcademicMilestone = {
  term: "Semester 6 · Final Preparation Phase",
  cgpaGoal: "8.80",
  currentCgpa: "8.64",
  attendancePercent: 88,
  requiredInternshipHours: 120,
  completedInternshipHours: 85,
  certificationsTarget: ["AWS Cloud Practitioner", "PostgreSQL Certified Specialist"],
};

export function CareerSkillBoostHub({
  onToast,
}: {
  onToast?: (msg: string, tone?: "ok" | "warn") => void;
}) {
  const { me } = useApp();
  const [activeTab, setActiveTab] = useState<"tracks" | "resume-ats" | "roadmap" | "mock-interview">("tracks");
  const [selectedTrack, setSelectedTrack] = useState<SkillTrack | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Live Resume ATS State
  const [resumeRole, setResumeRole] = useState("Full Stack Developer Intern");
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [atsScore, setAtsScore] = useState<number>(88);
  const [atsFeedback, setAtsFeedback] = useState([
    { status: "passed", text: "Matched 9/10 core tech stack keywords (Next.js, TypeScript, PostgreSQL)" },
    { status: "passed", text: "Institutional LPU roll-number & student GPA explicitly verified" },
    { status: "warning", text: "Add at least 1 production metrics bullet (e.g., 'Reduced query latency by 35%')" },
  ]);

  // Mock Interview State
  const [mockQuestionIdx, setMockQuestionIdx] = useState(0);
  const [mockAnswer, setMockAnswer] = useState("");
  const [mockEvaluating, setMockEvaluating] = useState(false);
  const [mockFeedback, setMockFeedback] = useState<string | null>(null);

  const mockQuestions = [
    {
      q: "Explain how Next.js Server Components differ from Client Components, and when you would use 'use client'.",
      criteria: "Mentions server-side rendering, bundle size reduction, zero client JS, and interactive event listeners.",
    },
    {
      q: "How would you handle a race condition when two students attempt to book the same study pod simultaneously?",
      criteria: "Discusses database transactions, optimistic locking, row-level locks, or atomic operations.",
    },
    {
      q: "Tell us about a technical challenge you resolved while working on an academic team project.",
      criteria: "STAR method: Situation, Task, Action, Result with clear ownership.",
    },
  ];

  const handleRunAtsScan = () => {
    setAnalyzingAts(true);
    setTimeout(() => {
      setAnalyzingAts(false);
      setAtsScore(94);
      setAtsFeedback([
        { status: "passed", text: "ATS Score boosted! 10/10 core keywords matched for " + resumeRole },
        { status: "passed", text: "Action verbs detected: 'Architected', 'Implemented', 'Optimized'" },
        { status: "passed", text: "Clean single-column mobile & recruiter-friendly format verified" },
      ]);
      onToast?.("ATS Resume Analysis Completed: Score 94/100 🎯", "ok");
    }, 900);
  };

  const handleEvaluateMockAnswer = () => {
    if (!mockAnswer.trim()) {
      onToast?.("Please type your response first!", "warn");
      return;
    }
    setMockEvaluating(true);
    setTimeout(() => {
      setMockEvaluating(false);
      setMockFeedback(
        "Strong breakdown! You accurately addressed architectural tradeoffs and highlighted clean separation of concerns. To boost this from 8.5/10 to 10/10, mention bundle impact and security implications."
      );
      onToast?.("AI Interview Coach Evaluated your Answer! 💡", "ok");
    }, 800);
  };

  const filteredTracks = SKILL_TRACKS.filter((t) => {
    if (categoryFilter === "All") return true;
    return t.category === categoryFilter;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner with Career Readiness Metric */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 backdrop-blur-xs">
                <Sparkles className="h-3 w-3" />
                CAREER ACCELERATOR
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                LPU Placement & Industry Ready
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-black tracking-tight text-white">
              Skill & Career Enhancement Hub
            </h2>
            <p className="mt-0.5 text-xs text-slate-300">
              Boost your academic CGPA, build real project proof-of-work, and unlock top internships.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-2xl bg-white/10 p-2.5 backdrop-blur-md">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase text-indigo-200">Readiness Score</div>
              <div className="text-lg font-black text-emerald-300">92 / 100</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 4 Main Tabs */}
        <div className="mt-4 grid grid-cols-4 gap-1 rounded-2xl bg-black/30 p-1 backdrop-blur-md">
          {[
            { id: "tracks", label: "Skill Tracks", icon: BookOpen },
            { id: "roadmap", label: "Academics", icon: GraduationCap },
            { id: "resume-ats", label: "ATS Optimizer", icon: FileCheck },
            { id: "mock-interview", label: "AI Interview", icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] font-bold transition-all ${
                  active
                    ? "bg-white text-slate-900 shadow-md font-black"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SKILL TRACKS & COURSEWORK */}
      {activeTab === "tracks" && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {["All", "Tech & AI", "Core Engineering", "Product & Design"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 ring-1 ring-slate-200/80 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                className="group relative cursor-pointer rounded-3xl bg-white p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] ring-1 ring-slate-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-700">
                        {track.category}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {track.badge}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {track.title}
                    </h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-black text-slate-800">{track.progressPercent}%</span>
                    <span className="block text-[10px] font-semibold text-slate-400">Complete</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${track.progressPercent}%` }}
                  />
                </div>

                {/* Skills tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {track.skillsGained.map((sk) => (
                    <span
                      key={sk}
                      className="rounded-lg bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-slate-50 pt-2.5 text-xs">
                  <span className="font-bold text-indigo-600 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    {track.credits}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 group-hover:text-slate-700 font-bold">
                    View Modules
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC ROADMAP & CGPA GOALS */}
      {activeTab === "roadmap" && (
        <div className="space-y-4">
          {/* CGPA & Internship Hours Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 ring-1 ring-emerald-100">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-xs font-black uppercase">Current CGPA</span>
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{CURRENT_ACADEMIC.currentCgpa}</div>
              <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">
                Target: {CURRENT_ACADEMIC.cgpaGoal} (On Track)
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 ring-1 ring-amber-100">
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-xs font-black uppercase">Internship Hours</span>
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {CURRENT_ACADEMIC.completedInternshipHours} / {CURRENT_ACADEMIC.requiredInternshipHours}h
              </div>
              <p className="mt-0.5 text-[11px] font-semibold text-amber-700">
                {CURRENT_ACADEMIC.requiredInternshipHours - CURRENT_ACADEMIC.completedInternshipHours}h left for full credit
              </p>
            </div>
          </div>

          {/* Attendance Safety Meter */}
          <div className="rounded-3xl bg-white p-4 shadow-xs ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  LPU Attendance Safety Shield
                </h4>
                <p className="text-[11px] text-slate-500">75% mandatory threshold for end-term exams</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                {CURRENT_ACADEMIC.attendancePercent}% (Safe)
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${CURRENT_ACADEMIC.attendancePercent}%` }}
              />
            </div>
          </div>

          {/* Semester Targets & Milestones */}
          <div className="rounded-3xl bg-white p-4 shadow-xs ring-1 ring-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              Upcoming Industry Certifications
            </h4>
            <div className="space-y-2">
              {CURRENT_ACADEMIC.certificationsTarget.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{cert}</p>
                      <p className="text-[10px] text-slate-500">Subsidized via LPU Industry Alliance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToast?.(`Enrollment portal opened for ${cert}!`, "ok")}
                    className="rounded-xl bg-white px-3 py-1.5 font-bold text-indigo-600 ring-1 ring-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    Claim Voucher
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RESUME ATS SCANNER & KEYWORD BOOST */}
      {activeTab === "resume-ats" && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-xs ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800 uppercase">
                  AI ATS PARSER
                </span>
                <h3 className="mt-1 text-base font-black text-slate-900">
                  Target Role Keyword Alignment
                </h3>
                <p className="text-xs text-slate-500">
                  Analyze your profile against industry job descriptions to pass applicant tracking systems.
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-600">{atsScore}%</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">ATS Score</div>
              </div>
            </div>

            {/* Target Role Selector */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Target Role
              </label>
              <div className="flex gap-2">
                <input
                  value={resumeRole}
                  onChange={(e) => setResumeRole(e.target.value)}
                  placeholder="e.g. Next.js Frontend Developer"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                />
                <button
                  disabled={analyzingAts}
                  onClick={handleRunAtsScan}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{analyzingAts ? "Scanning..." : "Re-Scan ATS"}</span>
                </button>
              </div>
            </div>

            {/* Live Feedback Checklist */}
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
              <h4 className="text-[11px] font-black uppercase text-slate-700">Optimization Feedback</h4>
              {atsFeedback.map((fb, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 rounded-2xl p-2.5 text-xs ${
                    fb.status === "passed"
                      ? "bg-emerald-50 text-emerald-900"
                      : "bg-amber-50 text-amber-900"
                  }`}
                >
                  {fb.status === "passed" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <Zap className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  )}
                  <span className="font-semibold leading-relaxed">{fb.text}</span>
                </div>
              ))}
            </div>

            {/* Export One-Page PDF Resume Button */}
            <button
              onClick={() =>
                onToast?.(
                  "Compiled Verified LPU 1-Page Resume (PDF) ready for placement drives! 📄",
                  "ok"
                )
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            >
              <FileCheck className="h-4 w-4" />
              <span>Download ATS-Optimized 1-Page PDF Resume</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: AI MOCK INTERVIEW SIMULATOR */}
      {activeTab === "mock-interview" && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-xs ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">AI Placement Interviewer</h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Question {mockQuestionIdx + 1} of {mockQuestions.length} · Technical & System Design
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMockQuestionIdx((prev) => (prev + 1) % mockQuestions.length);
                  setMockAnswer("");
                  setMockFeedback(null);
                }}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Next Prompt →
              </button>
            </div>

            {/* Question Card */}
            <div className="mt-4 rounded-2xl bg-purple-50/70 p-4 border border-purple-100 text-slate-900">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
                Interviewer asks:
              </p>
              <p className="text-sm font-black leading-snug">
                "{mockQuestions[mockQuestionIdx].q}"
              </p>
            </div>

            {/* Answer Input */}
            <div className="mt-3">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Your Answer / Code Explanation
              </label>
              <textarea
                rows={4}
                value={mockAnswer}
                onChange={(e) => setMockAnswer(e.target.value)}
                placeholder="Type your structured explanation or approach here..."
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Action Bar */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400">
                Evaluation checks architecture, clarity & edge cases.
              </span>
              <button
                disabled={mockEvaluating}
                onClick={handleEvaluateMockAnswer}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                <BrainCircuit className="h-4 w-4" />
                <span>{mockEvaluating ? "Analyzing..." : "Submit Answer"}</span>
              </button>
            </div>

            {/* Feedback Box */}
            {mockFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl bg-slate-900 p-4 text-white"
              >
                <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-black uppercase">Coach Evaluation & Rating</span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-200">
                  {mockFeedback}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Track Details Modal */}
      {selectedTrack && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="w-full max-w-sm sm:max-w-md rounded-t-[2.25rem] sm:rounded-[2.25rem] bg-white p-5 sm:p-6 shadow-2xl ring-1 ring-slate-100 max-h-[88dvh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {selectedTrack.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedTrack.title}</h3>
                <p className="text-xs font-semibold text-slate-500">{selectedTrack.credits}</p>
              </div>
              <button
                onClick={() => setSelectedTrack(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Syllabus Checklist */}
            <div className="mt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Module Roadmap & Proof-of-Work
              </h4>
              <div className="space-y-2">
                {selectedTrack.syllabus.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 rounded-xl p-2.5 text-xs ${
                      item.done ? "bg-emerald-50/70 text-emerald-900" : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        item.done ? "text-emerald-600" : "text-slate-300"
                      }`}
                    />
                    <span className="font-semibold">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Internship Pipelines */}
            <div className="mt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Direct Internship Hiring Pipelines
              </h4>
              <div className="space-y-1.5">
                {selectedTrack.recommendedInternships.map((rec) => (
                  <div
                    key={rec}
                    className="flex items-center justify-between rounded-xl bg-indigo-50/60 p-2.5 text-xs text-indigo-950 font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-indigo-600" />
                      <span>{rec}</span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase">Fast-Track</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onToast?.(`Enrolled in "${selectedTrack.title}"! Coursework synced with university portal.`, "ok");
                setSelectedTrack(null);
              }}
              className="mt-5 w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-sm"
            >
              Sync Coursework & Start Next Module
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
