"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            প
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              পোস্টার কারিগর
            </div>
            <div className="text-[10px] text-gray-500 font-medium -mt-1 tracking-wider uppercase">
              AI Poster Studio
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/templates"
            className="text-sm font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
          >
            টেমপ্লেট গ্যালারি
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-medium border border-emerald-200">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                লগআউট
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-1.5"
              >
                লগইন
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
              >
                নিবন্ধন করুন
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
