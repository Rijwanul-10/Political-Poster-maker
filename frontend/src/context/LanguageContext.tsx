"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "bn" | "en";

export interface Translations {
  nav: {
    title: string;
    sub: string;
    templates: string;
    myPosters: string;
    admin: string;
    login: string;
    register: string;
    logout: string;
  };
  home: {
    badge: string;
    heroH1Part1: string;
    heroH1Highlight: string;
    heroH1Part2: string;
    heroDesc: string;
    startBtn: string;
    freeAccountBtn: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
  };
  create: {
    badge: string;
    formTitle: string;
    bulkMode: string;
    normalMode: string;
    otherTemplates: string;
    noTemplateTitle: string;
    noTemplateDesc: string;
    goToGallery: string;
    
    // AI Prompt Section
    aiPromptTitle: string;
    aiPromptSub: string;
    aiPromptPlaceholder: string;
    aiPresetTitle: string;
    
    // Form fields
    nameLabel: string;
    namePlaceholder: string;
    designationLabel: string;
    designationPlaceholder: string;
    partyLabel: string;
    partyPlaceholder: string;
    districtLabel: string;
    districtPlaceholder: string;
    headlineLabel: string;
    headlinePlaceholder: string;
    fontLabel: string;
    layoutLabel: string;
    layoutCutout: string;
    layoutCircle: string;
    layoutGrid: string;
    
    // Party Logo
    partyLogoTitle: string;
    partyLogoSub: string;
    partyLogoRequiredBadge: string;
    selectPresetLogo: string;
    orUploadCustomLogo: string;
    extraLogoTitle: string;
    extraLogoSub: string;
    
    // Photos & Roles
    photoUploadTitle: string;
    photoUploadLimit: string;
    photoRoleLabel: string;
    photoNameLabel: string;
    photoUploadClick: string;
    photoUploadMax: string;
    
    // Watermark & Payment
    watermarkTitle: string;
    watermarkPrice: string;
    watermarkPaidMsg: string;
    watermarkVerifiedBadge: string;
    watermarkUnpaidTitle: string;
    watermarkUnpaidDesc: string;
    payBtn: string;
    generateBtnFree: string;
    generateBtnPaid: string;
    generatingMsg: string;
  };
}

const translations: Record<Language, Translations> = {
  bn: {
    nav: {
      title: "পোস্টার কারিগর",
      sub: "AI Poster Studio",
      templates: "টেমপ্লেট গ্যালারি",
      myPosters: "আমার পোস্টার",
      admin: "🛡️ অ্যাডমিন প্যানেল",
      login: "লগইন",
      register: "নিবন্ধন করুন",
      logout: "লগআউট",
    },
    home: {
      badge: "বাংলাদেশের প্রথম AI পোস্টার জেনারেটর",
      heroH1Part1: "কয়েক ক্লিকেই তৈরি করুন ",
      heroH1Highlight: "আকর্ষণীয় রাজনৈতিক ও উৎসবের",
      heroH1Part2: " ডিজিটাল পোস্টার",
      heroDesc: "বিজয় দিবস, ঈদ, দলীয় সমাবেশ বা বিশেষ দিবসের পোস্টার ডিজাইন করুন কোনো গ্রাফিক ডিজাইনার ছাড়াই। লিডারদের ছবি ও পছন্দমতো প্রম্পট দিন, Gemini AI মুহূর্তেই তৈরি করবে দৃষ্টিনন্দন পোস্টার।",
      startBtn: "পোস্টার তৈরি শুরু করুন →",
      freeAccountBtn: "ফ্রি একাউন্ট খুলুন",
      f1Title: "Gemini AI কাস্টম প্রম্পট ও ডিজাইন",
      f1Desc: "আপনার পছন্দসই কালার ও ডিজাইনের কথা প্রম্পটে লিখুন। AI আপনার ইচ্ছেমতো অনন্য কালার কম্বিনেশন তৈরি করবে।",
      f2Title: "আসল বাংলাদেশি রাজনৈতিক গ্রামার",
      f2Desc: "শীর্ষ নেতাদের সম্মানজনক ডেজিগনেশন, দলীয় প্রতীক ও লোগো, স্লোগান এবং সঠিক রাজনৈতিক কালার স্কিম।",
      f3Title: "এইচডি ও প্রিন্ট-রেডি এক্সপোর্ট",
      f3Desc: "সরাসরি সোশ্যাল মিডিয়া পোস্টের উপযোগী হাই-রেজ্যুলেশন PNG ফরম্যাটে ডাউনলোড করুন এক ক্লিকে।",
      ctaTitle: "আজই আপনার প্রথম পোস্টার তৈরি করে দেখুন",
      ctaDesc: "কোনো জটিল সফটওয়্যার বা গ্রাফিক্সের অভিজ্ঞতার দরকার নেই। শুধু পছন্দের স্টাইল বেছে নিয়ে শুরু করুন।",
      ctaBtn: "টেমপ্লেটগুলো দেখুন",
    },
    create: {
      badge: "পোস্টার তৈরি",
      formTitle: "পোস্টার তথ্য ও ডিজাইন ফরম",
      bulkMode: "⚡ বাল্ক / CSV মোড",
      normalMode: "সাধারণ ফরম",
      otherTemplates: "অন্য টেমপ্লেট",
      noTemplateTitle: "কোনো টেমপ্লেট নির্বাচন করা হয়নি",
      noTemplateDesc: "প্রথমে গ্যালারি থেকে একটি পোস্টার টেমপ্লেট বেছে নিন।",
      goToGallery: "টেমপ্লেট গ্যালারিতে যান",
      
      aiPromptTitle: "✨ এআই ডিজাইন ও কালার প্রম্পট (AI Custom Design)",
      aiPromptSub: "আপনার পোস্টারটি দেখতে কেমন চান? (কালার, থিম, ভাইব লিখে দিন — Gemini AI সেভাবে তৈরি করবে)",
      aiPromptPlaceholder: "যেমন: রয়েল ব্লু এবং সোনালী লাক্সারি থিম, প্রিমিয়াম ডার্ক গ্লাস বর্ডার, আধুনিক ভিআইপি স্টাইল...",
      aiPresetTitle: "জনপ্রিয় ডিজাইন প্রিসেট:",
      
      nameLabel: "নেতা / প্রার্থীর নাম *",
      namePlaceholder: "যেমন: প্রকৌশলী মো: রফিকুল ইসলাম",
      designationLabel: "পদবী / পরিচয় *",
      designationPlaceholder: "যেমন: সভাপতি / সাধারণ সম্পাদক / সদস্য",
      partyLabel: "সংগঠন / দল *",
      partyPlaceholder: "যেমন: বাংলাদেশ আওয়ামী লীগ / বিএনপি / জাতীয় পার্টি",
      districtLabel: "এলাকা / জেলা / থানা",
      districtPlaceholder: "যেমন: ধানমন্ডি, ঢাকা",
      headlineLabel: "মূল স্লোগান / হেডলাইন বার্তা *",
      headlinePlaceholder: "যেমন: মহান বিজয় দিবসে সকল শহীদদের প্রতি বিনম্র শ্রদ্ধাঞ্জলি",
      fontLabel: "🎨 বাংলা টাইপোগ্রাফি ফন্ট",
      layoutLabel: "🖼️ ছবির লেআউট অপশন",
      layoutCutout: "কাটআউট ফ্রেম",
      layoutCircle: "সার্কেল পোরট্রেট",
      layoutGrid: "মডার্ন গ্রিড",
      
      partyLogoTitle: "দলীয় প্রতীক / মার্কা (Party Logo) - আবশ্যক *",
      partyLogoSub: "পোস্টারের শীর্ষ হেডারে দলীয় লোগো বাধ্যতামূলকভাবে সংযুক্ত হবে",
      partyLogoRequiredBadge: "আবশ্যক",
      selectPresetLogo: "জনপ্রিয় দলীয় প্রতীক বেছে নিন:",
      orUploadCustomLogo: "অথবা নিজস্ব দলীয় লোগো আপলোড করুন (PNG/JPG/SVG)",
      extraLogoTitle: "অতিরিক্ত লোগো / শাখা সংগঠন (Extra Logo - ঐচ্ছিক)",
      extraLogoSub: "ছাত্রদল, যুবদল, যুবলীগ, স্বেচ্ছাসেবক দল বা অন্যান্য সংগঠনের দ্বিতীয় লোগো",
      
      photoUploadTitle: "ছবি আপলোড ও পদবী নির্ধারণ *",
      photoUploadLimit: "সর্বোচ্চ ৩টি ছবি, প্রতিটির জন্য পদবী ও নাম দিন",
      photoRoleLabel: "এই ছবির ব্যক্তির পদবী / ভূমিকা *",
      photoNameLabel: "ব্যক্তির নাম (ঐচ্ছিক)",
      photoUploadClick: "ছবি নির্বাচন করতে ক্লিক করুন",
      photoUploadMax: "সর্বোচ্চ ৩টি ছবি নির্বাচন করা হয়েছে",
      
      watermarkTitle: "✨ ওয়াটারমার্ক রিমুভাল • Premium",
      watermarkPrice: "৫০ টাকা",
      watermarkPaidMsg: "পেমেন্ট সফল! ওয়াটারমার্ক ছাড়া পোস্টার তৈরি হবে।",
      watermarkVerifiedBadge: "পেমেন্ট যাচাই সম্পন্ন ✓",
      watermarkUnpaidTitle: "ওয়াটারমার্ক ছাড়া হাই-কোয়ালিটি পোস্টার ডাউনলোড করুন",
      watermarkUnpaidDesc: "বিকাশ বা নগদ দিয়ে মাত্র ৫০ টাকা পেমেন্ট করে ওয়াটারমার্কহীন পোস্টার পান।",
      payBtn: "💳 পেমেন্ট করুন",
      generateBtnFree: "পোস্টার তৈরি করুন 🚀 (ওয়াটারমার্ক সহ)",
      generateBtnPaid: "ওয়াটারমার্ক ছাড়া পোস্টার তৈরি করুন ✨",
      generatingMsg: "পোস্টার জেনারেট হচ্ছে...",
    },
  },
  en: {
    nav: {
      title: "Poster Karigor",
      sub: "AI Poster Studio",
      templates: "Template Gallery",
      myPosters: "My Posters",
      admin: "🛡️ Admin Panel",
      login: "Login",
      register: "Register",
      logout: "Logout",
    },
    home: {
      badge: "Bangladesh's First AI Poster Generator",
      heroH1Part1: "Design in seconds ",
      heroH1Highlight: "Stunning Political & Festival",
      heroH1Part2: " Digital Posters",
      heroDesc: "Create professional posters for Victory Day, Eid, Political Rallies, or special occasions without graphic design skills. Provide photos, party logos, and prompt preferences—Gemini AI composes print-ready art instantly.",
      startBtn: "Start Creating Posters →",
      freeAccountBtn: "Create Free Account",
      f1Title: "Gemini AI Custom Prompts & Palettes",
      f1Desc: "Tell AI your favorite colors and style in the design prompt. Gemini generates customized visual compositions.",
      f2Title: "Authentic Political Design Grammar",
      f2Desc: "Prestigious leader role badges, mandatory party insignia logos, resonant slogans, and balanced political palettes.",
      f3Title: "HD & Print-Ready Export",
      f3Desc: "One-click download in ultra-sharp PNG format, ready for print press or viral social media broadcasting.",
      ctaTitle: "Create Your First Poster Today",
      ctaDesc: "No complex software or previous graphics experience required. Pick a theme, customize, and generate.",
      ctaBtn: "Explore Templates",
    },
    create: {
      badge: "Create Poster",
      formTitle: "Poster Info & Design Studio",
      bulkMode: "⚡ Bulk / CSV Mode",
      normalMode: "Standard Form",
      otherTemplates: "Change Template",
      noTemplateTitle: "No Template Selected",
      noTemplateDesc: "Please select a poster template from the template gallery first.",
      goToGallery: "Go to Template Gallery",
      
      aiPromptTitle: "✨ AI Design & Color Preference Prompt",
      aiPromptSub: "How do you want your poster to look? (Describe colors, mood, lighting, VIP vibe — Gemini AI customizes it)",
      aiPromptPlaceholder: "e.g.: Royal blue and metallic gold luxury theme, modern frosted glass card borders, sleek VIP aesthetic...",
      aiPresetTitle: "Quick Style Presets:",
      
      nameLabel: "Leader / Candidate Name *",
      namePlaceholder: "e.g.: Engineer Md. Rafiqul Islam",
      designationLabel: "Designation / Role *",
      designationPlaceholder: "e.g.: President / General Secretary / Member",
      partyLabel: "Political Party / Organization *",
      partyPlaceholder: "e.g.: Bangladesh Awami League / BNP / Jatiya Party",
      districtLabel: "Constituency / District / Area",
      districtPlaceholder: "e.g.: Dhanmondi, Dhaka",
      headlineLabel: "Main Headline / Slogan Message *",
      headlinePlaceholder: "e.g.: Heartfelt tributes to all martyrs on the Great Victory Day",
      fontLabel: "🎨 Bengali Typography Font",
      layoutLabel: "🖼️ Photo Layout Style",
      layoutCutout: "Cutout Portrait",
      layoutCircle: "Circular Silhouette",
      layoutGrid: "Modern Grid",
      
      partyLogoTitle: "Political Party Logo (Mandatory) *",
      partyLogoSub: "Official party symbol is required and displayed prominently in the poster header",
      partyLogoRequiredBadge: "Mandatory",
      selectPresetLogo: "Choose from authentic party symbols:",
      orUploadCustomLogo: "Or upload your custom party logo (PNG/JPG/SVG)",
      extraLogoTitle: "Extra Logo / Affiliate Wing (Optional)",
      extraLogoSub: "Secondary logo for student wing, youth wing, or campaign sponsor",
      
      photoUploadTitle: "Upload Photos & Assign Titles / Roles *",
      photoUploadLimit: "Up to 3 photos. Specify designation & name for each person",
      photoRoleLabel: "Designation / Role for this photo *",
      photoNameLabel: "Person Name (Optional)",
      photoUploadClick: "Click to browse photos",
      photoUploadMax: "Maximum 3 photos reached",
      
      watermarkTitle: "✨ Watermark Removal • Premium",
      watermarkPrice: "50 BDT",
      watermarkPaidMsg: "Payment verified! Poster will be generated without watermark.",
      watermarkVerifiedBadge: "Verified with bKash/Nagad ✓",
      watermarkUnpaidTitle: "Download High-Res Poster Without Watermark",
      watermarkUnpaidDesc: "Pay only 50 BDT via bKash or Nagad to get clean watermark-free prints.",
      payBtn: "💳 Pay Now",
      generateBtnFree: "Generate Poster 🚀 (With Watermark)",
      generateBtnPaid: "Generate Poster Without Watermark ✨",
      generatingMsg: "Generating poster with Gemini AI...",
    },
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("bn");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("preferred_lang") as Language;
    if (saved === "en" || saved === "bn") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_lang", newLang);
    }
  };

  const toggleLang = () => {
    const nextLang = lang === "bn" ? "en" : "bn";
    setLang(nextLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t: translations[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
