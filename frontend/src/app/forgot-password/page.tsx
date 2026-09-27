"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const T = {
    bn: {
      title1: "পাসওয়ার্ড রিসেট",
      title2: "নতুন পাসওয়ার্ড সেট করুন",
      sub1: "আপনার নিবন্ধিত ইমেইলে একটি ভেরিফিকেশন ওটিপি কোড পাঠানো হবে",
      sub2Prefix: "",
      sub2Suffix: " ঠিকানায় পাঠানো ওটিপি কোডটি দিন",
      emailLabel: "নিবন্ধিত ইমেইল ঠিকানা",
      sendBtn: "রিসেট কোড (OTP) পাঠান →",
      sendingBtn: "কোড পাঠানো হচ্ছে...",
      otpLabel: "৬ ডিজিটের ওটিপি (OTP) কোড",
      newPassLabel: "নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)",
      confirmPassLabel: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
      resetBtn: "পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন ✅",
      resettingBtn: "পরিবর্তন করা হচ্ছে...",
      changeEmail: "← ইমেইল পরিবর্তন করুন",
      rememberPass: "পাসওয়ার্ড মনে পড়েছে?",
      loginLink: "লগইন পৃষ্ঠায় ফিরে যান",
      viewEmail: "টেস্ট ইমেইল দেখতে এখানে ক্লিক করুন ↗",
      emailError: "আপনার সঠিক ইমেইল ঠিকানা প্রদান করুন",
      otpError: "৬ ডিজিটের সঠিক ওটিপি কোডটি লিখুন",
      passLengthError: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
      passMismatchError: "উভয় পাসওয়ার্ড একই হতে হবে",
      successAlert: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!",
    },
    en: {
      title1: "Reset Password",
      title2: "Set New Password",
      sub1: "A verification OTP code will be sent to your registered email",
      sub2Prefix: "Enter the OTP code sent to ",
      sub2Suffix: "",
      emailLabel: "Registered Email Address",
      sendBtn: "Send Reset Code (OTP) →",
      sendingBtn: "Sending code...",
      otpLabel: "6-Digit OTP Code",
      newPassLabel: "New Password (min 6 characters)",
      confirmPassLabel: "Confirm New Password",
      resetBtn: "Reset Password ✅",
      resettingBtn: "Resetting...",
      changeEmail: "← Change email",
      rememberPass: "Remember your password?",
      loginLink: "Back to Sign In",
      viewEmail: "View test email here ↗",
      emailError: "Please enter a valid email address",
      otpError: "Please enter a valid 6-digit OTP code",
      passLengthError: "New password must be at least 6 characters",
      passMismatchError: "Both passwords must match",
      successAlert: "Password has been changed successfully!",
    },
  };

  const t = T[lang];

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email || !email.includes("@")) { setError(t.emailError); return; }
    setLoading(true);
    try {
      const res = await apiFetch<{ message: string; previewUrl?: string }>("/auth/forgot-password", {
        method: "POST", body: { email: email.trim() },
      });
      setSuccessMsg(res.message);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      setStep(2);
    } catch (err: any) {
      setError(err.message || (lang === "bn" ? "পাসওয়ার্ড রিসেট কোড পাঠানো যায়নি" : "Failed to send reset code"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.trim().length !== 6) { setError(t.otpError); return; }
    if (newPassword.length < 6) { setError(t.passLengthError); return; }
    if (newPassword !== confirmPassword) { setError(t.passMismatchError); return; }
    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/auth/reset-password", {
        method: "POST", body: { email: email.trim(), otp: otp.trim(), newPassword },
      });
      alert(res.message || t.successAlert);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || (lang === "bn" ? "পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে" : "Password reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md mb-3">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 ? t.title1 : t.title2}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1 ? t.sub1 : `${t.sub2Prefix}${email}${t.sub2Suffix}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex flex-col gap-1">
            <div className="flex items-center gap-2"><span>✅</span><span>{successMsg}</span></div>
            {previewUrl && (
              <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 underline font-semibold mt-1">{t.viewEmail}</a>
            )}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">{t.emailLabel}</label>
              <input type="email" required placeholder="yourname@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? t.sendingBtn : t.sendBtn}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-center">{t.otpLabel}</label>
              <input type="text" maxLength={6} required autoFocus placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="w-full px-4 py-3 text-center tracking-[8px] font-mono text-xl font-bold rounded-xl border-2 border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">{t.newPassLabel}</label>
              <input type="password" required placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">{t.confirmPassLabel}</label>
              <input type="password" required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm" />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="w-full mt-3 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? t.resettingBtn : t.resetBtn}
            </button>
            <div className="text-center pt-2">
              <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-800 underline">{t.changeEmail}</button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-slate-600">
          {t.rememberPass}{" "}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline">{t.loginLink}</Link>
        </div>
      </div>
    </div>
  );
}
