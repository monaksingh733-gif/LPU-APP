"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/client";
import type { MeData } from "@/lib/types";
import { Avatar, Chip, Spinner, Toggle } from "@/components/ui";
import {
  IconChevronLeft,
  IconId,
  IconLock,
  IconMail,
  IconPhone,
  IconQuad,
  IconShield,
  IconSparkles,
} from "@/components/icons";
import { Cyber3DEyeWidget } from "@/components/Splash3D";

type Step =
  | "intro"
  | "login"
  | "loginOtp"
  | "mobile"
  | "mobileOtp"
  | "email"
  | "emailOtp"
  | "profile";

const COURSES = [
  "B.Tech Computer Science",
  "BCA (Bachelor of Computer Applications)",
  "B.Tech Robotics & Automation",
  "B.Tech CSE",
  "B.Tech ECE",
  "B.Tech Mechanical",
  "B.Des",
  "B.Arch",
  "BBA",
  "B.Com",
  "B.Sc Physics",
  "B.Sc Psychology",
  "MA English",
  "Other",
];
const INTERESTS = ["Study", "Gym", "Hangout", "Gaming", "Music", "Movies", "Coffee"];
const HUES = [18, 44, 96, 142, 174, 210, 262, 300, 330];

const stepIndex: Record<Step, number> = {
  intro: 0,
  login: 1,
  loginOtp: 1,
  mobile: 1,
  mobileOtp: 1,
  email: 2,
  emailOtp: 2,
  profile: 3,
};

interface DemoUserItem {
  id: string;
  fullName: string;
  course: string;
  academicYear: number;
  avatarHue: number;
  lookingFor?: string;
}

export function Onboarding({
  onDone,
  toast,
  onSwitchToLogin,
}: {
  onDone: () => Promise<MeData | null>;
  toast: (m: string, tone?: "ok" | "warn" | "err") => void;
  onSwitchToLogin?: () => void;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login flow state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");

  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [demoUsers, setDemoUsers] = useState<DemoUserItem[]>([]);
  const otpRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState(0);
  const [gender, setGender] = useState<"" | "male" | "female" | "non_binary" | "prefer_not_to_say">("");
  const [interests, setInterests] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState("");
  const [hue, setHue] = useState(HUES[4]);
  const [visible, setVisible] = useState(true);

  // Load demo accounts for 1-tap test login
  useEffect(() => {
    api<{ demoUsers: DemoUserItem[] }>("/api/auth")
      .then((res) => setDemoUsers(res.demoUsers ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (step === "mobileOtp" || step === "emailOtp" || step === "loginOtp") {
      setOtp("");
      setTimeout(() => otpRef.current?.focus(), 60);
    }
  }, [step]);

  const quickDemoLogin = async (userId: string, name: string) => {
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth", {
        method: "POST",
        body: JSON.stringify({ action: "demo-login", userId }),
      });
      toast(`Signed in as ${name} 🎓`, "ok");
      await onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Quick demo sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = async (identifier: string, kind: "mobile" | "email", next: Step) => {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ demoCode?: string; throttled?: boolean }>("/api/auth", {
        method: "POST",
        body: JSON.stringify({ action: "request-otp", identifier, kind }),
      });
      setDemoCode(res.demoCode ?? null);
      setStep(next);
      if (res.throttled) toast("Same code re-sent — wait 30s between requests.", "warn");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not send code.");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (next: Step) => {
    setBusy(true);
    setError(null);
    const identifier = step === "mobileOtp" ? mobile : email;
    try {
      const res = await api<{ returning?: boolean }>("/api/auth", {
        method: "POST",
        body: JSON.stringify({ action: "verify-otp", identifier, otp }),
      });
      if (res.returning) {
        toast("Welcome back — signed you in.", "ok");
        await onDone();
        return;
      }
      setStep(next);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  const autoFillAndVerify = (next: Step) => {
    if (demoCode) {
      setOtp(demoCode);
      setTimeout(async () => {
        setBusy(true);
        setError(null);
        const identifier = step === "mobileOtp" ? mobile : email;
        try {
          const res = await api<{ returning?: boolean }>("/api/auth", {
            method: "POST",
            body: JSON.stringify({ action: "verify-otp", identifier, otp: demoCode }),
          });
          if (res.returning) {
            toast("Welcome back — signed you in.", "ok");
            await onDone();
            return;
          }
          setStep(next);
        } catch (e) {
          setError(e instanceof ApiError ? e.message : "Verification failed.");
        } finally {
          setBusy(false);
        }
      }, 50);
    }
  };

  const complete = async () => {
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth", {
        method: "POST",
        body: JSON.stringify({
          action: "complete-profile",
          mobile,
          email,
          fullName,
          gender,
          course,
          academicYear: year,
          interests,
          lookingFor,
          avatarHue: hue,
          visible,
        }),
      });
      toast("You're verified. Welcome to Quad 🎓", "ok");
      await onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not finish setup.");
    } finally {
      setBusy(false);
    }
  };

  const requestLoginOtp = async () => {
    if (!loginIdentifier.trim()) {
      setError("Please enter your registered email or mobile number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ demoCode?: string; throttled?: boolean }>("/api/auth", {
        method: "POST",
        body: JSON.stringify({
          action: "request-otp",
          identifier: loginIdentifier.trim(),
          kind: loginMethod,
        }),
      });
      setDemoCode(res.demoCode ?? null);
      setStep("loginOtp");
      toast("Verification code dispatched!", "ok");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not send login code.");
    } finally {
      setBusy(false);
    }
  };

  const verifyLoginOtp = async (codeToUse?: string) => {
    const code = codeToUse || otp;
    if (!code.trim() || code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ returning?: boolean }>("/api/auth", {
        method: "POST",
        body: JSON.stringify({
          action: "verify-otp",
          identifier: loginIdentifier.trim(),
          otp: code,
        }),
      });
      if (res.returning) {
        toast("Signed in successfully! Welcome back 🎓", "ok");
        await onDone();
      } else {
        toast("Code verified! Complete your student profile.", "ok");
        if (loginMethod === "email") {
          setEmail(loginIdentifier);
          setStep("mobile");
        } else {
          setMobile(loginIdentifier);
          setStep("email");
        }
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Incorrect code. Check and try again.");
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    setError(null);
    if (step === "loginOtp") setStep("login");
    else if (step === "login") setStep("intro");
    else if (step === "mobileOtp") setStep("mobile");
    else if (step === "emailOtp") setStep("email");
    else if (step === "email") setStep("mobile");
    else if (step === "mobile") setStep("intro");
  };

  const progress = stepIndex[step];

  return (
    <div className="shell-bg flex min-h-dvh items-center justify-center md:py-8">
      <div className="phone-frame relative flex h-dvh w-full flex-col overflow-hidden bg-paper md:h-[min(92dvh,900px)] md:max-w-105 md:rounded-[2rem]">
        {/* header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          {step !== "intro" && step !== "profile" && (
            <button
              onClick={back}
              className="cursor-pointer rounded-full p-1.5 text-ink-soft transition-transform active:scale-90 hover:bg-line/60"
            >
              <IconChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-pine-ink text-cream shadow-md overflow-hidden border border-pine/40">
              <Cyber3DEyeWidget size={48} className="absolute inset-0" />
            </div>
            <div>
              <p className="font-display text-sm leading-none font-bold text-ink">Quad 3D</p>
              <p className="mt-0.5 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
                Campus Student Verification
              </p>
            </div>
          </div>
          {step === "intro" ? (
            <button
              onClick={() => (onSwitchToLogin ? onSwitchToLogin() : setStep("login"))}
              className="ml-auto rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-bold text-pine hover:bg-paper active:scale-95 shadow-2xs"
            >
              Log In →
            </button>
          ) : (
            <div className="ml-auto flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= progress ? "w-6 bg-pine" : "w-2.5 bg-line"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8">
          {step === "intro" && (
            <div className="animate-fade-up flex flex-col pt-2">
              <div>
                <h1 className="font-display text-[26px] leading-tight font-bold text-ink">
                  Your campus,
                  <br />
                  only for <span className="text-pine">verified students</span>.
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                  Connect with verified classmates, discover cultural & coding events,
                  map campus food, and message safely with automatic 48-hour timers.
                </p>
              </div>

              {/* Aesthetic Campus Events Showcase Carousel / Grid */}
              <div className="mt-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-ink-faint uppercase">
                    Happening on campus this week
                  </span>
                  <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-amber" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="group relative overflow-hidden rounded-2xl border border-line bg-pine-ink shadow-xs">
                    <img
                      src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80"
                      alt="Cultural Fest"
                      className="h-28 w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <span className="rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-black text-white uppercase shadow-xs">
                        🎭 Cultural
                      </span>
                    </div>
                    <div className="absolute right-2 bottom-2 left-2">
                      <p className="font-display text-[11px] font-bold text-white line-clamp-1 leading-tight">
                        Global Cultural Fest
                      </p>
                      <p className="text-[9px] font-semibold text-white/70">40+ Countries · Dance</p>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-2xl border border-line bg-pine-ink shadow-xs">
                    <img
                      src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80"
                      alt="Hackathon"
                      className="h-28 w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <span className="rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-black text-white uppercase shadow-xs">
                        ⚡ Coding
                      </span>
                    </div>
                    <div className="absolute right-2 bottom-2 left-2">
                      <p className="font-display text-[11px] font-bold text-white line-clamp-1 leading-tight">
                        HackNight 2026
                      </p>
                      <p className="text-[9px] font-semibold text-white/70">24hr Build · ₹2L Bounty</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick 1-Tap Demo Switcher */}
              <div className="mt-4 rounded-2xl border border-pine/30 bg-pine-soft p-3.5 shadow-xs">
                <div className="flex items-center gap-2 text-pine">
                  <IconSparkles size={16} />
                  <p className="font-display text-xs font-bold uppercase tracking-wider">
                    Instant Demo Access
                  </p>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                  Tap any student profile to enter immediately with verified chats:
                </p>

                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {demoUsers.slice(0, 4).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => quickDemoLogin(d.id, d.fullName)}
                      disabled={busy}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-cream p-2 text-left shadow-2xs transition-all active:scale-95 hover:border-pine"
                    >
                      <Avatar name={d.fullName} hue={d.avatarHue} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-ink">{d.fullName.split(" ")[0]}</p>
                        <p className="truncate text-[10px] text-ink-faint">{d.course}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Features */}
              <div className="mt-4 space-y-2">
                {[
                  {
                    icon: <IconShield size={17} />,
                    t: "48-Hour Safe Chat Window",
                    d: "New buddy requests stay text-only until accepted.",
                  },
                  {
                    icon: <IconLock size={17} />,
                    t: "Private by Default",
                    d: "Your mobile number & registration ID are strictly hidden.",
                  },
                  {
                    icon: <IconMail size={17} />,
                    t: "Institutional Email Verification",
                    d: "Restricted strictly to enrolled university student accounts.",
                  },
                ].map((f) => (
                  <div
                    key={f.t}
                    className="flex items-start gap-3 rounded-xl border border-line bg-cream px-3.5 py-2.5"
                  >
                    <span className="mt-0.5 flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-pine-soft text-pine">
                      {f.icon}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-ink">{f.t}</p>
                      <p className="text-[11px] text-ink-soft">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-2 space-y-2.5">
                <button
                  onClick={() => (onSwitchToLogin ? onSwitchToLogin() : setStep("login"))}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-pine py-3.5 font-display text-sm font-bold text-cream shadow-lg shadow-pine/25 transition-transform active:scale-[0.98]"
                >
                  Log In to Existing Account
                </button>
                <button
                  onClick={() => setStep("mobile")}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line bg-cream hover:bg-paper py-3 font-display text-xs font-bold text-ink shadow-xs transition-transform active:scale-[0.98]"
                >
                  Verify New Student Registration
                </button>
              </div>
            </div>
          )}

          {step === "login" && (
            <div className="animate-fade-up mt-4">
              <h2 className="font-display text-xl font-bold text-ink">
                Welcome back to Quad
              </h2>
              <p className="mt-1.5 text-xs text-ink-soft">
                Enter your registered university email or mobile number to receive a secure login verification code.
              </p>

              {/* Login Method Toggle */}
              <div className="mt-4 flex rounded-xl border border-line bg-cream p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("email");
                    setLoginIdentifier("");
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    loginMethod === "email" ? "bg-pine text-cream shadow-xs" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  University Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("mobile");
                    setLoginIdentifier("");
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    loginMethod === "mobile" ? "bg-pine text-cream shadow-xs" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Mobile Number
                </button>
              </div>

              <label className="mt-4 flex items-center gap-2.5 rounded-2xl border border-line bg-cream px-4 py-3.5 shadow-2xs focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/10">
                <span className="text-pine">
                  {loginMethod === "email" ? <IconMail size={18} /> : <IconPhone size={18} />}
                </span>
                <input
                  type={loginMethod === "email" ? "email" : "tel"}
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    setError(null);
                  }}
                  placeholder={
                    loginMethod === "email"
                      ? "yourname@university.edu"
                      : "98765 43210"
                  }
                  className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink-faint"
                />
              </label>

              {/* Quick sample account hint */}
              <div className="mt-2.5 flex items-center justify-between text-xs text-ink-faint">
                <span>Sample registered account:</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("email");
                    setLoginIdentifier("anya.sharma@lpu.ac.in");
                  }}
                  className="text-pine font-bold hover:underline"
                >
                  Use anya.sharma@lpu.ac.in
                </button>
              </div>

              {error && (
                <div className="animate-pop mt-3 rounded-xl border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-xs font-semibold text-clay">
                  {error}
                </div>
              )}

              <button
                onClick={requestLoginOtp}
                disabled={busy || !loginIdentifier.trim()}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-pine py-3.5 font-display text-sm font-bold text-cream shadow-md shadow-pine/20 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? <Spinner size={18} /> : "Send Login Verification Code"}
              </button>

              {/* 1-Tap Instant Sign-In Deck */}
              <div className="mt-6 pt-4 border-t border-line">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] font-bold text-ink-faint uppercase tracking-wider">
                    Or 1-Tap Instant Sign-In:
                  </p>
                  <span className="text-[10px] text-pine font-semibold">Active Profiles</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.slice(0, 4).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => quickDemoLogin(d.id, d.fullName)}
                      className="flex items-center gap-2 p-2 rounded-xl border border-line bg-cream hover:border-pine text-left transition active:scale-95 shadow-2xs"
                    >
                      <Avatar name={d.fullName} hue={d.avatarHue} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink truncate">{d.fullName.split(" ")[0]}</p>
                        <p className="text-[10px] text-ink-faint truncate">{d.course}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "loginOtp" && (
            <div className="animate-fade-up mt-4">
              <h2 className="font-display text-xl font-bold text-ink">Enter your login code</h2>
              <p className="mt-1.5 text-xs text-ink-soft">
                Sent to <strong className="text-ink">{loginIdentifier}</strong>.{" "}
                <button
                  className="cursor-pointer font-bold text-pine hover:underline"
                  onClick={requestLoginOtp}
                >
                  Resend code
                </button>
              </p>

              <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-amber/40 bg-amber-soft p-3.5 text-xs leading-relaxed text-[#7a5210] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold">⚡ Verification Code</span>
                  {demoCode && (
                    <button
                      onClick={() => {
                        setOtp(demoCode);
                        verifyLoginOtp(demoCode);
                      }}
                      className="cursor-pointer rounded-lg bg-amber px-2.5 py-1 text-[11px] font-bold text-pine-ink transition-transform active:scale-95 shadow-xs"
                    >
                      Auto-Fill & Sign In
                    </button>
                  )}
                </div>
                <p className="text-[11px]">
                  Your 6-digit code is:{" "}
                  <strong className="font-display text-sm font-black tracking-widest text-[#4a3207]">
                    {demoCode ?? "······"}
                  </strong>
                </p>
              </div>

              <input
                ref={otpRef}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                className="mt-5 w-full rounded-2xl border border-line bg-cream px-4 py-3.5 text-center font-display text-2xl font-bold tracking-[0.5em] text-ink shadow-2xs outline-none focus:border-pine focus:ring-2 focus:ring-pine/10"
                placeholder="——————"
              />

              {error && (
                <div className="animate-pop mt-3 rounded-xl border border-clay/30 bg-clay-soft px-3 py-2 text-xs font-semibold text-clay">
                  {error}
                </div>
              )}

              <button
                disabled={busy || otp.length !== 6}
                onClick={() => verifyLoginOtp()}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-pine py-3.5 font-display text-sm font-bold text-cream shadow-md shadow-pine/20 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {busy && <Spinner size={16} />} Verify & Sign In
              </button>
            </div>
          )}

          {(step === "mobile" || step === "email") && (
            <div className="animate-fade-up mt-4">
              <h2 className="font-display text-xl font-bold text-ink">
                {step === "mobile" ? "What's your mobile number?" : "Now your university email"}
              </h2>
              <p className="mt-1.5 text-xs text-ink-soft">
                {step === "mobile"
                  ? "We'll send a 6-digit OTP code. Your mobile number remains 100% private."
                  : "Institutional proof that you're enrolled. Must end in .edu or .ac.in."}
              </p>

              <label className="mt-5 flex items-center gap-2.5 rounded-2xl border border-line bg-cream px-4 py-3.5 shadow-2xs focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/10">
                <span className="text-pine">
                  {step === "mobile" ? <IconPhone size={18} /> : <IconMail size={18} />}
                </span>
                <input
                  value={step === "mobile" ? mobile : email}
                  onChange={(e) =>
                    step === "mobile" ? setMobile(e.target.value) : setEmail(e.target.value)
                  }
                  inputMode={step === "mobile" ? "tel" : "email"}
                  placeholder={step === "mobile" ? "+91 98765 43210" : "student@university.ac.in"}
                  className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink-faint"
                />
              </label>

              {error && (
                <div className="animate-pop mt-3 rounded-xl border border-clay/30 bg-clay-soft px-3 py-2 text-xs font-semibold text-clay">
                  {error}
                </div>
              )}

              <button
                disabled={busy || (step === "mobile" ? !mobile.trim() : !email.trim())}
                onClick={() =>
                  step === "mobile"
                    ? requestOtp(mobile.trim(), "mobile", "mobileOtp")
                    : requestOtp(email.trim(), "email", "emailOtp")
                }
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-pine py-3.5 font-display text-sm font-bold text-cream shadow-md shadow-pine/20 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {busy && <Spinner size={16} />} Send verification code
              </button>
            </div>
          )}

          {(step === "mobileOtp" || step === "emailOtp") && (
            <div className="animate-fade-up mt-4">
              <h2 className="font-display text-xl font-bold text-ink">Enter the 6-digit code</h2>
              <p className="mt-1.5 text-xs text-ink-soft">
                Sent to <strong className="text-ink">{step === "mobileOtp" ? mobile : email}</strong>.{" "}
                <button
                  className="cursor-pointer font-bold text-pine hover:underline"
                  onClick={() =>
                    requestOtp(
                      step === "mobileOtp" ? mobile.trim() : email.trim(),
                      step === "mobileOtp" ? "mobile" : "email",
                      step
                    )
                  }
                >
                  Resend
                </button>
              </p>

              <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-amber/40 bg-amber-soft p-3.5 text-xs leading-relaxed text-[#7a5210] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold">⚡ Demo OTP Simulation</span>
                  <button
                    onClick={() => autoFillAndVerify(step === "mobileOtp" ? "email" : "profile")}
                    className="cursor-pointer rounded-lg bg-amber px-2.5 py-1 text-[11px] font-bold text-pine-ink transition-transform active:scale-95 shadow-xs"
                  >
                    Auto-Fill & Verify
                  </button>
                </div>
                <p className="text-[11px]">
                  Your verification code is:{" "}
                  <strong className="font-display text-sm font-black tracking-widest text-[#4a3207]">
                    {demoCode ?? "······"}
                  </strong>
                </p>
              </div>

              <input
                ref={otpRef}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                className="mt-5 w-full rounded-2xl border border-line bg-cream px-4 py-3.5 text-center font-display text-2xl font-bold tracking-[0.5em] text-ink shadow-2xs outline-none focus:border-pine focus:ring-2 focus:ring-pine/10"
                placeholder="——————"
              />

              {error && (
                <div className="animate-pop mt-3 rounded-xl border border-clay/30 bg-clay-soft px-3 py-2 text-xs font-semibold text-clay">
                  {error}
                </div>
              )}

              <button
                disabled={busy || otp.length !== 6}
                onClick={() => verifyOtp(step === "mobileOtp" ? "email" : "profile")}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-pine py-3.5 font-display text-sm font-bold text-cream shadow-md shadow-pine/20 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {busy && <Spinner size={16} />} Verify code
              </button>
            </div>
          )}

          {step === "profile" && (
            <div className="animate-fade-up mt-2">
              <h2 className="font-display text-xl font-bold text-ink">Set up your profile</h2>
              <p className="mt-1 text-xs text-ink-soft">
                Choose how classmates discover you on the quad.
              </p>

              <p className="mt-4 mb-2 text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                Avatar colour
              </p>
              <div className="flex items-center gap-3">
                <Avatar name={fullName || "You"} hue={hue} size={56} />
                <div className="flex flex-wrap gap-2">
                  {HUES.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHue(h)}
                      className={`h-8 w-8 cursor-pointer rounded-full transition-transform active:scale-90 ${
                        hue === h ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : ""
                      }`}
                      style={{
                        background: `linear-gradient(135deg, hsl(${h} 45% 42%), hsl(${(h + 28) % 360} 50% 30%))`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                  Full name <IconLock size={11} className="text-ink-faint" />
                  <em className="font-medium normal-case not-italic">locked to student ID</em>
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As printed on your student ID"
                  className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-sm font-semibold text-ink outline-none focus:border-pine"
                />
              </label>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                    Course
                  </span>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-line bg-cream px-3 py-3 text-sm font-semibold text-ink outline-none focus:border-pine"
                  >
                    <option value="">Select course…</option>
                    {COURSES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                    Academic year
                  </span>
                  <select
                    value={year || ""}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full cursor-pointer rounded-xl border border-line bg-cream px-3 py-3 text-sm font-semibold text-ink outline-none focus:border-pine"
                  >
                    <option value="">Select year…</option>
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>
                        {y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : "4th"} year
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4">
                <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                  Gender
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["male", "Male"],
                      ["female", "Female"],
                      ["non_binary", "Non-binary"],
                      ["prefer_not_to_say", "Prefer not to say"],
                    ] as const
                  ).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setGender(v)}
                      className={`cursor-pointer rounded-xl border px-2 py-2.5 text-xs font-bold transition-all ${
                        gender === v
                          ? "border-pine bg-pine text-cream shadow-sm"
                          : "border-line bg-cream text-ink-soft hover:text-ink"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-clay">
                  <IconLock size={11} /> Cannot be changed later without campus admin review.
                </p>
              </div>

              <div className="mt-4">
                <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                  Interests
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map((i) => (
                    <Chip
                      key={i}
                      active={interests.includes(i)}
                      onClick={() =>
                        setInterests((cur) =>
                          cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].slice(0, 6)
                        )
                      }
                    >
                      {i}
                    </Chip>
                  ))}
                </div>
              </div>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-ink-faint uppercase">
                  Looking for <em className="font-medium normal-case not-italic">(shown on your card)</em>
                </span>
                <input
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value.slice(0, 60))}
                  placeholder="e.g. Gym partner for morning sessions"
                  className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-sm font-semibold text-ink outline-none focus:border-pine"
                />
              </label>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-cream px-3.5 py-3">
                <div>
                  <p className="text-xs font-bold text-ink">Visible in Buddy Finder</p>
                  <p className="text-[11px] text-ink-faint">Off hides your card from discovery.</p>
                </div>
                <Toggle checked={visible} onChange={setVisible} />
              </div>

              {error && (
                <div className="animate-pop mt-3 rounded-xl border border-clay/30 bg-clay-soft px-3 py-2 text-xs font-semibold text-clay">
                  {error}
                </div>
              )}

              <button
                disabled={busy || !fullName.trim() || !course || !year || !gender}
                onClick={complete}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-pine py-3.5 font-display text-sm font-bold text-cream shadow-lg shadow-pine/25 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {busy && <Spinner size={16} />} Complete Profile
              </button>
              <p className="mt-3 mb-2 flex items-center justify-center gap-1.5 text-center text-[10px] text-ink-faint">
                <IconId size={12} /> University ID & mobile stay confidential.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
