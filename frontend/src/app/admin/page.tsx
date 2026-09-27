"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface RecentUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  isEmailVerified?: boolean;
  createdAt: string;
}

interface RecentPoster {
  _id: string;
  userId?: {
    _id?: string;
    name: string;
    email?: string;
    phone?: string;
  };
  templateId?: {
    _id?: string;
    title: string;
    occasionType: string;
  };
  formData?: {
    name?: string;
    party?: string;
    headline?: string;
    watermark?: boolean;
    occasionType?: string;
  };
  generatedImageUrl?: string;
  status: string;
  createdAt: string;
}

interface RecentPayment {
  _id: string;
  userId?: {
    name: string;
    email?: string;
  };
  amount: number;
  currency: string;
  gateway: string;
  gatewayTxnId: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
}

interface RecentLog {
  _id: string;
  posterId: string;
  geminiPromptUsed: string;
  tokensUsed: number;
  latencyMs: number;
  success: boolean;
  cached?: boolean;
  createdAt: string;
}

interface SystemInfo {
  nodeVersion: string;
  uptimeSeconds: number;
  memoryMb: number;
  model: string;
  platform: string;
  serverTime: string;
}

interface AdminStats {
  totalUsers: number;
  verifiedUsers?: number;
  totalPosters: number;
  completedPosters: number;
  failedPosters?: number;
  totalTemplates: number;
  activeTemplates?: number;
  totalPayments?: number;
  totalRevenue?: number;
  recentUsers?: RecentUser[];
  recentPosters?: RecentPoster[];
  recentPayments?: RecentPayment[];
  recentLogs?: RecentLog[];
  systemInfo?: SystemInfo;
}

interface TemplateItem {
  _id: string;
  title: string;
  occasionType: string;
  thumbnailUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const { lang, setLang } = useLanguage();

  const [activeTab, setActiveTab] = useState<"overview" | "templates" | "moderation">("overview");
  const [overviewSubTab, setOverviewSubTab] = useState<"users" | "posters" | "payments" | "logs">("users");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [posters, setPosters] = useState<RecentPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Template Form State
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOccasion, setNewOccasion] = useState("election_campaign");
  const [newThumbnail, setNewThumbnail] = useState("");

  const T = {
    bn: {
      badge: "🛡️ অ্যাডমিন কনসোল",
      title: "পোস্টার কারিগর অ্যাডমিন প্যানেল",
      subtitle: "টেমপ্লেট ব্যবস্থাপনা, কনটেন্ট মডারেশন এবং সিস্টেম অ্যানালিটিক্স",
      tabOverview: "📊 ওভারভিউ ও ডেটা",
      tabTemplates: "🎨 টেমপ্লেট CRUD",
      tabModeration: "🚨 কনটেন্ট মডারেশন",
      loadingDashboard: "অ্যাডমিন ড্যাশবোর্ড লোড হচ্ছে...",
      accessRequiredTitle: "অ্যাডমিন অ্যাক্সেস প্রয়োজন",
      accessRequiredDesc: "অ্যাডমিন কনসোলে প্রবেশ করার জন্য অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করতে হবে।",
      defaultAdminTitle: "ডিফল্ট অ্যাডমিন একাউন্ট:",
      emailLabel: "ইমেইল:",
      passwordLabel: "পাসওয়ার্ড:",
      loginAdminBtn: "অ্যাডমিন লগইন করুন →",
      backHomeBtn: "হোমপেজে ফিরে যান",
      
      // Overview stats
      statUsers: "মোট ব্যবহারকারী",
      statVerified: "ইমেইল ভেরিফাইড",
      statPosters: "মোট তৈরি পোস্টার",
      statSuccessRate: "সফল:",
      statFailed: "ব্যর্থ:",
      statTemplates: "সক্রিয় টেমপ্লেট",
      statTemplatesSub: "কমিউনিটি রেডি",
      statRevenue: "মোট অর্জিত রাজস্ব",
      statRevenueSub: "বিকাশ ও নগদ পেমেন্ট",
      statAiLatency: "AI গড় রেন্ডার গতি",
      statAiSuccessRate: "সফলতার হার",
      
      // System diagnostics
      systemDiagTitle: "🖥️ সিস্টেম স্থিতি ও সার্ভার ডায়াগনস্টিকস",
      dbStatus: "ডাটাবেস:",
      dbConnected: "MongoDB Atlas সংযুক্ত ✓",
      aiEngine: "AI মডেল:",
      puppeteerEngine: "রেন্ডার ইঞ্জিন:",
      puppeteerReady: "Puppeteer Headless Chrome সক্রিয় ✓",
      nodeEnv: "Node ভার্সন:",
      serverUptime: "সার্ভার আপটাইম:",
      serverTime: "সার্ভার টাইম:",
      
      // Overview sub-tables
      subUsers: "সাম্প্রতিক ব্যবহারকারী",
      subPosters: "সাম্প্রতিক পোস্টার",
      subPayments: "লেনদেন ও পেমেন্ট",
      subLogs: "AI ইঞ্জিন লগ",
      
      // Table headers
      thName: "নাম",
      thEmailPhone: "ইমেইল / ফোন",
      thRole: "রোল",
      thStatus: "ভেরিফিকেশন",
      thJoined: "যোগদানের তারিখ",
      thPoster: "পোস্টার শিরোনাম",
      thCandidate: "প্রার্থী / দল",
      thOccasion: "উপলক্ষ",
      thWatermark: "ওয়াটারমার্ক",
      thTime: "সময়",
      thAction: "অ্যাকশন",
      thTrxId: "TrxID",
      thUser: "ব্যবহারকারী",
      thGateway: "গেটওয়ে",
      thAmount: "পরিমাণ",
      thPrompt: "ব্যবহৃত প্রম্পট",
      thTokens: "টোকেন",
      thLatency: "লেটেন্সি",
      thResult: "ফলাফল",
      
      // Template management
      tmplListTitle: "সিস্টেম টেমপ্লেট তালিকা",
      addTmplBtn: "+ নতুন টেমপ্লেট যোগ করুন",
      cancelBtn: "বাতিল করুন",
      saveBtn: "সংরক্ষণ করুন",
      tmplFormTitle: "নতুন পোস্টার টেমপ্লেট তথ্য",
      tmplTitlePlaceholder: "টেমপ্লেট শিরোনাম",
      tmplThumbPlaceholder: "থাম্বনেইল ইমেজ URL (ঐচ্ছিক)",
      tmplActive: "সক্রিয়",
      tmplInactive: "নিষ্ক্রিয়",
      tmplActivate: "সক্রিয় করুন",
      tmplDeactivate: "নিষ্ক্রিয় করুন",
      tmplDelete: "মুছুন",
      
      // Moderation
      modQueueTitle: "🚨 কনটেন্ট মডারেশন কিউ",
      modQueueNotice: "এখানে সিস্টেমের সকল ব্যবহারকারীর তৈরি সাম্প্রতিক পোস্টারগুলো প্রদর্শিত হচ্ছে। কোনো আপত্তিকর, মানহানিকর বা নিষিদ্ধ রাজনৈতিক স্লোগান চিহ্নিত হলে সরাসরি সার্ভার থেকে মুছে দিতে পারেন।",
      candidatePrefix: "প্রার্থী:",
      userPrefix: "ব্যবহারকারী:",
      flagDeleteBtn: "ফ্ল্যাগ করে মুছুন ✕",
      noImage: "ছবি নেই",
      viewPoster: "দেখুন ↗",
      
      // Occasions
      occElection: "নির্বাচনী প্রচারণা",
      occRally: "দলীয় সমাবেশ",
      occBijoy: "বিজয় দিবস",
      occEid: "ঈদ উৎসব",
      occShok: "শোক দিবস",
      
      // Alerts
      createdSuccess: "নতুন টেমপ্লেট সফলভাবে যোগ করা হয়েছে!",
      statusUpdateFail: "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে: ",
      deleteConfirm: "আপনি কি নিশ্চিতভাবে এই টেমপ্লেটটি মুছে ফেলতে চান?",
      moderateConfirm: "নিয়মবহির্ভূত বা আপত্তিকর কনটেন্ট হিসেবে এই পোস্টারটি মুছে ফেলতে চান?",
      moderateSuccess: "পোস্টারটি সফলভাবে মডারেট করে মুছে ফেলা হয়েছে",
    },
    en: {
      badge: "🛡️ Admin Console",
      title: "Poster Karigor Admin Panel",
      subtitle: "Template management, content moderation, and system telemetry",
      tabOverview: "📊 Overview & Data",
      tabTemplates: "🎨 Templates CRUD",
      tabModeration: "🚨 Content Moderation",
      loadingDashboard: "Loading Admin Dashboard...",
      accessRequiredTitle: "Admin Access Required",
      accessRequiredDesc: "Please sign in with an administrator account to access the administration console.",
      defaultAdminTitle: "Default Admin Credentials:",
      emailLabel: "Email:",
      passwordLabel: "Password:",
      loginAdminBtn: "Sign In as Admin →",
      backHomeBtn: "Return to Homepage",
      
      // Overview stats
      statUsers: "Total Users",
      statVerified: "Email Verified",
      statPosters: "Total Posters Created",
      statSuccessRate: "Success:",
      statFailed: "Failed:",
      statTemplates: "Active Templates",
      statTemplatesSub: "Community Ready",
      statRevenue: "Total Revenue Earned",
      statRevenueSub: "bKash & Nagad payments",
      statAiLatency: "AI Avg Latency",
      statAiSuccessRate: "Success Rate",
      
      // System diagnostics
      systemDiagTitle: "🖥️ System Health & Server Diagnostics",
      dbStatus: "Database:",
      dbConnected: "MongoDB Atlas Connected ✓",
      aiEngine: "AI Engine:",
      puppeteerEngine: "Render Engine:",
      puppeteerReady: "Puppeteer Headless Chrome Active ✓",
      nodeEnv: "Node Version:",
      serverUptime: "Server Uptime:",
      serverTime: "Server Time:",
      
      // Overview sub-tables
      subUsers: "Recent Users",
      subPosters: "Recent Posters",
      subPayments: "Transactions & Payments",
      subLogs: "AI Engine Logs",
      
      // Table headers
      thName: "Name",
      thEmailPhone: "Email / Phone",
      thRole: "Role",
      thStatus: "Verification",
      thJoined: "Joined Date",
      thPoster: "Poster Headline",
      thCandidate: "Candidate / Party",
      thOccasion: "Occasion",
      thWatermark: "Watermark",
      thTime: "Time",
      thAction: "Action",
      thTrxId: "TrxID",
      thUser: "User",
      thGateway: "Gateway",
      thAmount: "Amount",
      thPrompt: "Prompt Excerpt",
      thTokens: "Tokens",
      thLatency: "Latency",
      thResult: "Status",
      
      // Template management
      tmplListTitle: "System Templates Directory",
      addTmplBtn: "+ Add New Template",
      cancelBtn: "Cancel",
      saveBtn: "Save Template",
      tmplFormTitle: "New Template Specifications",
      tmplTitlePlaceholder: "Template Title",
      tmplThumbPlaceholder: "Thumbnail Image URL (optional)",
      tmplActive: "Active",
      tmplInactive: "Inactive",
      tmplActivate: "Activate",
      tmplDeactivate: "Deactivate",
      tmplDelete: "Delete",
      
      // Moderation
      modQueueTitle: "🚨 Content Moderation Queue",
      modQueueNotice: "Live feed of user-generated posters across all accounts. Any defamatory, unlawful, or unauthorized propaganda can be immediately purged from the server.",
      candidatePrefix: "Candidate:",
      userPrefix: "User:",
      flagDeleteBtn: "Flag & Delete ✕",
      noImage: "No image",
      viewPoster: "View ↗",
      
      // Occasions
      occElection: "Election Campaign",
      occRally: "Political Rally",
      occBijoy: "Victory Day",
      occEid: "Eid Festival",
      occShok: "Condolence & Memorial",
      
      // Alerts
      createdSuccess: "New template added successfully!",
      statusUpdateFail: "Status update failed: ",
      deleteConfirm: "Are you sure you want to permanently delete this template?",
      moderateConfirm: "Are you sure you want to purge this poster as defamatory or policy-violating?",
      moderateSuccess: "Poster purged successfully from system",
    },
  };

  const t = T[lang] || T.bn;

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push("/admin/login");
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
        apiFetch<RecentPoster[]>("/admin/posters", { token }),
      ]);
      setStats(statsData);
      setTemplates(templatesData);
      setPosters(postersData);
    } catch (err: any) {
      setError(err.message || (lang === "bn" ? "অ্যাডমিন ডেটা লোড করা যায়নি" : "Failed to load admin data"));
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
      alert(t.createdSuccess);
    } catch (err: any) {
      alert((lang === "bn" ? "টেমপ্লেট তৈরি ব্যর্থ হয়েছে: " : "Template creation failed: ") + err.message);
    }
  };

  const handleToggleTemplate = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await apiFetch<TemplateItem>(`/admin/templates/${id}`, {
        method: "PATCH",
        token,
        body: { isActive: !currentStatus },
      });
      setTemplates(templates.map((tmpl) => (tmpl._id === id ? updated : tmpl)));
    } catch (err: any) {
      alert(t.statusUpdateFail + err.message);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await apiFetch(`/admin/templates/${id}`, {
        method: "DELETE",
        token,
      });
      setTemplates(templates.filter((tmpl) => tmpl._id !== id));
    } catch (err: any) {
      alert((lang === "bn" ? "মুছে ফেলা ব্যর্থ হয়েছে: " : "Delete failed: ") + err.message);
    }
  };

  const handleModerateDelete = async (id: string) => {
    if (!confirm(t.moderateConfirm)) return;
    try {
      await apiFetch(`/admin/posters/${id}`, {
        method: "DELETE",
        token,
      });
      setPosters(posters.filter((p) => p._id !== id));
      if (stats?.recentPosters) {
        setStats({
          ...stats,
          recentPosters: stats.recentPosters.filter((p) => p._id !== id),
        });
      }
      alert(t.moderateSuccess);
    } catch (err: any) {
      alert((lang === "bn" ? "মডারেশন ব্যর্থ হয়েছে: " : "Moderation failed: ") + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">{t.loadingDashboard}</p>
      </div>
    );
  }

  if (error || (user && user.role !== "admin")) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl mx-auto mb-4 shadow">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{t.accessRequiredTitle}</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{t.accessRequiredDesc}</p>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-left text-xs mb-6 space-y-1">
          <div className="font-bold text-emerald-900">{t.defaultAdminTitle}</div>
          <div className="font-mono text-slate-700">
            {t.emailLabel} <span className="font-bold">admin@poster-maker.com</span>
          </div>
          <div className="font-mono text-slate-700">
            {t.passwordLabel} <span className="font-bold">AdminPassword@123</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/admin/login"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition"
          >
            {t.loginAdminBtn}
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
          >
            {t.backHomeBtn}
          </Link>
        </div>
      </div>
    );
  }

  // Calculate overview metrics safely
  const totalUsers = stats?.totalUsers || 0;
  const verifiedUsers = stats?.verifiedUsers || 0;
  const totalPosters = stats?.totalPosters || 0;
  const completedPosters = stats?.completedPosters || 0;
  const failedPosters = stats?.failedPosters || 0;
  const successRate = totalPosters > 0 ? Math.round((completedPosters / totalPosters) * 100) : 100;
  const totalRevenue = stats?.totalRevenue || 0;
  const activeTemplates = stats?.activeTemplates || templates.filter((x) => x.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2 shadow-sm">
            <span>{t.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.tabOverview}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "templates"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.tabTemplates} ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("moderation")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "moderation"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.tabModeration} ({posters.length})
          </button>
        </div>
      </div>

      {/* TAB 1: COMPLETE OVERVIEW & ALL DATA DISPLAY */}
      {activeTab === "overview" && stats && (
        <div className="space-y-8">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Users Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.statUsers}
              </span>
              <div className="text-3xl font-black text-slate-900 mt-2">{totalUsers}</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                ✓ {verifiedUsers} {t.statVerified}
              </span>
            </div>

            {/* Posters Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.statPosters}
              </span>
              <div className="text-3xl font-black text-slate-900 mt-2">{totalPosters}</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                {t.statSuccessRate} {completedPosters} | {t.statFailed} {failedPosters}
              </span>
            </div>

            {/* Revenue Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.statRevenue}
              </span>
              <div className="text-3xl font-black text-emerald-700 mt-2">
                {totalRevenue} <span className="text-lg font-bold">BDT</span>
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                {stats.totalPayments || 0} {t.statRevenueSub}
              </span>
            </div>

            {/* Templates & Engine Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.statTemplates}
              </span>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {activeTemplates} <span className="text-sm font-semibold text-slate-400">/ {templates.length}</span>
              </div>
              <span className="text-xs text-blue-600 font-semibold mt-1 block">
                {successRate}% {t.statAiSuccessRate}
              </span>
            </div>
          </div>

          {/* System Diagnostics & Telemetry Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
            <h3 className="text-sm font-extrabold tracking-wide uppercase text-emerald-400 mb-4 flex items-center gap-2">
              {t.systemDiagTitle}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="text-slate-400 text-[10px] uppercase font-bold">{t.dbStatus}</div>
                <div className="font-semibold text-emerald-400 mt-1 truncate">Atlas Connected</div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="text-slate-400 text-[10px] uppercase font-bold">{t.aiEngine}</div>
                <div className="font-semibold text-amber-300 mt-1">gemini-3.8-flash</div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="text-slate-400 text-[10px] uppercase font-bold">{t.puppeteerEngine}</div>
                <div className="font-semibold text-teal-300 mt-1">Puppeteer Ready</div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="text-slate-400 text-[10px] uppercase font-bold">{t.nodeEnv}</div>
                <div className="font-semibold text-white mt-1">{stats.systemInfo?.nodeVersion || "v20.x"}</div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="text-slate-400 text-[10px] uppercase font-bold">{t.serverUptime}</div>
                <div className="font-semibold text-white mt-1">
                  {stats.systemInfo ? `${Math.floor(stats.systemInfo.uptimeSeconds / 60)}m` : "Active"}
                </div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="text-slate-400 text-[10px] uppercase font-bold">{t.serverTime}</div>
                <div className="font-semibold text-slate-300 mt-1 truncate">
                  {stats.systemInfo ? new Date(stats.systemInfo.serverTime).toLocaleTimeString() : "Online"}
                </div>
              </div>
            </div>
          </div>

          {/* ALL DATA TABLES SECTION IN OVERVIEW */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                {lang === "bn" ? "সিস্টেমের পূর্ণাঙ্গ ডেটা ও লগ" : "System Records & Live Telemetry"}
              </h3>
              {/* Sub Tab Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOverviewSubTab("users")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    overviewSubTab === "users"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  👥 {t.subUsers} ({stats.recentUsers?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewSubTab("posters")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    overviewSubTab === "posters"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🖼️ {t.subPosters} ({stats.recentPosters?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewSubTab("payments")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    overviewSubTab === "payments"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  💳 {t.subPayments} ({stats.recentPayments?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewSubTab("logs")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    overviewSubTab === "logs"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ⚡ {t.subLogs} ({stats.recentLogs?.length || 0})
                </button>
              </div>
            </div>

            {/* SUB-TABLE 1: RECENT USERS */}
            {overviewSubTab === "users" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-800 uppercase font-semibold">
                    <tr>
                      <th className="p-3">{t.thName}</th>
                      <th className="p-3">{t.thEmailPhone}</th>
                      <th className="p-3">{t.thRole}</th>
                      <th className="p-3">{t.thStatus}</th>
                      <th className="p-3 text-right">{t.thJoined}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentUsers && stats.recentUsers.length > 0 ? (
                      stats.recentUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-bold text-slate-900">{u.name}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">
                            {u.email || u.phone || "—"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                u.role === "admin"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                u.isEmailVerified
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {u.isEmailVerified ? "Verified ✓" : "Unverified"}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-400 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          {lang === "bn" ? "কোনো ব্যবহারকারী পাওয়া যায়নি" : "No users found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-TABLE 2: RECENT POSTERS */}
            {overviewSubTab === "posters" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-800 uppercase font-semibold">
                    <tr>
                      <th className="p-3">{t.thPoster}</th>
                      <th className="p-3">{t.thCandidate}</th>
                      <th className="p-3">{t.thOccasion}</th>
                      <th className="p-3">{t.thWatermark}</th>
                      <th className="p-3">{t.thResult}</th>
                      <th className="p-3 text-right">{t.thAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentPosters && stats.recentPosters.length > 0 ? (
                      stats.recentPosters.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">
                              {p.formData?.headline || "পোস্টার"}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ID: {p._id.slice(-6)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">
                              {p.formData?.name || "—"}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {p.formData?.party || "স্বতন্ত্র"}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium">
                              {p.templateId?.occasionType || p.formData?.occasionType || "general"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.formData?.watermark === false
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {p.formData?.watermark === false ? "No Watermark ✨" : "Free Tier"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : p.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/poster/${p._id}`}
                              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                            >
                              {t.viewPoster}
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          {lang === "bn" ? "কোনো পোস্টার পাওয়া যায়নি" : "No posters generated yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-TABLE 3: RECENT PAYMENTS */}
            {overviewSubTab === "payments" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-800 uppercase font-semibold">
                    <tr>
                      <th className="p-3">{t.thTrxId}</th>
                      <th className="p-3">{t.thUser}</th>
                      <th className="p-3">{t.thGateway}</th>
                      <th className="p-3">{t.thAmount}</th>
                      <th className="p-3">{t.thResult}</th>
                      <th className="p-3 text-right">{t.thTime}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentPayments && stats.recentPayments.length > 0 ? (
                      stats.recentPayments.map((pmt) => (
                        <tr key={pmt._id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {pmt.gatewayTxnId}
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{pmt.userId?.name || "User"}</div>
                            <div className="text-[10px] text-slate-400">{pmt.phoneNumber}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase ${
                                pmt.gateway === "bkash"
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {pmt.gateway}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {pmt.amount} {pmt.currency}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pmt.status === "verified"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {pmt.status}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-400 text-[11px]">
                            {new Date(pmt.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          {lang === "bn" ? "কোনো পেমেন্ট তথ্য এখনও নেই" : "No payment records found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-TABLE 4: AI ENGINE LOGS */}
            {overviewSubTab === "logs" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-800 uppercase font-semibold">
                    <tr>
                      <th className="p-3">{t.thPrompt}</th>
                      <th className="p-3">{t.thTokens}</th>
                      <th className="p-3">{t.thLatency}</th>
                      <th className="p-3">{t.thResult}</th>
                      <th className="p-3 text-right">{t.thTime}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentLogs && stats.recentLogs.length > 0 ? (
                      stats.recentLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3">
                            <div className="font-mono text-[11px] text-slate-800 line-clamp-1 max-w-[280px]">
                              {log.geminiPromptUsed || "Default layout prompt"}
                            </div>
                            {log.cached && (
                              <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                                CACHED
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{log.tokensUsed}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">{log.latencyMs} ms</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.success ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {log.success ? "Success" : "Fallback"}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-400 text-[11px]">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          {lang === "bn" ? "কোনো AI লগ পাওয়া যায়নি" : "No AI generation logs available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES MANAGEMENT CRUD */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">{t.tmplListTitle}</h2>
            <button
              type="button"
              onClick={() => setShowAddTemplate(!showAddTemplate)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              {showAddTemplate ? t.cancelBtn : t.addTmplBtn}
            </button>
          </div>

          {showAddTemplate && (
            <form
              onSubmit={handleCreateTemplate}
              className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-md space-y-4"
            >
              <h3 className="font-bold text-sm text-slate-900">{t.tmplFormTitle}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder={t.tmplTitlePlaceholder}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border text-xs"
                />
                <select
                  value={newOccasion}
                  onChange={(e) => setNewOccasion(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border text-xs"
                >
                  <option value="election_campaign">{t.occElection}</option>
                  <option value="political_rally">{t.occRally}</option>
                  <option value="bijoy_dibosh">{t.occBijoy}</option>
                  <option value="eid_utsob">{t.occEid}</option>
                  <option value="shok_dibosh">{t.occShok}</option>
                </select>
                <input
                  type="url"
                  placeholder={t.tmplThumbPlaceholder}
                  value={newThumbnail}
                  onChange={(e) => setNewThumbnail(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border text-xs"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow cursor-pointer hover:bg-slate-800"
              >
                {t.saveBtn}
              </button>
            </form>
          )}

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b text-slate-900 uppercase font-semibold">
                <tr>
                  <th className="p-4">{t.thPoster}</th>
                  <th className="p-4">{t.thOccasion}</th>
                  <th className="p-4">{t.thStatus}</th>
                  <th className="p-4 text-right">{t.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templates.map((tmpl) => (
                  <tr key={tmpl._id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{tmpl.title}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold">
                        {tmpl.occasionType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          tmpl.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {tmpl.isActive ? t.tmplActive : t.tmplInactive}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleTemplate(tmpl._id, tmpl.isActive)}
                        className="px-3 py-1 rounded-lg border text-xs hover:bg-slate-100 cursor-pointer"
                      >
                        {tmpl.isActive ? t.tmplDeactivate : t.tmplActivate}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tmpl._id)}
                        className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 cursor-pointer"
                      >
                        {t.tmplDelete}
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
            <span className="font-bold block text-sm mb-1">{t.modQueueTitle}</span>
            {t.modQueueNotice}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posters.map((poster) => (
              <div
                key={poster._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-4 space-y-3"
              >
                <div className="aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden relative">
                  {poster.generatedImageUrl ? (
                    <img
                      src={poster.generatedImageUrl}
                      alt="Poster"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      {t.noImage}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                    {poster.formData?.headline || "পোস্টার"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t.candidatePrefix} {poster.formData?.name} ({poster.formData?.party || "স্বতন্ত্র"})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t.userPrefix} {poster.userId?.name || "User"} ({poster.userId?.email || ""})
                  </p>
                </div>

                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">
                    {new Date(poster.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleModerateDelete(poster._id)}
                    className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    {t.flagDeleteBtn}
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
