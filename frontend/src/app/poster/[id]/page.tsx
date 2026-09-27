"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface PosterData {
  _id: string;
  status: "draft" | "generating" | "completed" | "failed";
  generatedImageUrl?: string;
  regenerateCount: number;
  formData: {
    name?: string;
    designation?: string;
    party?: string;
    district?: string;
    headline?: string;
  };
  error?: string;
}

export default function PosterStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const posterId = resolvedParams.id;

  const { token } = useAuth();
  const { lang } = useLanguage();
  const [poster, setPoster] = useState<PosterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    async function fetchPoster() {
      try {
        const data = await apiFetch<PosterData>(`/posters/${posterId}`, { token });
        setPoster(data);
        setLoading(false);

        if (data.status === "generating") {
          if (!interval) {
            interval = setInterval(fetchPoster, 2500);
          }
        } else {
          if (interval) clearInterval(interval);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load poster");
        setLoading(false);
        if (interval) clearInterval(interval);
      }
    }

    fetchPoster();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [posterId, token]);

  const handleRegenerate = async () => {
    if (!poster) return;
    if (poster.regenerateCount >= 3) {
      alert(
        lang === "bn"
          ? "রি-জেনারেট করার সর্বোচ্চ সীমা (৩ বার) পূর্ণ হয়েছে।"
          : "Maximum regeneration limit (3 times) reached."
      );
      return;
    }

    setIsRegenerating(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch<{ posterId: string; imageUrl: string }>(
        `/posters/${posterId}/regenerate`,
        {
          method: "POST",
          token,
        }
      );
      setPoster((prev) =>
        prev
          ? {
              ...prev,
              generatedImageUrl: res.imageUrl,
              regenerateCount: prev.regenerateCount + 1,
              status: "completed",
            }
          : null
      );
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (lang === "bn" ? "রি-জেনারেট ব্যর্থ হয়েছে" : "Regeneration failed")
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!poster?.generatedImageUrl) return;
    try {
      const response = await fetch(poster.generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `poster_${poster._id.slice(-6)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(poster.generatedImageUrl, "_blank");
    }
  };

  const handleDownloadPdf = () => {
    if (!poster?.generatedImageUrl) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${poster.formData?.headline || "Poster"}</title>
          <style>
            @page { size: A3 portrait; margin: 0; }
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #000; }
            img { width: 100vw; height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${poster.generatedImageUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">
          {lang === "bn" ? "পোস্টার লোড করা হচ্ছে..." : "Loading poster..."}
        </p>
      </div>
    );
  }

  if (errorMessage && !poster) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 ios-glass-card text-center border-red-200">
        <span className="text-4xl mb-4 inline-block">❌</span>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {lang === "bn" ? "সমস্যা দেখা দিয়েছে" : "Error Occurred"}
        </h2>
        <p className="text-sm text-red-600 mb-6">{errorMessage}</p>
        <Link
          href="/templates"
          className="inline-flex px-6 py-2.5 rounded-2xl ios-btn-primary font-bold text-sm"
        >
          {lang === "bn" ? "টেমপ্লেট গ্যালারিতে ফিরে যান" : "Return to Templates"}
        </Link>
      </div>
    );
  }

  const isGenerating = poster?.status === "generating";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-bold mb-2 border border-emerald-500/20">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                poster?.status === "completed"
                  ? "bg-emerald-500"
                  : isGenerating
                  ? "bg-amber-500 animate-ping"
                  : "bg-red-500"
              }`}
            />
            {poster?.status === "completed"
              ? lang === "bn"
                ? "পোস্টার প্রস্তুত"
                : "Poster Ready"
              : isGenerating
              ? lang === "bn"
                ? "তৈরি হচ্ছে (AI Processing)"
                : "Generating (AI Processing)"
              : lang === "bn"
              ? "ব্যর্থ"
              : "Failed"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {poster?.formData?.headline ||
              (lang === "bn" ? "আপনার ডিজিটাল পোস্টার" : "Your Digital Poster")}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {poster?.formData?.name} • {poster?.formData?.designation} • {poster?.formData?.party}
          </p>
        </div>

        <Link
          href="/templates"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-500/15 hover:bg-emerald-500/25 px-4 py-2.5 rounded-2xl border border-emerald-500/30 self-start sm:self-auto transition cursor-pointer"
        >
          <span>+ {lang === "bn" ? "নতুন পোস্টার বানান" : "Create New Poster"}</span>
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Poster Preview Canvas */}
        <div className="lg:col-span-8 ios-glass-card p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center min-h-[550px] relative overflow-hidden border border-white/80">
          {isGenerating ? (
            <div className="text-center p-8 max-w-sm">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-lg font-black text-slate-800 mb-2">
                {lang === "bn"
                  ? "Gemini AI পোস্টার তৈরি করছে..."
                  : "Gemini AI is generating your poster..."}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
                {lang === "bn"
                  ? "নেতাদের ছবির ফেস ডিটেকশন ও কাটিং, স্লোগানের টাইপোগ্রাফি এবং কালার প্যালেট সাজানো হচ্ছে। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।"
                  : "Processing face detection, custom typography, party insignia, and color schemes. Please hold on a few seconds."}
              </p>
              <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          ) : poster?.generatedImageUrl ? (
            <div className="w-full flex justify-center">
              <img
                src={poster.generatedImageUrl}
                alt="Generated Poster"
                className="max-h-[750px] w-auto rounded-2xl shadow-2xl object-contain border border-slate-200"
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-slate-500 font-medium">
                {lang === "bn" ? "কোনো ছবি পাওয়া যায়নি" : "No image available"}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Actions & Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="ios-glass-card p-6 shadow-md border border-white/80">
            <h3 className="font-black text-base text-slate-900 mb-4">
              {lang === "bn" ? "পোস্টার একশন" : "Poster Actions"}
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={!poster?.generatedImageUrl || isGenerating}
                className="w-full py-3.5 px-4 rounded-2xl ios-btn-primary font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>📥</span>
                <span>{lang === "bn" ? "হাই-রেজ্যুলেশন PNG ডাউনলোড" : "Download High-Res PNG"}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={!poster?.generatedImageUrl || isGenerating}
                className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 font-bold text-sm border border-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>📄</span>
                <span>{lang === "bn" ? "প্রিন্ট-রেডি PDF এক্সপোর্ট (A3)" : "Print-Ready PDF Export (A3)"}</span>
              </button>

              <button
                onClick={handleRegenerate}
                disabled={
                  isRegenerating ||
                  isGenerating ||
                  (poster?.regenerateCount ?? 0) >= 3
                }
                className="w-full py-3 px-4 rounded-2xl ios-glass-btn text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>🔄</span>
                <span>
                  {isRegenerating
                    ? lang === "bn"
                      ? "নতুন ডিজাইন তৈরি হচ্ছে..."
                      : "Regenerating..."
                    : lang === "bn"
                    ? `রি-জেনারেট করুন (${3 - (poster?.regenerateCount || 0)} বার বাকি)`
                    : `Regenerate (${3 - (poster?.regenerateCount || 0)} remaining)`}
                </span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200/60 text-xs text-slate-500 space-y-2">
              <div className="flex justify-between">
                <span>{lang === "bn" ? "ফরম্যাট:" : "Format:"}</span>
                <span className="font-bold text-slate-800">PNG (High Quality)</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "bn" ? "প্রিন্ট সাইজ:" : "Print Dimensions:"}</span>
                <span className="font-bold text-slate-800">1200 × 1600 px</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "bn" ? "কালার প্রোফাইল:" : "Color Profile:"}</span>
                <span className="font-bold text-slate-800">RGB / Print-Friendly</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/25">
            <h4 className="font-black text-xs uppercase tracking-wider text-emerald-800 mb-2">
              💡 {lang === "bn" ? "প্রিন্ট ও সোশ্যাল টিপস" : "Print & Social Tips"}
            </h4>
            <p className="text-xs text-emerald-950/80 leading-relaxed font-medium">
              {lang === "bn"
                ? "ডাউনলোড করা PNG ফাইলটি সরাসরি Facebook, WhatsApp গ্রুপ অথবা প্রেসে পাঠিয়ে ব্যানারে প্রিন্ট করার উপযোগী।"
                : "The downloaded PNG file is ready for direct sharing on Facebook, WhatsApp or sending to commercial press for PVC banner printing."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
