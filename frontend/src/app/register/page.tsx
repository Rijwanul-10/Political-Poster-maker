"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Step 1: form details, Step 2: enter OTP
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Validate and send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.name.trim()) {
      setError("আপনার নাম লিখুন");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    if (formData.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ message: string; previewUrl?: string }>("/auth/send-registration-otp", {
        method: "POST",
        body: { email: formData.email.trim() },
      });

      setSuccessMsg(res.message);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "ভেরিফিকেশন কোড পাঠানো যায়নি");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP and complete registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError("৬ ডিজিটের সঠিক ওটিপি কোডটি লিখুন");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<{ token: string; user: any }>("/auth/register-with-otp", {
        method: "POST",
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          otp: otp.trim(),
        },
      });

      login(data.token, data.user);
      router.push("/templates");
    } catch (err: any) {
      setError(err.message || "ওটিপি যাচাইকরণ ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ message: string; previewUrl?: string }>("/auth/send-registration-otp", {
        method: "POST",
        body: { email: formData.email.trim() },
      });
      setSuccessMsg("নতুন ওটিপি কোড পাঠানো হয়েছে");
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
    } catch (err: any) {
      setError(err.message || "পুনরায় ওটিপি পাঠানো যায়নি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md mb-3">
            প
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 ? "নতুন একাউন্ট তৈরি করুন" : "ইমেইল ভেরিফিকেশন"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1
              ? "নিরাপদ ও ভেরিফাইড অ্যাকাউন্টের মাধ্যমে পোস্টার তৈরি করুন"
              : `${formData.email} ঠিকানায় পাঠানো ৬ ডিজিটের কোডটি লিখুন`}
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

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <>
            {/* Google OAuth Option */}
            <div className="mb-6">
              <GoogleAuthButton
                text="signup_with"
                onError={(err) => setError(err)}
              />
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  অথবা ইমেইল দিয়ে
                </span>
              </div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  আপনার পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="যেমন: ইঞ্জিনিয়ার মো: রফিকুল ইসলাম"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  ইমেইল ঠিকানা (ওটিপি পাঠানো হবে) *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "ওটিপি পাঠানো হচ্ছে..." : "ইমেইলে ওটিপি কোড পাঠান →"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
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
                className="w-full px-4 py-3.5 text-center tracking-[8px] font-mono text-2xl font-bold rounded-xl border-2 border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "যাচাই করা হচ্ছে..." : "যাচাই করে অ্যাকাউন্ট তৈরি সম্পন্ন করুন ✅"}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-800 underline"
              >
                ← তথ্য পরিবর্তন করুন
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-emerald-700 hover:underline font-bold"
              >
                কোড পাননি? পুনরায় পাঠান
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-slate-600">
          ইতিমধ্যে একাউন্ট আছে?{" "}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
