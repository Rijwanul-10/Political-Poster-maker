"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface AdminStats {
  totalUsers: number;
  totalPosters: number;
  completedPosters: number;
  totalTemplates: number;
}

interface TemplateItem {
  _id: string;
  title: string;
  occasionType: string;
  thumbnailUrl: string;
  isActive: boolean;
  createdAt: string;
}

interface ModerationPoster {
  _id: string;
  userId?: {
    name: string;
    email?: string;
    phone?: string;
  };
  templateId?: {
    title: string;
  };
  formData?: {
    name?: string;
    party?: string;
    headline?: string;
  };
  generatedImageUrl?: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "templates" | "moderation">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [posters, setPosters] = useState<ModerationPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Template Form State
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOccasion, setNewOccasion] = useState("election_campaign");
  const [newThumbnail, setNewThumbnail] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push("/login?redirect=/admin");
        return;
      }
      loadAdminData();
    }
  }, [token, authLoading, router]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, templatesData, postersData] = await Promise.all([
        apiFetch<AdminStats>("/admin/stats", { token }),
        apiFetch<TemplateItem[]>("/admin/templates", { token }),
        apiFetch<ModerationPoster[]>("/admin/posters", { token }),
      ]);
      setStats(statsData);
      setTemplates(templatesData);
      setPosters(postersData);
    } catch (err: any) {
      setError(err.message || "অ্যাডমিন ডেটা লোড করা যায়নি (অ্যাডমিন পারমিশন প্রয়োজন)");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiFetch<TemplateItem>("/admin/templates", {
        method: "POST",
        token,
        body: {
          title: newTitle,
          occasionType: newOccasion,
          thumbnailUrl: newThumbnail || "https://res.cloudinary.com/demo/image/upload/v1/thumbnail_custom.jpg",
          isActive: true,
        },
      });
      setTemplates([created, ...templates]);
      setShowAddTemplate(false);
      setNewTitle("");
      setNewThumbnail("");
      alert("নতুন টেমপ্লেট সফলভাবে যোগ করা হয়েছে!");
    } catch (err: any) {
      alert("টেমপ্লেট তৈরি ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const handleToggleTemplate = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await apiFetch<TemplateItem>(`/admin/templates/${id}`, {
        method: "PATCH",
        token,
        body: { isActive: !currentStatus },
      });
      setTemplates(templates.map((t) => (t._id === id ? updated : t)));
    } catch (err: any) {
      alert("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই টেমপ্লেটটি মুছে ফেলতে চান?")) return;
    try {
      await apiFetch(`/admin/templates/${id}`, {
        method: "DELETE",
        token,
      });
      setTemplates(templates.filter((t) => t._id !== id));
    } catch (err: any) {
      alert("মুছে ফেলা ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const handleModerateDelete = async (id: string) => {
    if (!confirm("নিয়মবহির্ভূত বা আপত্তিকর কনটেন্ট হিসেবে এই পোস্টারটি মুছে ফেলতে চান?")) return;
    try {
      await apiFetch(`/admin/posters/${id}`, {
        method: "DELETE",
        token,
      });
      setPosters(posters.filter((p) => p._id !== id));
      alert("পোস্টারটি সফলভাবে মডারেট করে মুছে ফেলা হয়েছে");
    } catch (err: any) {
      alert("মডারেশন ব্যর্থ হয়েছে: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">অ্যাডমিন ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl mx-auto mb-4 shadow">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">অ্যাডমিন অ্যাক্সেস প্রয়োজন</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          অ্যাডমিন কনসোলে প্রবেশ করার জন্য অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করতে হবে।
        </p>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-left text-xs mb-6 space-y-1">
          <div className="font-bold text-emerald-900">ডিফল্ট অ্যাডমিন একাউন্ট:</div>
          <div className="font-mono text-slate-700">ইমেইল: <span className="font-bold">admin@poster-maker.com</span></div>
          <div className="font-mono text-slate-700">পাসওয়ার্ড: <span className="font-bold">AdminPassword@123</span></div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/admin/login"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition"
          >
            অ্যাডমিন লগইন করুন →
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
          >
            হোমপেজে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
            <span>🛡️ অ্যাডমিন কনসোল</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            পোস্টার কারিগর অ্যাডমিন প্যানেল
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            টেমপ্লেট ব্যবস্থাপনা, কনটেন্ট মডারেশন এবং সিস্টেম অ্যানালিটিক্স
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
            }`}
          >
            📊 ওভারভিউ
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "templates" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
            }`}
          >
            🎨 টেমপ্লেট CRUD ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab("moderation")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "moderation" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
            }`}
          >
            🚨 কনটেন্ট মডারেশন ({posters.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট ব্যবহারকারী</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalUsers}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">রেজিস্ট্রেশন কাউন্ট</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট তৈরি পোস্টার</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalPosters}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">সফল: {stats.completedPosters}</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">সক্রিয় টেমপ্লেট</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalTemplates}</div>
              <span className="text-[11px] text-blue-600 font-semibold mt-1 block">কমিউনিটি রেডি</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI রেন্ডার সাকসেস</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {stats.totalPosters > 0 ? Math.round((stats.completedPosters / stats.totalPosters) * 100) : 100}%
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Puppeteer + Gemini Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES MANAGEMENT */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">সিস্টেম টেমপ্লেট তালিকা</h2>
            <button
              onClick={() => setShowAddTemplate(!showAddTemplate)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
            >
              {showAddTemplate ? "বাতিল করুন" : "+ নতুন টেমপ্লেট যোগ করুন"}
            </button>
          </div>

          {showAddTemplate && (
            <form onSubmit={handleCreateTemplate} className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-md space-y-4">
              <h3 className="font-bold text-sm text-slate-900">নতুন পোস্টার টেমপ্লেট তথ্য</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder="টেমপ্লেট শিরোনাম"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border text-xs"
                />
                <select
                  value={newOccasion}
                  onChange={(e) => setNewOccasion(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border text-xs"
                >
                  <option value="election_campaign">নির্বাচনী প্রচারণা</option>
                  <option value="political_rally">দলীয় সমাবেশ</option>
                  <option value="bijoy_dibosh">বিজয় দিবস</option>
                  <option value="eid_utsob">ঈদ উৎসব</option>
                  <option value="shok_dibosh">শোক দিবস</option>
                </select>
                <input
                  type="url"
                  placeholder="থাম্বনেইল ইমেজ URL (ঐচ্ছিক)"
                  value={newThumbnail}
                  onChange={(e) => setNewThumbnail(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border text-xs"
                />
              </div>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow">
                সংরক্ষণ করুন
              </button>
            </form>
          )}

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b text-slate-900 uppercase font-semibold">
                <tr>
                  <th className="p-4">শিরোনাম</th>
                  <th className="p-4">উপলক্ষ (Occasion)</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {templates.map((tmpl) => (
                  <tr key={tmpl._id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{tmpl.title}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold">{tmpl.occasionType}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          tmpl.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {tmpl.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleTemplate(tmpl._id, tmpl.isActive)}
                        className="px-3 py-1 rounded-lg border text-xs hover:bg-slate-100"
                      >
                        {tmpl.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(tmpl._id)}
                        className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100"
                      >
                        মুছুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT MODERATION QUEUE */}
      {activeTab === "moderation" && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
            <span className="font-bold block text-sm mb-1">🚨 কনটেন্ট মডারেশন কিউ</span>
            এখানে সিস্টেমের সকল ব্যবহারকারীর তৈরি সাম্প্রতিক পোস্টারগুলো প্রদর্শিত হচ্ছে। কোনো আপত্তিকর, মানহানিকর বা নিষিদ্ধ রাজনৈতিক স্লোগান চিহ্নিত হলে সরাসরি সার্ভার থেকে মুছে দিতে পারেন।
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posters.map((poster) => (
              <div key={poster._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-4 space-y-3">
                <div className="aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden relative">
                  {poster.generatedImageUrl ? (
                    <img src={poster.generatedImageUrl} alt="Poster" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">ছবি নেই</div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{poster.formData?.headline || "পোস্টার"}</h4>
                  <p className="text-xs text-slate-500">প্রার্থী: {poster.formData?.name} ({poster.formData?.party})</p>
                  <p className="text-[11px] text-slate-400 mt-1">ব্যবহারকারী: {poster.userId?.name || "User"} ({poster.userId?.email || ""})</p>
                </div>

                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">{new Date(poster.createdAt).toLocaleDateString("bn-BD")}</span>
                  <button
                    onClick={() => handleModerateDelete(poster._id)}
                    className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    ফ্ল্যাগ করে মুছুন ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
