"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { apiFetch, API_BASE } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { PRESET_PARTY_LOGOS } from "./partyLogos";

type Template = {
  _id: string;
  title: string;
  occasionType: string;
  layoutConfig: any;
};

interface PhotoDetail {
  name: string;
  role: string;
}

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const WATERMARK_PRICE = 50; // 50 BDT

// Predefined quick roles for photo assignment
const QUICK_ROLES = [
  { bn: "প্রধান নেতা / অতিথি", en: "Chief Leader / Guest" },
  { bn: "সাধারণ সম্পাদক", en: "General Secretary" },
  { bn: "সাংগঠনিক সম্পাদক", en: "Organizing Secretary" },
  { bn: "আহ্বায়ক", en: "Convener" },
  { bn: "যুগ্ম আহ্বায়ক", en: "Joint Convener" },
  { bn: "সাধারণ সদস্য", en: "General Member" },
  { bn: "প্রচারক", en: "Organizer / Promoter" },
];

// Predefined design style prompt presets
const DESIGN_PROMPT_PRESETS = [
  {
    icon: "👑",
    bn: "রয়েল ব্লু এবং উজ্জ্বল সোনালী লাক্সারি থিম",
    en: "Royal Blue & Brilliant Gold Luxury VIP Theme",
  },
  {
    icon: "🌿",
    bn: "গাঢ় সবুজ ও লাল দেশপ্রেমিক বিজয় থিম",
    en: "Emerald Green & Crimson Patriotic Victory Theme",
  },
  {
    icon: "🌌",
    bn: "আধুনিক ডার্ক সাইবার গ্লাস ও মেটালিক থিম",
    en: "Modern Dark Cyber Glass & Metallic Carbon Theme",
  },
  {
    icon: "🌅",
    bn: "সানসেট কমলা ও গাঢ় মেরুন উৎসব থিম",
    en: "Sunset Orange & Deep Maroon Festive Celebration",
  },
  {
    icon: "💎",
    bn: "নেভি ব্লু ও রয়েল সিলভার ভিআইপি মিনিমালিস্ট",
    en: "Navy Blue & Royal Silver VIP Minimalist Theme",
  },
  {
    icon: "⚡",
    bn: "বোল্ড ড্রামাটিক রেড ও ব্ল্যাক পাওয়ার লুক",
    en: "Bold Dramatic Crimson Red & Black Power Theme",
  },
];

function PosterForm() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [template, setTemplate] = useState<Template | null>(null);

  // Core Form State
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    party: "",
    district: "",
    headline: "",
    headlineFont: "Tiro Bangla",
    photoLayout: "cutout",
    userDesignPrompt: "",
    removeWatermark: false,
  });

  // Photos State
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [photoDetails, setPhotoDetails] = useState<PhotoDetail[]>([
    { name: "", role: "প্রধান নেতা / অতিথি" },
    { name: "", role: "সাধারণ সম্পাদক" },
    { name: "", role: "সাধারণ সদস্য" },
  ]);

  // Party Logo State (Mandatory)
  const [selectedPresetLogoId, setSelectedPresetLogoId] = useState<string>("paddy");
  const [customPartyLogoFile, setCustomPartyLogoFile] = useState<File | null>(null);
  const [customPartyLogoPreview, setCustomPartyLogoPreview] = useState<string | null>(null);

  // Extra Logo State (Optional)
  const [extraLogoFile, setExtraLogoFile] = useState<File | null>(null);
  const [extraLogoPreview, setExtraLogoPreview] = useState<string | null>(null);

  // UI / Status State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Payment Gateway State for Watermark Removal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<"bkash" | "nagad">("bkash");
  const [paymentTxnId, setPaymentTxnId] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Bulk CSV Mode State
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkCsvFile, setBulkCsvFile] = useState<File | null>(null);
  const [bulkResults, setBulkResults] = useState<any[] | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push(`/login?redirect=/poster/create?templateId=${templateId || ""}`);
      return;
    }

    if (templateId) {
      apiFetch<Template>(`/templates/${templateId}`)
        .then((tmpl) => setTemplate(tmpl))
        .catch((err) =>
          setError(
            lang === "bn"
              ? "টেমপ্লেট লোড করতে সমস্যা হয়েছে: " + err.message
              : "Failed to load template: " + err.message
          )
        );
    }
  }, [templateId, token, authLoading, router, lang]);

  // Handle Photo Object URLs
  useEffect(() => {
    const urls = photoFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photoFiles]);

  // Handle Custom Party Logo URL
  useEffect(() => {
    if (!customPartyLogoFile) {
      setCustomPartyLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(customPartyLogoFile);
    setCustomPartyLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [customPartyLogoFile]);

  // Handle Extra Logo URL
  useEffect(() => {
    if (!extraLogoFile) {
      setExtraLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(extraLogoFile);
    setExtraLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [extraLogoFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selected = Array.from(files);

    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        setError(
          lang === "bn"
            ? `"${f.name}" ফাইলটির সাইজ ৮ মেগাবাইটের বেশি। অনুগ্রহ করে ছোট ছবি দিন।`
            : `"${f.name}" exceeds 8 MB size limit. Please upload a smaller image.`
        );
        e.target.value = "";
        return;
      }
    }

    setPhotoFiles((prev) => {
      const combined = [...prev, ...selected];
      if (combined.length > MAX_PHOTOS) {
        setError(
          lang === "bn"
            ? `সর্বোচ্চ ${MAX_PHOTOS} টি ছবি আপলোড করতে পারবেন। (ইতিমধ্যে ${prev.length}টি আছে)`
            : `You can upload up to ${MAX_PHOTOS} photos. (Already selected ${prev.length})`
        );
        return prev;
      }
      setError(null);
      return combined;
    });

    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const updatePhotoDetail = (index: number, field: "name" | "role", value: string) => {
    setPhotoDetails((prev) => {
      const copy = [...prev];
      if (!copy[index]) copy[index] = { name: "", role: "" };
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Payment Verification Handler
  const handlePaymentSubmit = async () => {
    if (!paymentTxnId.trim() || paymentTxnId.trim().length < 5) {
      setPaymentError(
        lang === "bn"
          ? "সঠিক ট্রানজেকশন আইডি দিন (কমপক্ষে ৫ অক্ষর)।"
          : "Please provide a valid Transaction ID (at least 5 characters)."
      );
      return;
    }
    if (!paymentPhone.trim() || paymentPhone.trim().length < 11) {
      setPaymentError(
        lang === "bn"
          ? "সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)।"
          : "Please provide a valid 11-digit mobile number."
      );
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const res = await apiFetch<{ paymentId: string; status: string; message: string }>(
        "/payments/submit",
        {
          method: "POST",
          token,
          body: {
            gateway: paymentGateway,
            gatewayTxnId: paymentTxnId.trim(),
            phoneNumber: paymentPhone.trim(),
          },
        }
      );

      setPaymentId(res.paymentId);
      setPaymentSuccess(true);
      setFormData((prev) => ({ ...prev, removeWatermark: true }));

      setTimeout(() => {
        setShowPaymentModal(false);
      }, 2200);
    } catch (err: any) {
      setPaymentError(
        err.message ||
          (lang === "bn" ? "পেমেন্ট যাচাই ব্যর্থ হয়েছে।" : "Payment verification failed.")
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Main Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateId) {
      setError(
        lang === "bn"
          ? "টেমপ্লেট আইডি পাওয়া যায়নি। অনুগ্রহ করে টেমপ্লেট গ্যালারি থেকে টেমপ্লেট বেছে নিন।"
          : "Template ID not found. Please choose a template from the gallery."
      );
      return;
    }

    if (photoFiles.length === 0) {
      setError(
        lang === "bn"
          ? "অনুগ্রহ করে অন্তত ১টি ছবি আপলোড করুন।"
          : "Please upload at least 1 photo."
      );
      return;
    }

    // MANDATORY PARTY LOGO CHECK
    if (!selectedPresetLogoId && !customPartyLogoFile) {
      setError(
        lang === "bn"
          ? "রাজনৈতিক দলের প্রতীক বা লোগো নির্বাচন করা আবশ্যক!"
          : "Political party logo is mandatory! Please select a preset symbol or upload a logo."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(
      lang === "bn" ? "ছবিগুলো আপলোড হচ্ছে..." : "Uploading leader photos..."
    );

    try {
      // 1. Upload Leader Photos
      const photoUrls: string[] = [];
      for (let i = 0; i < photoFiles.length; i++) {
        setStatusMessage(
          lang === "bn"
            ? `ছবি আপলোড হচ্ছে (${i + 1}/${photoFiles.length})...`
            : `Uploading photo (${i + 1}/${photoFiles.length})...`
        );
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
          throw new Error(errData?.error || `Upload failed with status: ${uploadRes.status}`);
        }
        const uploadData = await uploadRes.json();
        photoUrls.push(uploadData.url);
      }

      // 2. Resolve Party Logo URL (Mandatory)
      let resolvedPartyLogoUrl = "";
      if (customPartyLogoFile) {
        setStatusMessage(
          lang === "bn" ? "দলীয় লোগো আপলোড হচ্ছে..." : "Uploading custom party logo..."
        );
        const logoForm = new FormData();
        logoForm.append("file", customPartyLogoFile);
        const logoRes = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: logoForm,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!logoRes.ok) throw new Error("Failed to upload custom party logo");
        const logoData = await logoRes.json();
        resolvedPartyLogoUrl = logoData.url;
      } else {
        const found = PRESET_PARTY_LOGOS.find((p) => p.id === selectedPresetLogoId);
        resolvedPartyLogoUrl = found ? found.dataUrl : PRESET_PARTY_LOGOS[0].dataUrl;
      }

      // 3. Resolve Extra Logo URL (Optional)
      let resolvedExtraLogoUrl = "";
      if (extraLogoFile) {
        setStatusMessage(
          lang === "bn" ? "অতিরিক্ত লোগো আপলোড হচ্ছে..." : "Uploading extra logo..."
        );
        const extraForm = new FormData();
        extraForm.append("file", extraLogoFile);
        const extraRes = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: extraForm,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (extraRes.ok) {
          const extraData = await extraRes.json();
          resolvedExtraLogoUrl = extraData.url;
        }
      }

      // 4. Call Poster Generation API with Gemini
      setStatusMessage(
        lang === "bn"
          ? "Gemini AI আপনার পছন্দের প্রম্পট ও রঙে পোস্টার বানাচ্ছে..."
          : "Gemini AI is generating your customized poster design..."
      );

      const posterRes = await apiFetch<{ posterId: string; imageUrl?: string }>("/posters", {
        method: "POST",
        token,
        body: {
          templateId,
          formData: {
            ...formData,
            partyLogoUrl: resolvedPartyLogoUrl,
            extraLogoUrl: resolvedExtraLogoUrl,
            photoDetails: photoFiles.map((_, i) => ({
              role: photoDetails[i]?.role || (i === 0 ? "প্রধান নেতা" : "সদস্য"),
              name: photoDetails[i]?.name || "",
            })),
          },
          photoUrls,
          ...(paymentId ? { paymentId } : {}),
        },
      });

      router.push(`/poster/${posterRes.posterId}`);
    } catch (err: any) {
      setError(
        err.message ||
          (lang === "bn" ? "পোস্টার তৈরিতে সমস্যা হয়েছে" : "Poster generation encountered an issue")
      );
      setLoading(false);
    }
  };

  // Bulk CSV Generation Handler
  const handleBulkCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvFile) {
      alert(lang === "bn" ? "অনুগ্রহ করে একটি CSV ফাইল আপলোড করুন" : "Please upload a CSV file");
      return;
    }
    setLoading(true);
    setStatusMessage(lang === "bn" ? "CSV প্রসেস করা হচ্ছে..." : "Processing CSV file...");

    try {
      const text = await bulkCsvFile.text();
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const results = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const rowData: any = {};
        headers.forEach((h, idx) => {
          rowData[h] = values[idx] || "";
        });

        setStatusMessage(
          lang === "bn"
            ? `ব্যাচ পোস্টার তৈরি হচ্ছে (${i}/${lines.length - 1}): ${rowData.name || "সদস্য"}...`
            : `Generating bulk poster (${i}/${lines.length - 1}): ${rowData.name || "Member"}...`
        );

        const foundPreset = PRESET_PARTY_LOGOS.find((p) => p.id === selectedPresetLogoId);

        const res = await apiFetch<{ posterId: string; imageUrl?: string }>("/posters", {
          method: "POST",
          token,
          body: {
            templateId,
            formData: {
              name: rowData.name || "সম্মানিত নেতা",
              designation: rowData.designation || "সদস্য",
              party: rowData.party || formData.party || "বাংলাদেশ আওয়ামী লীগ / বিএনপি",
              district: rowData.district || formData.district,
              headline: rowData.headline || formData.headline || "শুভেচ্ছা ও অভিনন্দন",
              userDesignPrompt: formData.userDesignPrompt,
              partyLogoUrl: foundPreset?.dataUrl,
            },
            photoUrls: previewUrls.length > 0 ? previewUrls : [],
          },
        });
        results.push({ name: rowData.name, posterId: res.posterId, imageUrl: res.imageUrl });
      }

      setBulkResults(results);
    } catch (err: any) {
      setError(
        lang === "bn"
          ? "বাল্ক জেনারেশন ব্যর্থ হয়েছে: " + err.message
          : "Bulk generation failed: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (!templateId) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 ios-glass-card text-center">
        <h2 className="text-xl font-bold mb-4">{t.create.noTemplateTitle}</h2>
        <p className="text-slate-500 mb-6 text-sm">{t.create.noTemplateDesc}</p>
        <Link
          href="/templates"
          className="inline-flex px-6 py-3 rounded-2xl ios-btn-primary font-bold text-sm shadow transition"
        >
          {t.create.goToGallery}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="ios-glass-card p-6 sm:p-10 shadow-2xl">
        {/* Header Bar */}
        <div className="border-b border-white/60 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
              {t.create.badge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {template?.title || t.create.formTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowBulkUpload(!showBulkUpload)}
              className="text-xs px-3.5 py-2 rounded-xl ios-glass-btn text-purple-700 font-bold border border-purple-300/50 hover:bg-purple-50 transition cursor-pointer"
            >
              {showBulkUpload ? t.create.normalMode : t.create.bulkMode}
            </button>
            <Link
              href="/templates"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              {t.create.otherTemplates}
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 text-sm flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* BULK CSV GENERATION MODE */}
        {showBulkUpload ? (
          <form onSubmit={handleBulkCsv} className="space-y-6">
            <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-950 text-xs leading-relaxed">
              <span className="font-bold block text-sm mb-1">
                {lang === "bn" ? "বাল্ক পোস্টার জেনারেটর (CSV Batch)" : "Bulk Poster Generator (CSV Batch)"}
              </span>
              {lang === "bn"
                ? "একসাথে স্থানীয় কমিটির ১০০+ সদস্যের জন্য আলাদা পোস্টার তৈরি করুন। CSV ফাইলে হেডার হিসেবে "
                : "Create individual posters for 100+ committee members at once. Provide a CSV file with headers: "}
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono font-bold">
                name, designation, party, district, headline
              </code>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {lang === "bn" ? "কমিটির CSV ফাইল আপলোড করুন" : "Upload Committee CSV File"}
              </label>
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setBulkCsvFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-lg hover:shadow-xl transition disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? statusMessage
                : lang === "bn"
                ? "বাল্ক পোস্টার জেনারেট শুরু করুন ⚡"
                : "Start Bulk Poster Generation ⚡"}
            </button>

            {bulkResults && (
              <div className="mt-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 space-y-2">
                <span className="font-bold text-xs text-emerald-900">
                  {lang === "bn" ? "✅ তৈরি হওয়া পোস্টারসমূহ:" : "✅ Generated Posters:"}
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {bulkResults.map((r, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-xs bg-white/80 p-2.5 rounded-xl border border-slate-200"
                    >
                      <span className="font-semibold">{r.name}</span>
                      <Link
                        href={`/poster/${r.posterId}`}
                        target="_blank"
                        className="text-emerald-700 font-bold underline"
                      >
                        {lang === "bn" ? "দেখুন ↗" : "View ↗"}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        ) : (
          /* STANDARD POSTER FORM */
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* ═══════════ SECTION 1: AI DESIGN & COLOR PREFERENCE PROMPT ═══════════ */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-emerald-50/60 border-2 border-indigo-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-indigo-950">
                    {t.create.aiPromptTitle}
                  </h3>
                  <p className="text-xs text-indigo-800/80 mt-0.5">
                    {t.create.aiPromptSub}
                  </p>
                </div>
              </div>

              <textarea
                name="userDesignPrompt"
                rows={2}
                placeholder={t.create.aiPromptPlaceholder}
                value={formData.userDesignPrompt}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl ios-glass-input text-sm text-slate-800 font-medium placeholder-slate-400 resize-none"
              />

              {/* Quick Prompt Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  {t.create.aiPresetTitle}
                </span>
                <div className="flex flex-wrap gap-2">
                  {DESIGN_PROMPT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          userDesignPrompt:
                            lang === "bn" ? preset.bn : preset.en,
                        }))
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-xs hover:border-indigo-400 hover:text-indigo-700 transition cursor-pointer"
                    >
                      <span>{preset.icon}</span>
                      <span>{lang === "bn" ? preset.bn : preset.en}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 2: CANDIDATE INFO ═══════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.create.nameLabel}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={t.create.namePlaceholder}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 ios-glass-input text-sm text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.create.designationLabel}
                </label>
                <input
                  type="text"
                  name="designation"
                  required
                  placeholder={t.create.designationPlaceholder}
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 ios-glass-input text-sm text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.create.partyLabel}
                </label>
                <input
                  type="text"
                  name="party"
                  required
                  placeholder={t.create.partyPlaceholder}
                  value={formData.party}
                  onChange={handleChange}
                  className="w-full px-4 py-3 ios-glass-input text-sm text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.create.districtLabel}
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder={t.create.districtPlaceholder}
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-3 ios-glass-input text-sm text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* ═══════════ SECTION 3: HEADLINE & BANGLA FONT & LAYOUT ═══════════ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.create.headlineLabel}
              </label>
              <textarea
                name="headline"
                required
                rows={2}
                placeholder={t.create.headlinePlaceholder}
                value={formData.headline}
                onChange={handleChange}
                className="w-full px-4 py-3 ios-glass-input text-sm text-slate-900 font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-2xl bg-white/60 border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  {t.create.fontLabel}
                </label>
                <select
                  name="headlineFont"
                  value={formData.headlineFont}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Tiro Bangla">Tiro Bangla (ঐতিহ্যবাহী সেরা সেরিফ)</option>
                  <option value="Hind Siliguri">Hind Siliguri (ক্লিন ও বোল্ড)</option>
                  <option value="Anek Bangla">Anek Bangla (আধুনিক ডিসপ্লে)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  {t.create.layoutLabel}
                </label>
                <select
                  name="photoLayout"
                  value={formData.photoLayout}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="cutout">{t.create.layoutCutout}</option>
                  <option value="circle">{t.create.layoutCircle}</option>
                  <option value="grid">{t.create.layoutGrid}</option>
                </select>
              </div>
            </div>

            {/* ═══════════ SECTION 4: MANDATORY POLITICAL PARTY LOGO ═══════════ */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-yellow-50/50 to-orange-50/70 border-2 border-amber-300/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🗳️</span>
                    <h3 className="text-sm font-black text-amber-950">
                      {t.create.partyLogoTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800/80 mt-0.5">
                    {t.create.partyLogoSub}
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-red-600 text-white uppercase tracking-wider shadow-xs">
                  {t.create.partyLogoRequiredBadge}
                </span>
              </div>

              {/* Preset Logos Grid */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-2">
                  {t.create.selectPresetLogo}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESET_PARTY_LOGOS.map((item) => {
                    const isSelected =
                      selectedPresetLogoId === item.id && !customPartyLogoFile;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetLogoId(item.id);
                          setCustomPartyLogoFile(null);
                        }}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                          isSelected
                            ? "bg-amber-100/90 border-amber-600 shadow-md ring-2 ring-amber-500/20"
                            : "bg-white/80 border-slate-200/90 hover:border-amber-300 hover:bg-white"
                        }`}
                      >
                        <img
                          src={item.dataUrl}
                          alt={item.symbolBn}
                          className="w-10 h-10 object-contain shrink-0 rounded-full border border-amber-300/40 bg-white"
                        />
                        <div className="overflow-hidden">
                          <span className="text-xs font-black text-slate-900 block truncate">
                            {lang === "bn" ? item.symbolBn : item.symbolEn}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {lang === "bn" ? item.nameBn : item.nameEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Party Logo Upload */}
              <div className="pt-2 border-t border-amber-200/70">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.create.orUploadCustomLogo}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setCustomPartyLogoFile(f);
                      if (f) setSelectedPresetLogoId("");
                    }}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                  />
                  {customPartyLogoPreview && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-600 bg-white shrink-0">
                      <img
                        src={customPartyLogoPreview}
                        alt="Custom Party Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Extra Organization Logo (Optional) */}
              <div className="pt-3 border-t border-amber-200/70">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">📌</span>
                  <label className="text-xs font-bold text-slate-800">
                    {t.create.extraLogoTitle}
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  {t.create.extraLogoSub}
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setExtraLogoFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                  />
                  {extraLogoPreview && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700 bg-white shrink-0">
                      <img
                        src={extraLogoPreview}
                        alt="Extra Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 5: PHOTOS UPLOAD & PHOTO ROLES ═══════════ */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/70 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {t.create.photoUploadTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.create.photoUploadLimit}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {photoFiles.length}/{MAX_PHOTOS}
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-emerald-400/50 hover:border-emerald-600 rounded-2xl p-6 text-center transition-colors bg-emerald-50/30">
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
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center text-2xl mb-2 border border-emerald-500/30">
                    📸
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {photoFiles.length >= MAX_PHOTOS
                      ? t.create.photoUploadMax
                      : t.create.photoUploadClick}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    JPG, PNG, WebP (Max 8 MB)
                  </span>
                </label>
              </div>

              {/* Photo Previews with Role & Name Assignment */}
              {previewUrls.length > 0 && (
                <div className="space-y-4 pt-2">
                  {previewUrls.map((url, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative w-24 h-28 rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-black shrink-0 shadow-sm">
                        <img
                          src={url}
                          alt={`Leader ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow hover:bg-red-700 cursor-pointer"
                        >
                          ✕
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                          #{i + 1}
                        </div>
                      </div>

                      {/* Photo Designation & Name Inputs */}
                      <div className="flex-1 w-full space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              {t.create.photoRoleLabel}
                            </label>
                            <input
                              type="text"
                              value={photoDetails[i]?.role || ""}
                              onChange={(e) => updatePhotoDetail(i, "role", e.target.value)}
                              placeholder={
                                i === 0
                                  ? "যেমন: প্রধান নেতা / প্রধান অতিথি"
                                  : i === 1
                                  ? "যেমন: সাধারণ সম্পাদক"
                                  : "যেমন: সাধারণ সদস্য"
                              }
                              className="w-full px-3 py-2 rounded-xl ios-glass-input text-xs font-bold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              {t.create.photoNameLabel}
                            </label>
                            <input
                              type="text"
                              value={photoDetails[i]?.name || ""}
                              onChange={(e) => updatePhotoDetail(i, "name", e.target.value)}
                              placeholder="যেমন: তারেক রহমান / ওবায়দুল কাদের"
                              className="w-full px-3 py-2 rounded-xl ios-glass-input text-xs font-medium text-slate-800"
                            />
                          </div>
                        </div>

                        {/* Quick Role Buttons */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {QUICK_ROLES.map((qr, qIdx) => (
                            <button
                              key={qIdx}
                              type="button"
                              onClick={() =>
                                updatePhotoDetail(i, "role", lang === "bn" ? qr.bn : qr.en)
                              }
                              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer"
                            >
                              {lang === "bn" ? qr.bn : qr.en}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ═══════════ SECTION 6: WATERMARK REMOVAL (bKash / Nagad) ═══════════ */}
            <div className="rounded-2xl border-2 border-amber-300/90 overflow-hidden shadow-xs">
              <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-black text-white tracking-wide uppercase">
                  {t.create.watermarkTitle}
                </span>
                <span className="text-[11px] bg-white/25 text-white font-black px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  {t.create.watermarkPrice}
                </span>
              </div>

              <div className="p-4 bg-amber-50/80">
                {paymentSuccess && paymentId ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl shrink-0">
                      ✅
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">
                        {t.create.watermarkPaidMsg}
                      </p>
                      <p className="text-[11px] text-emerald-600 mt-0.5">
                        {t.create.watermarkVerifiedBadge}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-200/80 flex items-center justify-center text-xl shrink-0">
                        💳
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {t.create.watermarkUnpaidTitle}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {t.create.watermarkUnpaidDesc}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(true);
                        setPaymentError(null);
                        setPaymentSuccess(false);
                      }}
                      className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-black shadow-lg shadow-pink-600/20 hover:shadow-xl transition-all cursor-pointer"
                    >
                      {t.create.payBtn}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ═══════════ SUBMIT BUTTON ═══════════ */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl ios-btn-primary font-black text-base shadow-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? statusMessage || t.create.generatingMsg
                : paymentId
                ? t.create.generateBtnPaid
                : t.create.generateBtnFree}
            </button>
          </form>
        )}
      </div>

      {/* ═══════════ bKash / Nagad PAYMENT MODAL ═══════════ */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => !paymentLoading && setShowPaymentModal(false)}
          />

          <div className="relative w-full max-w-md ios-glass-card bg-white/95 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 p-5 text-center text-white">
              <h3 className="text-lg font-black tracking-wide">
                {lang === "bn" ? "💳 ওয়াটারমার্ক রিমুভাল পেমেন্ট" : "💳 Watermark Removal Payment"}
              </h3>
              <p className="text-pink-100 text-xs mt-1 font-medium">
                {lang === "bn"
                  ? `মাত্র ${WATERMARK_PRICE} টাকা পেমেন্ট করে প্রিমিয়াম পোস্টার পান`
                  : `Pay only ${WATERMARK_PRICE} BDT to get premium watermark-free poster`}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Gateway Tabs */}
              <div className="flex rounded-2xl overflow-hidden border-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentGateway("bkash")}
                  className={`flex-1 py-3 text-center text-sm font-black transition-all cursor-pointer ${
                    paymentGateway === "bkash"
                      ? "bg-pink-600 text-white shadow-inner"
                      : "bg-white text-slate-600 hover:bg-pink-50"
                  }`}
                >
                  🟢 বিকাশ (bKash)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway("nagad")}
                  className={`flex-1 py-3 text-center text-sm font-black transition-all cursor-pointer ${
                    paymentGateway === "nagad"
                      ? "bg-orange-600 text-white shadow-inner"
                      : "bg-white text-slate-600 hover:bg-orange-50"
                  }`}
                >
                  🟠 নগদ (Nagad)
                </button>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-slate-900">
                  {lang === "bn" ? "পেমেন্ট করার নিয়মাবলী:" : "Payment Instructions:"}
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>
                    {paymentGateway === "bkash" ? "বিকাশ" : "নগদ"}{" "}
                    {lang === "bn" ? "অ্যাপে যান এবং 'Send Money' সিলেক্ট করুন।" : "App > Select 'Send Money'."}
                  </li>
                  <li>
                    {lang === "bn" ? "মার্চেন্ট নম্বর: " : "Number: "}
                    <strong className="text-slate-900 font-mono">01700-000000</strong>
                  </li>
                  <li>
                    {lang === "bn" ? "টাকার পরিমাণ: " : "Amount: "}
                    <strong className="text-slate-900 font-mono">{WATERMARK_PRICE} BDT</strong>
                  </li>
                  <li>
                    {lang === "bn" ? "পেমেন্ট শেষে প্রাপ্ত TrxID নিচে দিন।" : "Enter received TrxID below."}
                  </li>
                </ol>
              </div>

              {paymentError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  ⚠️ {paymentError}
                </div>
              )}

              {paymentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
                  ✅ {lang === "bn" ? "পেমেন্ট সফলভাবে যাচাই হয়েছে!" : "Payment verified successfully!"}
                </div>
              )}

              {/* Form Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {lang === "bn" ? "বিকাশ/নগদ মোবাইল নম্বর *" : "bKash / Nagad Mobile Number *"}
                  </label>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    maxLength={14}
                    className="w-full px-4 py-2.5 rounded-xl ios-glass-input text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {lang === "bn" ? "ট্রানজেকশন আইডি (TrxID) *" : "Transaction ID (TrxID) *"}
                  </label>
                  <input
                    type="text"
                    placeholder={paymentGateway === "bkash" ? "যেমন: BLK9XYZ12" : "যেমন: 7XYZ4ABC"}
                    value={paymentTxnId}
                    onChange={(e) => setPaymentTxnId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl ios-glass-input text-sm font-mono uppercase"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentLoading}
                  className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handlePaymentSubmit}
                  disabled={paymentLoading || paymentSuccess}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs shadow hover:shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {paymentLoading
                    ? lang === "bn" ? "যাচাই হচ্ছে..." : "Verifying..."
                    : paymentSuccess
                    ? lang === "bn" ? "যাচাই সম্পন্ন ✓" : "Verified ✓"
                    : lang === "bn" ? "পেমেন্ট নিশ্চিত করুন" : "Verify Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePosterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      }
    >
      <PosterForm />
    </Suspense>
  );
}
