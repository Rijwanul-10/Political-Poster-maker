"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="relative overflow-hidden py-6 sm:py-10">
      {/* Top Welcome Language Pill (iPhone Dynamic Island style) */}
      <div className="max-w-xl mx-auto px-4 mb-6">
        <div className="ios-glass-card p-2 sm:p-2.5 flex items-center justify-between gap-3 shadow-lg border border-white/80">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-base sm:text-lg">🌐</span>
            <span className="text-xs font-bold text-slate-700">
              {lang === "bn" ? "ভাষা নির্বাচন করুন / Language:" : "Language Selection:"}
            </span>
          </div>
          <div className="ios-segmented-track">
            <button
              type="button"
              onClick={() => setLang("bn")}
              className={`ios-segmented-item flex items-center gap-1.5 cursor-pointer ${
                lang === "bn" ? "active" : ""
              }`}
            >
              <span>🇧🇩</span>
              <span>বাংলা</span>
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`ios-segmented-item flex items-center gap-1.5 cursor-pointer ${
                lang === "en" ? "active" : ""
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-8 pb-16 sm:pt-14 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ios-glass-btn text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-400/30">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          {t.home.badge}
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.18] max-w-4xl mx-auto">
          {t.home.heroH1Part1}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
            {t.home.heroH1Highlight}
          </span>
          {t.home.heroH1Part2}
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          {t.home.heroDesc}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/templates"
            className="w-full sm:w-auto px-8 py-4 ios-btn-primary font-bold text-base transition-all"
          >
            {t.home.startBtn}
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl ios-glass-btn text-slate-800 font-bold text-base hover:bg-white transition-all"
          >
            {t.home.freeAccountBtn}
          </Link>
        </div>
      </section>

      {/* Feature Highlights - iPhone Glass Cards */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ios-glass-card ios-glass-card-hover p-7 text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 text-emerald-700 flex items-center justify-center text-3xl font-bold mb-5 border border-emerald-500/30">
              ✨
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              {t.home.f1Title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t.home.f1Desc}
            </p>
          </div>

          <div className="ios-glass-card ios-glass-card-hover p-7 text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/30 text-amber-700 flex items-center justify-center text-3xl font-bold mb-5 border border-amber-500/30">
              🇧🇩
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              {t.home.f2Title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t.home.f2Desc}
            </p>
          </div>

          <div className="ios-glass-card ios-glass-card-hover p-7 text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/30 text-cyan-700 flex items-center justify-center text-3xl font-bold mb-5 border border-cyan-500/30">
              🖨️
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              {t.home.f3Title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t.home.f3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box - iPhone Liquid Glass Banner */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden border border-white/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 relative z-10">
            {t.home.ctaTitle}
          </h2>
          <p className="text-emerald-100/90 max-w-xl mx-auto mb-8 text-sm sm:text-base font-medium relative z-10">
            {t.home.ctaDesc}
          </p>
          <Link
            href="/templates"
            className="inline-flex px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base shadow-lg shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all relative z-10"
          >
            {t.home.ctaBtn}
          </Link>
        </div>
      </section>
    </div>
  );
}
