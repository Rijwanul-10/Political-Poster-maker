"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { apiFetch, API_BASE } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Template = {
  _id: string;
  title: string;
  occasionType: string;
  layoutConfig: any;
};

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

function PosterForm() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    party: "",
    district: "",
    headline: "",
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !token) {
      router.push(`/login?redirect=/poster/create?templateId=${templateId || ""}`);
      return;
    }

    if (templateId) {
      apiFetch<Template>(`/templates/${templateId}`)
        .then((tmpl) => setTemplate(tmpl))
        .catch((err) => setError("টেমপ্লেট লোড করতে সমস্যা হয়েছে: " + err.message));
    }
  }, [templateId, token, authLoading, router]);

  useEffect(() => {
    const urls = photoFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photoFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const selected = Array.from(files);

    if (selected.length > MAX_PHOTOS) {
      setError(`সর্বোচ্চ ${MAX_PHOTOS} টি ছবি আপলোড করতে পারবেন।`);
      return;
    }

    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`"${f.name}" ফাইলটির সাইজ ৮ মেগাবাইটের বেশি। অনুগ্রহ করে ছোট ছবি দিন।`);
        return;
      }
    }

    setError(null);
    setPhotoFiles(selected);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId) {
      setError("টেমপ্লেট আইডি পাওয়া যায়নি। অনুগ্রহ করে টেমপ্লেট গ্যালারি থেকে টেমপ্লেট বেছে নিন।");
      return;
    }
    if (photoFiles.length === 0) {
      setError("অনুগ্রহ করে অন্তত ১টি ছবি আপলোড করুন।");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage("ছবিগুলো আপলোড হচ্ছে...");

    try {
      // 1. Upload photos via /api/upload
      const photoUrls: string[] = [];
      for (let i = 0; i < photoFiles.length; i++) {
        setStatusMessage(`ছবি আপলোড হচ্ছে (${i + 1}/${photoFiles.length})...`);
        const form = new FormData();
        form.append("file", photoFiles[i]);

        const uploadRes = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: form,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData?.error || `ছবি আপলোড ব্যর্থ হয়েছে (স্ট্যাটাস: ${uploadRes.status})`);
        }
        const uploadData = await uploadRes.json();
        photoUrls.push(uploadData.url);
      }

      // 2. Trigger poster generation
      setStatusMessage("Gemini AI দিয়ে পোস্টার কম্পোজিশন তৈরি হচ্ছে...");
      const posterRes = await apiFetch<{ posterId: string; imageUrl?: string }>("/posters", {
        method: "POST",
        token,
        body: {
          templateId,
          formData,
          photoUrls,
        },
      });

      router.push(`/poster/${posterRes.posterId}`);
    } catch (err: any) {
      setError(err.message || "পোস্টার জেনারেশনে সমস্যা দেখা দিয়েছে");
      setLoading(false);
    }
  };

  if (!templateId) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <h2 className="text-xl font-bold mb-4">কোনো টেমপ্লেট নির্বাচন করা হয়নি</h2>
        <p className="text-slate-500 mb-6 text-sm">প্রথমে গ্যালারি থেকে একটি পোস্টার টেমপ্লেট বেছে নিন।</p>
        <Link
          href="/templates"
          className="inline-flex px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow hover:bg-emerald-700 transition"
        >
          টেমপ্লেট গ্যালারিতে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10">
        <div className="border-b border-slate-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              পোস্টার তৈরি
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {template?.title || "পোস্টার তথ্য ফর্ম"}
            </h1>
          </div>
          <Link
            href="/templates"
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            অন্য টেমপ্লেট বেছে নিন
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                নেতা / প্রার্থীর নাম *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="যেমন: ইঞ্জিনিয়ার মো: রফিকুল ইসলাম"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                পদবী / পরিচয় *
              </label>
              <input
                type="text"
                name="designation"
                required
                placeholder="যেমন: সভাপতি, সাধারণ সম্পাদক"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                সংগঠন / দল *
              </label>
              <input
                type="text"
                name="party"
                required
                placeholder="যেমন: বাংলাদেশ আওয়ামী লীগ / বিএনপি / অন্যান্য"
                value={formData.party}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                এলাকা / জেলা / থানা
              </label>
              <input
                type="text"
                name="district"
                placeholder="যেমন: ধানমন্ডি, ঢাকা"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              মূল স্লোগান / হেডলাইন বার্তা *
            </label>
            <textarea
              name="headline"
              required
              rows={3}
              placeholder="যেমন: মহান বিজয় দিবসে সকল শহীদদের প্রতি বিনম্র শ্রদ্ধাঞ্জলি"
              value={formData.headline}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm resize-none"
            />
          </div>

          {/* Photo Upload Zone */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                ছবি আপলোড (সর্বোচ্চ {MAX_PHOTOS} টি, প্রতিটি সর্বোচ্চ ৮ MB) *
              </label>
              <span className="text-xs text-slate-400">
                {photoFiles.length}/{MAX_PHOTOS} নির্বাচিত
              </span>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="hidden"
                disabled={photoFiles.length >= MAX_PHOTOS}
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer inline-flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-2">
                  📷
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {photoFiles.length >= MAX_PHOTOS
                    ? "সর্বোচ্চ সংখ্যক ছবি সিলেক্ট করা হয়েছে"
                    : "ছবি নির্বাচন করতে ক্লিক করুন"}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  JPG, PNG অথবা WebP ফরম্যাট সাপোর্টেড
                </span>
              </label>
            </div>

            {/* Photo Previews */}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow hover:bg-red-700 transition"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-[10px] text-white px-1.5 py-0.5 rounded">
                      ছবি #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? statusMessage || "পোস্টার জেনারেট হচ্ছে..." : "পোস্টার তৈরি করুন 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CreatePosterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">লোড হচ্ছে...</div>}>
      <PosterForm />
    </Suspense>
  );
}
