"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface TemplateItem {
  _id: string;
  title: string;
  occasionType: string;
  thumbnailUrl: string;
  isActive: boolean;
}

const OCCASIONS = [
  { id: "all", label: "সকল টেমপ্লেট" },
  { id: "bijoy_dibosh", label: "বিজয় দিবস" },
  { id: "eid_utsob", label: "ঈদ উৎসব" },
  { id: "political_rally", label: "দলীয় সমাবেশ" },
  { id: " शोक_dibosh", label: "শোক দিবস" },
];

export default function TemplatesPage() {
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
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          ডিজিটাল পোস্টার টেমপ্লেট গ্যালারি
        </h1>
        <p className="mt-3 text-slate-600 text-base">
          আপনার উপলক্ষ অনুযায়ী পছন্দের টেমপ্লেটটি নির্বাচন করুন এবং কয়েক মিনিটেই নিজের পোস্টার তৈরি করুন
        </p>
      </div>

      {/* Occasion Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {OCCASIONS.map((occ) => (
          <button
            key={occ.id}
            onClick={() => setSelectedOccasion(occ.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedOccasion === occ.id
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {occ.label}
          </button>
        ))}
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 text-sm">টেমপ্লেটগুলো লোড হচ্ছে...</p>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Templates Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((tmpl) => (
            <div
              key={tmpl._id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              {/* Template Card Visual Preview */}
              <div className="relative aspect-[3/4] bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-800 p-6 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] pointer-events-none" />
                
                {/* Badge */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">
                    {tmpl.occasionType.replace("_", " ")}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-sm font-bold border border-emerald-400/30">
                    HD
                  </span>
                </div>

                {/* Decorative Canvas representation */}
                <div className="relative z-10 text-center my-auto py-8">
                  <div className="text-2xl font-black text-amber-300 tracking-tight drop-shadow-md mb-2">
                    {tmpl.title}
                  </div>
                  <div className="inline-block px-4 py-1.5 rounded-lg bg-black/40 text-xs text-emerald-200 border border-emerald-500/30">
                    প্রিন্ট সাইজ: ১২০০ × ১৬০০ px
                  </div>
                </div>

                <div className="relative z-10 text-center">
                  <span className="text-[11px] text-white/60 tracking-wider">
                    AI স্বয়ংক্রিয় ফটো ক্রপ ও প্লেসমেন্ট
                  </span>
                </div>
              </div>

              {/* Card Meta & Action */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    রেফারেন্স কোয়ালিটি ডিজাইন • সর্বোচ্চ ৩ জন নেতার ছবি সাপোর্ট
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/poster/create?templateId=${tmpl._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-sm transition-colors group-hover:bg-emerald-600 shadow-sm"
                  >
                    <span>এই টেমপ্লেট দিয়ে বানান</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-slate-500">কোনো টেমপ্লেট পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
