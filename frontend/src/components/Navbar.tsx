"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 ios-glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-600/25 group-hover:scale-105 group-hover:rotate-3 transition-transform border border-white/40">
            প
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 bg-clip-text text-transparent">
              {t.nav.title}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold -mt-1 tracking-wider uppercase">
              {t.nav.sub}
            </div>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/templates"
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors px-2 py-1 rounded-lg hover:bg-white/50"
          >
            {t.nav.templates}
          </Link>

          {user && (
            <Link
              href="/history"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors px-2 py-1 rounded-lg hover:bg-white/50"
            >
              {t.nav.myPosters}
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl shadow-sm transition"
            >
              {t.nav.admin}
            </Link>
          )}

          {/* Fancy iPhone Glass Language Switcher */}
          <div className="ios-segmented-track" title="Toggle Language / ভাষা পরিবর্তন করুন">
            <button
              type="button"
              onClick={() => setLang("bn")}
              className={`ios-segmented-item flex items-center gap-1 cursor-pointer ${
                lang === "bn" ? "active" : ""
              }`}
            >
              <span>🇧🇩</span>
              <span className="font-bold">বাংলা</span>
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`ios-segmented-item flex items-center gap-1 cursor-pointer ${
                lang === "en" ? "active" : ""
              }`}
            >
              <span>🇬🇧</span>
              <span className="font-bold">English</span>
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-800 rounded-full font-semibold border border-emerald-500/20 max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/70 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
              >
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-white/60 transition"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm font-bold text-white ios-btn-primary px-3.5 py-1.5 sm:px-4 sm:py-2 transition-all"
              >
                {t.nav.register}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
