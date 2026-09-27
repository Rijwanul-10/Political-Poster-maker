import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
        className="min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
