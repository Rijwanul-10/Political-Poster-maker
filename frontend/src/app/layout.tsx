import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "পোস্টার কারিগর | AI Political & Cultural Poster Maker",
  description: "AI-powered Bangladeshi Political & Festival Poster Generator with instant layout and print-ready export",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body 
        className="min-h-screen flex flex-col bg-slate-50 antialiased selection:bg-emerald-500 selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white/70 py-8 text-center text-xs text-slate-500 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© 2026 পোস্টার কারিগর (Political Poster Studio) • সর্বস্বত্ব সংরক্ষিত</p>
              <div className="flex gap-4">
                <span>বাংলা ফন্ট ইঞ্জিন</span>
                <span>•</span>
                <span>Gemini AI কম্পোজিশন</span>
                <span>•</span>
                <span>প্রিন্ট-রেডি কোয়ালিটি</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
