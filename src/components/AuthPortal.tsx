"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff, Sparkles } from "lucide-react";

interface AuthPortalProps {
  onSuccess?: () => void;
  onLoginSuccess?: () => void;
  redirectUrl?: string;
  isModal?: boolean;
  toast?: (message: string, tone?: "ok" | "warn" | "err") => void;
}

export default function AuthPortal({
  onSuccess,
  onLoginSuccess,
  redirectUrl = "/",
  isModal = false,
  toast,
}: AuthPortalProps = {}) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });

  const notify = (msg: string, tone: "ok" | "warn" | "err" = "ok") => {
    if (toast) toast(msg, tone);
  };

  const handleQuickFill = (email: string, pass: string) => {
    setFormData((prev) => ({ ...prev, email, password: pass }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setError(data.error || data.message || "Authentication failed. Please verify credentials.");
      } else {
        const welcomeName = data.user?.firstName || data.user?.fullName?.split(" ")[0] || "Student";
        const msg = isLogin
          ? `Welcome back, ${welcomeName}! 🎓`
          : `Account created successfully! Welcome to Quad, ${welcomeName}! 🎓`;
        setSuccessMsg(msg);
        notify(msg, "ok");

        // Allow toast to register before state transition
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            window.location.href = redirectUrl;
          }
        }, 350);
      }
    } catch {
      setError("Network connectivity error. Please check connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formBody = (
    <div>
      {!isModal && (
        <motion.div layout className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {isLogin ? "Enter your credentials to access the portal" : "Join the verified campus network today"}
          </p>
        </motion.div>
      )}

      {isModal && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-ink uppercase tracking-wider">
              {isLogin ? "Encrypted Password Sign-In" : "Instant Student Registration"}
            </p>
            <span className="flex items-center gap-1 text-[10px] font-bold text-pine bg-pine-soft px-2 py-0.5 rounded-full">
              <ShieldCheck size={12} /> bcrypt 10-salt
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-soft">
            {isLogin
              ? "Sign in using your student email & encrypted password."
              : "Register a verified campus profile with zero plain-text password risk."}
          </p>
        </div>
      )}

      {/* Demo Credentials Quick Pill */}
      {isLogin && (
        <div className="mb-4 rounded-xl border border-amber/40 bg-amber/15 p-2.5 text-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="font-bold text-amber-900 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-600" />
              Demo Account:
            </span>
            <p className="truncate text-[11px] text-amber-800 font-mono">
              anya@demo.campus.ac.in (pass: password123)
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleQuickFill("anya@demo.campus.ac.in", "password123")}
            className="cursor-pointer shrink-0 rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-transform"
          >
            Auto-Fill
          </button>
        </div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-bold text-red-600 shadow-2xs"
        >
          {error}
        </motion.div>
      )}

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700 shadow-2xs"
        >
          {successMsg}
        </motion.div>
      )}

      <motion.form layout onSubmit={handleSubmit} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.96 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative flex items-center overflow-hidden"
            >
              <User className="absolute left-4 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Full Name (as on ID card)"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-2xl border border-line bg-cream py-3 pl-11 pr-4 text-xs font-semibold text-ink outline-none transition-all focus:border-pine focus:ring-2 focus:ring-pine/20 placeholder:text-ink-faint"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center">
          <Mail className="absolute left-4 h-4.5 w-4.5 text-slate-400" />
          <input
            type="email"
            required
            placeholder="University Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-2xl border border-line bg-cream py-3 pl-11 pr-4 text-xs font-semibold text-ink outline-none transition-all focus:border-pine focus:ring-2 focus:ring-pine/20 placeholder:text-ink-faint"
          />
        </div>

        <div className="relative flex items-center">
          <Lock className="absolute left-4 h-4.5 w-4.5 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder={isLogin ? "Password" : "Create Password (min. 4 chars)"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-2xl border border-line bg-cream py-3 pl-11 pr-11 text-xs font-semibold text-ink outline-none transition-all focus:border-pine focus:ring-2 focus:ring-pine/20 placeholder:text-ink-faint"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <motion.button
          layout
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.975 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          disabled={isLoading}
          type="submit"
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-pine py-3.5 text-xs font-bold text-cream shadow-md shadow-pine/20 transition-all hover:bg-pine-deep disabled:opacity-70 select-none"
        >
          {isLoading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin text-cream" />
          ) : (
            <>
              <span>{isLogin ? "Sign In Securely" : "Complete Registration"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </motion.form>

      <div className="mt-4 text-center text-xs font-medium text-ink-soft">
        {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            setSuccessMsg("");
          }}
          className="cursor-pointer font-bold text-pine hover:underline ml-1"
        >
          {isLogin ? "Create one" : "Sign in"}
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return <div className="w-full">{formBody}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
      <motion.div 
        layout
        className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100"
      >
        {formBody}
      </motion.div>
    </div>
  );
}

export { AuthPortal };
