"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
      ? { email: identifier.trim(), password }
      : { phone: identifier.trim(), password };

    try {
      const data = await apiFetch<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: payload,
      });

      if (data.user.role !== "admin") {
        setError("এই অ্যাকাউন্টে অ্যাডমিন পারমিশন নেই। অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করুন।");
        return;
      }

      login(data.token, data.user);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "লগইন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setIdentifier("admin@poster-maker.com");
    setPassword("AdminPassword@123");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 sm:p-10 relative overflow-hidden">
        {/* Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-slate-900 via-emerald-600 to-slate-900" />

        <div className="text-center mb-8 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg mb-3">
            🛡️
          </div>
          <h1 className="text-2xl font-black text-slate-900">অ্যাডমিন কনসোল লগইন</h1>
          <p className="text-xs text-slate-500 mt-1">
            পোস্টার কারিগর সিস্টেম প্রশাসন ও কনটেন্ট মডারেশন প্যানেল
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Default Admin Quick Login Box */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-2">
          <div className="font-bold flex items-center justify-between">
            <span>🔑 ডিফল্ট অ্যাডমিন ক্রেডেনশিয়াল</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1 rounded-lg shadow-sm transition"
            >
              স্বয়ংক্রিয় পূরণ করুন
            </button>
          </div>
          <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-emerald-100 space-y-1">
            <div>ইমেইল: <span className="font-bold text-slate-900">admin@poster-maker.com</span></div>
            <div>পাসওয়ার্ড: <span className="font-bold text-slate-900">AdminPassword@123</span></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              অ্যাডমিন ইমেইল
            </label>
            <input
              type="email"
              required
              placeholder="admin@poster-maker.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? "যাচাই করা হচ্ছে..." : "অ্যাডমিন প্যানেলে প্রবেশ করুন →"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          সাধারণ ব্যবহারকারী?{" "}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline">
            সাধারণ লগইনে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
