"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Request OTP by Email, Step 2: Enter OTP & New Password
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Step 1: Send Password Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !email.includes("@")) {
      setError("আপনার সঠিক ইমেইল ঠিকানা প্রদান করুন");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ message: string; previewUrl?: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email: email.trim() },
      });

      setSuccessMsg(res.message);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "পাসওয়ার্ড রিসেট কোড পাঠানো যায়নি");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.trim().length !== 6) {
      setError("৬ ডিজিটের সঠিক ওটিপি কোডটি লিখুন");
      return;
    }

    if (newPassword.length < 6) {
      setError("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("উভয় পাসওয়ার্ড একই হতে হবে");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/auth/reset-password", {
        method: "POST",
        body: {
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        },
      });

      alert(res.message || "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে");
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
            {step === 1 ? "পাসওয়ার্ড রিসেট" : "নতুন পাসওয়ার্ড সেট করুন"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1
              ? "আপনার নিবন্ধিত ইমেইলে একটি ভেরিফিকেশন ওটিপি কোড পাঠানো হবে"
              : `${email} ঠিকানায় পাঠানো ওটিপি কোডটি দিন`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 underline font-semibold mt-1"
              >
                টেস্ট ইমেইল দেখতে এখানে ক্লিক করুন ↗
              </a>
            )}
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                নিবন্ধিত ইমেইল ঠিকানা
              </label>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "কোড পাঠানো হচ্ছে..." : "রিসেট কোড (OTP) পাঠান →"}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
                ৬ ডিজিটের ওটিপি (OTP) কোড
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 text-center tracking-[8px] font-mono text-xl font-bold rounded-xl border-2 border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                নতুন পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full mt-3 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "পরিবর্তন করা হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন ✅"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                ← ইমেইল পরিবর্তন করুন
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-slate-600">
          পাসওয়ার্ড মনে পড়েছে?{" "}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline">
            লগইন পৃষ্ঠায় ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
