"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
      alert("রি-জেনারেট করার সর্বোচ্চ সীমা (৩ বার) পূর্ণ হয়েছে।");
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
      setErrorMessage(err.message || "রি-জেনারেট ব্যর্থ হয়েছে");
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
          <title>${poster.formData?.headline || "পোস্টার"}</title>
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
        <p className="text-slate-600 font-medium">পোস্টার লোড করা হচ্ছে...</p>
      </div>
    );
  }

  if (errorMessage && !poster) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 text-center">
        <span className="text-4xl mb-4 inline-block">❌</span>
        <h2 className="text-xl font-bold text-slate-900 mb-2">সমস্যা দেখা দিয়েছে</h2>
        <p className="text-sm text-red-600 mb-6">{errorMessage}</p>
        <Link
          href="/templates"
          className="inline-flex px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm"
        >
          টেমপ্লেট গ্যালারিতে ফিরে যান
        </Link>
      </div>
    );
  }

  const isGenerating = poster?.status === "generating";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <span
              className={`w-2 h-2 rounded-full ${
                poster?.status === "completed"
                  ? "bg-emerald-500"
                  : isGenerating
                  ? "bg-amber-500 animate-ping"
                  : "bg-red-500"
              }`}
            />
            {poster?.status === "completed"
              ? "পোস্টার প্রস্তুত"
              : isGenerating
              ? "তৈরি হচ্ছে (AI Processing)"
              : "ব্যর্থ"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {poster?.formData?.headline || "আপনার ডিজিটাল পোস্টার"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {poster?.formData?.name} • {poster?.formData?.designation} • {poster?.formData?.party}
          </p>
        </div>

        <Link
          href="/templates"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 self-start sm:self-auto"
        >
          <span>+ নতুন পোস্টার বানান</span>
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Poster Preview Canvas */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xl flex flex-col items-center justify-center min-h-[550px] relative overflow-hidden">
          {isGenerating ? (
            <div className="text-center p-8 max-w-sm">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Gemini AI পোস্টার তৈরি করছে...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                নেতাদের ছবির ফেস ডিটেকশন ও কাটিং, স্লোগানের টাইপোগ্রাফি এবং কালার প্যালেট সাজানো হচ্ছে। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।
              </p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
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
              <p className="text-slate-500">কোনো ছবি পাওয়া যায়নি</p>
            </div>
          )}
        </div>

        {/* Sidebar Actions & Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">
              পোস্টার একশন
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={!poster?.generatedImageUrl || isGenerating}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>📥</span>
                <span>হাই-রেজ্যুলেশন PNG ডাউনলোড</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={!poster?.generatedImageUrl || isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm border border-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>📄</span>
                <span>প্রিন্ট-রেডি PDF এক্সপোর্ট (A3/Banner)</span>
              </button>

              <button
                onClick={handleRegenerate}
                disabled={
                  isRegenerating ||
                  isGenerating ||
                  (poster?.regenerateCount ?? 0) >= 3
                }
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>🔄</span>
                <span>
                  {isRegenerating
                    ? "নতুন ডিজাইন তৈরি হচ্ছে..."
                    : `রি-জেনারেট করুন (${3 - (poster?.regenerateCount || 0)} বার বাকি)`}
                </span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="flex justify-between">
                <span>ফরম্যাট:</span>
                <span className="font-semibold text-slate-700">PNG (High Quality)</span>
              </div>
              <div className="flex justify-between">
                <span>প্রিন্ট সাইজ:</span>
                <span className="font-semibold text-slate-700">1200 × 1600 px</span>
              </div>
              <div className="flex justify-between">
                <span>কালার প্রোফাইল:</span>
                <span className="font-semibold text-slate-700">RGB / CMYK Friendly</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/60 rounded-3xl border border-emerald-100 p-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 mb-2">
              💡 প্রিন্ট ও সোশ্যাল টিপস
            </h4>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              ডাউনলোড করা PNG ফাইলটি সরাসরি Facebook, WhatsApp গ্রুপ অথবা প্রেসে পাঠিয়ে ব্যানারে প্রিন্ট করার উপযোগী।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
