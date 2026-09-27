"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import GoogleAuthButton from "@/components/GoogleAuthButton";

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/templates";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isEmail = identifier.includes("@");
    const payload = isEmail
      ? { email: identifier, password }
      : { phone: identifier, password };

    try {
      const data = await apiFetch<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: payload,
      });

      login(data.token, data.user);
      router.push(redirect);
    } catch (err: any) {
      if (lang === "en") {
        if (err.message?.includes("ভুল") || err.message?.includes("পাসওয়ার্ড")) {
          setError("Invalid email/phone or password");
        } else {
          setError(err.message || "Login failed");
        }
      } else {
        setError(err.message || "লগইন ব্যর্থ হয়েছে");
      }
    } finally {
      setLoading(false);
    }
  };

  const T = {
    bn: {
      title: "লগইন করুন",
      subtitle: "আপনার একাউন্টে প্রবেশ করে পোস্টার তৈরি করুন",
      orWith: "অথবা ইমেইল দিয়ে",
      emailLabel: "ইমেইল বা ফোন নম্বর",
      emailPlaceholder: "admin@example.com অথবা 017xxxxxxxx",
      passwordLabel: "পাসওয়ার্ড",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      loginBtn: "লগইন",
      loadingBtn: "যাচাই করা হচ্ছে...",
      noAccount: "একাউন্ট নেই?",
      registerLink: "নতুন একাউন্ট খুলুন",
    },
    en: {
      title: "Sign In",
      subtitle: "Access your account and start creating posters",
      orWith: "or continue with email",
      emailLabel: "Email or Phone Number",
      emailPlaceholder: "admin@example.com or 017xxxxxxxx",
      passwordLabel: "Password",
      forgotPassword: "Forgot Password?",
      loginBtn: "Sign In",
      loadingBtn: "Verifying...",
      noAccount: "Don't have an account?",
      registerLink: "Create a new account",
    },
  };

  const t = T[lang];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Political Poster Maker Logo"
            className="w-16 h-16 object-contain mx-auto mb-3 filter drop-shadow-md"
          />
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6">
          <GoogleAuthButton text="signin_with" onError={(err) => setError(err)} />
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t.orWith}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {t.emailLabel}
            </label>
            <input
              type="text"
              required
              placeholder={t.emailPlaceholder}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {t.passwordLabel}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
              >
                {t.forgotPassword}
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? t.loadingBtn : t.loginBtn}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          {t.noAccount}{" "}
          <Link href="/register" className="font-bold text-emerald-600 hover:underline">
            {t.registerLink}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
