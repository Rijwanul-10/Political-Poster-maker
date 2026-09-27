"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface PosterHistoryItem {
  _id: string;
  status: "draft" | "generating" | "completed" | "failed";
  generatedImageUrl?: string;
  templateId?: {
    _id: string;
    title: string;
    occasionType: string;
  };
  formData?: {
    name?: string;
    designation?: string;
    party?: string;
    district?: string;
    headline?: string;
  };
  createdAt: string;
}

export default function PosterHistoryPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [posters, setPosters] = useState<PosterHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login?redirect=/history");
      return;
    }

    if (user && token) {
      loadHistory();
    }
  }, [user, token, authLoading, router]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<PosterHistoryItem[]>(`/posters/user/${user?.id}`, { token });
      setPosters(data);
    } catch (err: any) {
      setError(err.message || "পোস্টার হিস্টোরি লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পোস্টারটি মুছে ফেলতে চান?")) return;
    try {
      await apiFetch(`/posters/${id}`, {
        method: "DELETE",
        token,
      });
      setPosters((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert("মুছে ফেলা ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const handleDownload = async (imageUrl: string, id: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `poster_${id.slice(-6)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            আমার তৈরি করা পোস্টারসমূহ
          </h1>
          <p className="mt-2 text-slate-600 text-sm">
            আপনার অ্যাকাউন্টে সংরক্ষিত অতীতের সব পোস্টার দেখুন, পুনরায় ডাউনলোড করুন বা শেয়ার করুন
          </p>
        </div>

        <Link
          href="/templates"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow hover:shadow-lg transition"
        >
          <span>+ নতুন পোস্টার বানান</span>
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 text-sm">পোস্টার তালিকা লোড হচ্ছে...</p>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center text-sm">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posters.map((poster) => (
            <div
              key={poster._id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group"
            >
              {/* Image Preview */}
              <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden flex items-center justify-center">
                {poster.generatedImageUrl ? (
                  <img
                    src={poster.generatedImageUrl}
                    alt="Poster Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <span className="text-3xl mb-2 block">⏳</span>
                    <p className="text-xs">জেনারেট হচ্ছে বা প্রক্রিয়াধীন...</p>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      poster.status === "completed"
                        ? "bg-emerald-600/90 text-white"
                        : "bg-amber-500/90 text-white"
                    }`}
                  >
                    {poster.status === "completed" ? "প্রস্তুত" : "তৈরি হচ্ছে"}
                  </span>
                </div>
              </div>

              {/* Meta & Actions */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1">
                    {poster.formData?.headline || poster.templateId?.title || "ডিজিটাল পোস্টার"}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {poster.formData?.name} • {poster.formData?.designation}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    তারিখ: {new Date(poster.createdAt).toLocaleDateString("bn-BD")}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/poster/${poster._id}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                  >
                    বিস্তারিত দেখুন
                  </Link>

                  {poster.generatedImageUrl && (
                    <button
                      onClick={() => handleDownload(poster.generatedImageUrl!, poster._id)}
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition"
                      title="ডাউনলোড"
                    >
                      📥 ডাউনলোড
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(poster._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="মুছে ফেলুন"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {posters.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <span className="text-4xl block mb-3">🖼️</span>
              <h3 className="text-lg font-bold text-slate-800">কোনো পোস্টার তৈরি করা হয়নি</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                আপনার প্রিয় টেমপ্লেট বেছে নিয়ে প্রথম পোস্টারটি তৈরি করুন
              </p>
              <Link
                href="/templates"
                className="inline-flex px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition"
              >
                টেমপ্লেট গ্যালারিতে যান
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
