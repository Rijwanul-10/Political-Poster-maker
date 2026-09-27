import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/60 via-amber-50/40 to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          বাংলাদেশের প্রথম AI পোস্টার জেনারেটর
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.2] max-w-4xl mx-auto">
          কয়েক ক্লিকেই তৈরি করুন{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
            আকর্ষণীয় রাজনৈতিক ও উৎসবের
          </span>{" "}
          ডিজিটাল পোস্টার
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          বিজয় দিবস, ঈদ, দলীয় সমাবেশ বা বিশেষ দিবসের পোস্টার ডিজাইন করুন কোনো গ্রাফিক ডিজাইনার ছাড়াই। লিডারদের ছবি ও তথ্য দিন, Gemini AI স্বয়ংক্রিয়ভাবে প্রফেশনাল পোস্টার বানিয়ে দেবে।
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/templates"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            পোস্টার তৈরি শুরু করুন →
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm hover:-translate-y-0.5 transition-all"
          >
            ফ্রি একাউন্ট খুলুন
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-200/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold mb-4">
              ✨
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Gemini AI ফটো ও লেআউট কম্পোজিশন
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              আপনার আপলোড করা ছবি স্বয়ংক্রিয়ভাবে ফ্রেম এবং কাটিং অনুযায়ী সবচেয়ে সেরা জায়গায় নিখুঁতভাবে বসিয়ে দেবে।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold mb-4">
              🇧🇩
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              আসল বাংলাদেশি রাজনৈতিক গ্রামার
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              শীর্ষ নেতাদের সম্মানজনক পজিশন, স্লোগান, পদবী এবং সংগঠনের নান্দনিক কালার স্কিমের সঠিক প্রয়োগ।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold mb-4">
              🖨️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              এইচডি ও প্রিন্ট-রেডি এক্সপোর্ট
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              সরাসরি সোশ্যাল মিডিয়া পোস্টের উপযোগী হাই-রেজ্যুলেশন PNG ফরম্যাটে ডাউনলোড করুন এক ক্লিকে।
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            আজই আপনার প্রথম পোস্টার তৈরি করে দেখুন
          </h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            কোনো জটিল সফটওয়্যার বা গ্রাফিক্সের অভিজ্ঞতার দরকার নেই। শুধু টেমপ্লেট বেছে নিয়ে শুরু করুন।
          </p>
          <Link
            href="/templates"
            className="inline-flex px-8 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-base shadow-md hover:scale-105 transition-all"
          >
            টেমপ্লেটগুলো দেখুন
          </Link>
        </div>
      </section>
    </div>
  );
}
