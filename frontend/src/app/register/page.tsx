"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang } = useLanguage();

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

  const T = {
    bn: {
      title1: "নতুন একাউন্ট তৈরি করুন",
      title2: "ইমেইল ভেরিফিকেশন",
      sub1: "নিরাপদ ও ভেরিফাইড অ্যাকাউন্টের মাধ্যমে পোস্টার তৈরি করুন",
      sub2Prefix: "",
      sub2Suffix: " ঠিকানায় পাঠানো ৬ ডিজিটের কোডটি লিখুন",
      orWith: "অথবা ইমেইল দিয়ে",
      nameLabel: "আপনার পূর্ণ নাম *",
      namePlaceholder: "যেমন: ইঞ্জিনিয়ার মো: রফিকুল ইসলাম",
      emailLabel: "ইমেইল ঠিকানা (ওটিপি পাঠানো হবে) *",
      phoneLabel: "মোবাইল নম্বর (ঐচ্ছিক)",
      passwordLabel: "পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *",
      sendOtpBtn: "ইমেইলে ওটিপি কোড পাঠান →",
      sendingOtp: "ওটিপি পাঠানো হচ্ছে...",
      otpLabel: "৬ ডিজিটের ওটিপি (OTP) কোড",
      verifyBtn: "যাচাই করে অ্যাকাউন্ট তৈরি সম্পন্ন করুন ✅",
      verifyingBtn: "যাচাই করা হচ্ছে...",
      changeInfo: "← তথ্য পরিবর্তন করুন",
      resendOtp: "কোড পাননি? পুনরায় পাঠান",
      hasAccount: "ইতিমধ্যে একাউন্ট আছে?",
      loginLink: "লগইন করুন",
      viewEmail: "টেস্ট ইমেইল দেখতে এখানে ক্লিক করুন ↗",
      nameError: "আপনার নাম লিখুন",
      emailError: "সঠিক ইমেইল ঠিকানা দিন",
      passError: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
      otpError: "৬ ডিজিটের সঠিক ওটিপি কোডটি লিখুন",
      otpResent: "নতুন ওটিপি কোড পাঠানো হয়েছে",
    },
    en: {
      title1: "Create New Account",
      title2: "Email Verification",
      sub1: "Sign up for a verified account and start creating professional posters",
      sub2Prefix: "Enter the 6-digit code sent to ",
      sub2Suffix: "",
      orWith: "or continue with email",
      nameLabel: "Full Name *",
      namePlaceholder: "e.g.: Engineer Md. Rafiqul Islam",
      emailLabel: "Email Address (OTP will be sent) *",
      phoneLabel: "Mobile Number (Optional)",
      passwordLabel: "Password (min 6 characters) *",
      sendOtpBtn: "Send OTP to Email →",
      sendingOtp: "Sending OTP...",
      otpLabel: "6-Digit OTP Code",
      verifyBtn: "Verify & Complete Registration ✅",
      verifyingBtn: "Verifying...",
      changeInfo: "← Change details",
      resendOtp: "Didn't get code? Resend",
      hasAccount: "Already have an account?",
      loginLink: "Sign In",
      viewEmail: "View test email here ↗",
      nameError: "Please enter your name",
      emailError: "Please enter a valid email address",
      passError: "Password must be at least 6 characters",
      otpError: "Please enter a valid 6-digit OTP code",
      otpResent: "A new OTP code has been sent",
    },
  };

  const t = T[lang];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.name.trim()) { setError(t.nameError); return; }
    if (!formData.email.includes("@")) { setError(t.emailError); return; }
    if (formData.password.length < 6) { setError(t.passError); return; }

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
      setError(err.message || (lang === "bn" ? "ভেরিফিকেশন কোড পাঠানো যায়নি" : "Failed to send verification code"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) { setError(t.otpError); return; }
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<{ token: string; user: any }>("/auth/register-with-otp", {
        method: "POST",
        body: { name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, otp: otp.trim() },
      });
      login(data.token, data.user);
      router.push("/templates");
    } catch (err: any) {
      setError(err.message || (lang === "bn" ? "ওটিপি যাচাইকরণ ব্যর্থ হয়েছে" : "OTP verification failed"));
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
      setSuccessMsg(t.otpResent);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
    } catch (err: any) {
      setError(err.message || (lang === "bn" ? "পুনরায় ওটিপি পাঠানো যায়নি" : "Failed to resend OTP"));
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
            {step === 1 ? t.title1 : t.title2}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1 ? t.sub1 : `${t.sub2Prefix}${formData.email}${t.sub2Suffix}`}
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
              <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 underline font-semibold mt-1">
                {t.viewEmail}
              </a>
            )}
          </div>
        )}

        {step === 1 && (
          <>
            <div className="mb-6">
              <GoogleAuthButton text="signup_with" onError={(err) => setError(err)} />
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {t.orWith}
                </span>
              </div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">{t.nameLabel}</label>
                <input type="text" name="name" required placeholder={t.namePlaceholder} value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">{t.emailLabel}</label>
                <input type="email" name="email" required placeholder="yourname@gmail.com" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">{t.phoneLabel}</label>
                <input type="tel" name="phone" placeholder="017XXXXXXXX" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">{t.passwordLabel}</label>
                <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                {loading ? t.sendingOtp : t.sendOtpBtn}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">{t.otpLabel}</label>
              <input type="text" maxLength={6} required autoFocus placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="w-full px-4 py-3.5 text-center tracking-[8px] font-mono text-2xl font-bold rounded-xl border-2 border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all" />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? t.verifyingBtn : t.verifyBtn}
            </button>
            <div className="flex items-center justify-between text-xs pt-2">
              <button type="button" onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 underline">{t.changeInfo}</button>
              <button type="button" onClick={handleResendOtp} disabled={loading} className="text-emerald-700 hover:underline font-bold">{t.resendOtp}</button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-slate-600">
          {t.hasAccount}{" "}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline">{t.loginLink}</Link>
        </div>
      </div>
    </div>
  );
}
