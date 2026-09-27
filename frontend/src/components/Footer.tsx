"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="border-t border-white/60 bg-white/60 py-8 text-center text-xs text-slate-500 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>
          {lang === "bn"
            ? "© ২০২৬ পোস্টার কারিগর (Poster Karigor) • সর্বস্বত্ব সংরক্ষিত"
            : "© 2026 Poster Karigor • All Rights Reserved"}
        </p>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/20">
            {lang === "bn" ? "Gemini AI ইঞ্জিন" : "Gemini AI Engine"}
          </span>
          <span>•</span>
          <span>{lang === "bn" ? "বাংলা টাইপোগ্রাফি" : "Bangla Typography"}</span>
          <span>•</span>
          <span>{lang === "bn" ? "প্রিন্ট-রেডি এইচডি" : "Print-Ready HD"}</span>
        </div>
      </div>
    </footer>
  );
}
