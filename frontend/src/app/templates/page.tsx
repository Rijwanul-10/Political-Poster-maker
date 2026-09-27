"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface TemplateItem {
  _id: string;
  title: string;
  occasionType: string;
  thumbnailUrl: string;
  isActive: boolean;
}

const OCCASIONS = [
  { id: "all", labelBn: "সকল টেমপ্লেট", labelEn: "All Templates" },
  { id: "bijoy_dibosh", labelBn: "বিজয় দিবস", labelEn: "Victory Day" },
  { id: "eid_utsob", labelBn: "ঈদ উৎসব", labelEn: "Eid Festive" },
  { id: "political_rally", labelBn: "দলীয় সমাবেশ", labelEn: "Political Rally" },
  { id: "shok_dibosh", labelBn: "শোক দিবস", labelEn: "National Mourning" },
  { id: "nirbachoni_procar", labelBn: "নির্বাচনী প্রচার", labelEn: "Election Campaign" },
  { id: "chhatra_andolon", labelBn: "তারুণ্য ও বিপ্লব", labelEn: "Youth & Revolution" },
  { id: "swadhinata_dibosh", labelBn: "স্বাধীনতা দিবস", labelEn: "Independence Day" },
  { id: "shohid_dibosh", labelBn: "শহীদ দিবস", labelEn: "Language Martyrs" },
  { id: "sommelon_council", labelBn: "জাতীয় সম্মেলন", labelEn: "Party Council" },
  { id: "shuvessa", labelBn: "উৎসব ও শুভেচ্ছা", labelEn: "Greetings & Wishes" },
];

export default function TemplatesPage() {
  const { lang } = useLanguage();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setLoading(true);
        const query = selectedOccasion !== "all" ? `?occasion=${selectedOccasion}` : "";
        const data = await apiFetch<TemplateItem[]>(`/templates${query}`);
        setTemplates(data);
      } catch (err: any) {
        setError(err.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, [selectedOccasion]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
          {lang === "bn" ? "টেমপ্লেট স্টুডিও" : "Template Studio"}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
          {lang === "bn" ? "ডিজিটাল পোস্টার টেমপ্লেট গ্যালারি" : "Digital Poster Template Gallery"}
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
          {lang === "bn"
            ? "আপনার উপলক্ষ অনুযায়ী পছন্দের টেমপ্লেটটি নির্বাচন করুন এবং কয়েক মিনিটেই নিজের পোস্টার তৈরি করুন"
            : "Choose an occasion template and generate your personalized political poster in minutes"}
        </p>
      </div>

      {/* Occasion Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {OCCASIONS.map((occ) => (
          <button
            key={occ.id}
            onClick={() => setSelectedOccasion(occ.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedOccasion === occ.id
                ? "ios-btn-primary shadow-md"
                : "ios-glass-btn text-slate-700 hover:bg-white border border-white/60"
            }`}
          >
            {lang === "bn" ? occ.labelBn : occ.labelEn}
          </button>
        ))}
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 text-sm font-medium">
            {lang === "bn" ? "টেমপ্লেটগুলো লোড হচ্ছে..." : "Loading templates..."}
          </p>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 text-center text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Templates Grid - iPhone Glass Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((tmpl) => (
            <div
              key={tmpl._id}
              className="ios-glass-card ios-glass-card-hover overflow-hidden flex flex-col group border border-white/80"
            >
              {/* Template Card Visual Preview */}
              <div className="relative aspect-[3/4] bg-gradient-to-tr from-slate-950 via-emerald-950 to-slate-900 p-6 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] pointer-events-none" />

                {/* Badge */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/30">
                    {tmpl.occasionType.replace("_", " ")}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-black border border-emerald-400/40 shadow-inner">
                    HD
                  </span>
                </div>

                {/* Decorative Canvas representation */}
                <div className="relative z-10 text-center my-auto py-8">
                  <div className="text-2xl font-black text-amber-300 tracking-tight drop-shadow-lg mb-2">
                    {tmpl.title}
                  </div>
                  <div className="inline-block px-3.5 py-1.5 rounded-xl bg-black/50 text-[11px] font-bold text-emerald-200 border border-emerald-500/40 backdrop-blur-md">
                    {lang === "bn" ? "প্রিন্ট সাইজ: ১২০০ × ১৬০০ px" : "Print Canvas: 1200 × 1600 px"}
                  </div>
                </div>

                <div className="relative z-10 text-center">
                  <span className="text-[11px] font-semibold text-white/70 tracking-wider">
                    {lang === "bn"
                      ? "AI ফটো ক্রপ • দলীয় মার্কা • কাস্টম কালার"
                      : "AI Photo Crops • Party Insignia • Custom Colors"}
                  </span>
                </div>
              </div>

              {/* Card Meta & Action */}
              <div className="p-6 flex flex-col flex-1 justify-between bg-white/60">
                <div>
                  <h3 className="font-black text-lg text-slate-900 mb-1">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === "bn"
                      ? "প্রিমিয়াম প্রিন্ট কোয়ালিটি • ৩ জন নেতার ছবি ও পদবী সাপোর্ট"
                      : "Premium Print Quality • Up to 3 Leader Portraits & Titles"}
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/poster/create?templateId=${tmpl._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl ios-btn-primary font-black text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>
                      {lang === "bn" ? "এই টেমপ্লেট দিয়ে তৈরি করুন" : "Use This Template"}
                    </span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-slate-500 font-medium">
                {lang === "bn" ? "কোনো টেমপ্লেট পাওয়া যায়নি" : "No templates found"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
