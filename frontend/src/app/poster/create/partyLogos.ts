export interface PresetPartyLogo {
  id: string;
  nameBn: string;
  nameEn: string;
  symbolBn: string;
  symbolEn: string;
  dataUrl: string;
}

// Clean, high-resolution SVG data URLs for authentic Bangladeshi political & national party symbols
export const PRESET_PARTY_LOGOS: PresetPartyLogo[] = [
  {
    id: "paddy",
    nameBn: "বাংলাদেশ জাতীয়তাবাদী দল (বিএনপি)",
    nameEn: "Bangladesh Nationalist Party (BNP)",
    symbolBn: "ধানের শীষ",
    symbolEn: "Sheaf of Paddy",
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#f59e0b" stroke-width="4"/>
        <!-- Sheaf of Paddy stalk -->
        <path d="M60 102 C60 70 54 40 50 18" stroke="#16a34a" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M60 102 C60 70 66 40 70 18" stroke="#16a34a" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M60 102 C60 65 60 30 60 15" stroke="#16a34a" stroke-width="5" stroke-linecap="round" fill="none"/>
        <!-- Golden grains of paddy -->
        <ellipse cx="44" cy="30" rx="9" ry="5" fill="#f59e0b" transform="rotate(-35 44 30)"/>
        <ellipse cx="76" cy="30" rx="9" ry="5" fill="#f59e0b" transform="rotate(35 76 30)"/>
        <ellipse cx="41" cy="45" rx="10" ry="5" fill="#d97706" transform="rotate(-30 41 45)"/>
        <ellipse cx="79" cy="45" rx="10" ry="5" fill="#d97706" transform="rotate(30 79 45)"/>
        <ellipse cx="43" cy="60" rx="10" ry="5.5" fill="#f59e0b" transform="rotate(-25 43 60)"/>
        <ellipse cx="77" cy="60" rx="10" ry="5.5" fill="#f59e0b" transform="rotate(25 77 60)"/>
        <ellipse cx="48" cy="74" rx="9" ry="5" fill="#d97706" transform="rotate(-20 48 74)"/>
        <ellipse cx="72" cy="74" rx="9" ry="5" fill="#d97706" transform="rotate(20 72 74)"/>
        <!-- Top grains -->
        <ellipse cx="60" cy="18" rx="5" ry="9" fill="#f59e0b"/>
        <ellipse cx="53" cy="22" rx="5" ry="8" fill="#fbbf24" transform="rotate(-15 53 22)"/>
        <ellipse cx="67" cy="22" rx="5" ry="8" fill="#fbbf24" transform="rotate(15 67 22)"/>
        <!-- Tie ribbon -->
        <path d="M48 85 Q60 88 72 85" stroke="#dc2626" stroke-width="6" stroke-linecap="round" fill="none"/>
      </svg>
    `)}`,
  },
  {
    id: "boat",
    nameBn: "বাংলাদেশ আওয়ামী লীগ",
    nameEn: "Bangladesh Awami League",
    symbolBn: "নৌকা",
    symbolEn: "Boat",
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#16a34a" stroke-width="4"/>
        <!-- Water ripple -->
        <path d="M15 88 Q35 80 60 88 T105 88" stroke="#0284c7" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M22 96 Q42 90 60 96 T98 96" stroke="#38bdf8" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Boat Hull -->
        <path d="M20 62 C35 84 85 84 100 62 C85 70 35 70 20 62 Z" fill="#92400e" stroke="#78350f" stroke-width="2.5"/>
        <!-- Mast -->
        <line x1="60" y1="20" x2="60" y2="65" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <!-- Sail (White & Green) -->
        <path d="M60 22 L86 52 L60 52 Z" fill="#16a34a"/>
        <path d="M60 22 L36 52 L60 52 Z" fill="#dc2626"/>
        <!-- Oar -->
        <line x1="88" y1="52" x2="104" y2="82" stroke="#b45309" stroke-width="3.5" stroke-linecap="round"/>
        <ellipse cx="104" cy="82" rx="4" ry="7" fill="#b45309" transform="rotate(30 104 82)"/>
        <!-- Canopy / Chhoi -->
        <path d="M48 64 C48 54 72 54 72 64" fill="none" stroke="#d97706" stroke-width="4"/>
      </svg>
    `)}`,
  },
  {
    id: "scale",
    nameBn: "বাংলাদেশ জামায়াতে ইসলামী",
    nameEn: "Bangladesh Jamaat-e-Islami",
    symbolBn: "দাঁড়িপাল্লা",
    symbolEn: "Scales of Justice",
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#059669" stroke-width="4"/>
        <!-- Central Pillar & Base -->
        <rect x="57" y="24" width="6" height="74" rx="3" fill="#d97706"/>
        <path d="M42 98 L78 98 L70 90 L50 90 Z" fill="#b45309"/>
        <!-- Top Pivot Ring -->
        <circle cx="60" cy="22" r="7" fill="none" stroke="#d97706" stroke-width="3.5"/>
        <!-- Balance Beam -->
        <line x1="22" y1="36" x2="98" y2="36" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
        <!-- Left Scale Pan & Strings -->
        <line x1="25" y1="36" x2="14" y2="64" stroke="#64748b" stroke-width="1.8"/>
        <line x1="25" y1="36" x2="36" y2="64" stroke="#64748b" stroke-width="1.8"/>
        <path d="M12 64 Q25 76 38 64 Z" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
        <!-- Right Scale Pan & Strings -->
        <line x1="95" y1="36" x2="84" y2="64" stroke="#64748b" stroke-width="1.8"/>
        <line x1="95" y1="36" x2="106" y2="64" stroke="#64748b" stroke-width="1.8"/>
        <path d="M82 64 Q95 76 108 64 Z" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
      </svg>
    `)}`,
  },
  {
    id: "plough",
    nameBn: "জাতীয় পার্টি",
    nameEn: "Jatiya Party",
    symbolBn: "লাঙ্গল",
    symbolEn: "Plough",
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#d97706" stroke-width="4"/>
        <!-- Wooden Plough beam & body -->
        <path d="M22 45 L82 72 L102 78" stroke="#92400e" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M80 72 L86 28" stroke="#78350f" stroke-width="5" stroke-linecap="round" fill="none"/>
        <!-- Handle grip -->
        <line x1="82" y1="28" x2="94" y2="26" stroke="#b45309" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Iron Blade (Phal) -->
        <polygon points="76,70 102,80 94,92 72,78" fill="#475569" stroke="#1e293b" stroke-width="2"/>
        <!-- Soil ridges -->
        <path d="M20 96 C40 90 70 98 100 92" stroke="#ca8a04" stroke-width="4" stroke-dasharray="8 4" fill="none" stroke-linecap="round"/>
      </svg>
    `)}`,
  },
  {
    id: "shapla",
    nameBn: "জাতীয় প্রতীক (শাপলা)",
    nameEn: "National Emblem (Water Lily)",
    symbolBn: "জাতীয় প্রতীক শাপলা",
    symbolEn: "National Emblem",
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#b45309" stroke-width="4"/>
        <!-- Water waves -->
        <path d="M25 88 Q42 82 60 88 T95 88" stroke="#0284c7" stroke-width="3" fill="none"/>
        <path d="M30 94 Q45 88 60 94 T90 94" stroke="#0284c7" stroke-width="2" fill="none"/>
        <!-- Water Lily Blossom -->
        <path d="M60 40 C56 55 58 75 60 82 C62 75 64 55 60 40 Z" fill="#f59e0b"/>
        <path d="M60 52 C45 58 38 70 42 78 C50 78 56 74 60 82" fill="#d97706"/>
        <path d="M60 52 C75 58 82 70 78 78 C70 78 64 74 60 82" fill="#d97706"/>
        <!-- Outer petals -->
        <path d="M60 62 C38 68 28 80 34 85 C44 85 52 80 60 84" fill="#fbbf24"/>
        <path d="M60 62 C82 68 92 80 86 85 C76 85 68 80 60 84" fill="#fbbf24"/>
        <!-- 4 Stars above -->
        <circle cx="60" cy="20" r="4" fill="#dc2626"/>
        <circle cx="48" cy="23" r="3.5" fill="#dc2626"/>
        <circle cx="72" cy="23" r="3.5" fill="#dc2626"/>
        <circle cx="60" cy="30" r="3.5" fill="#16a34a"/>
      </svg>
    `)}`,
  },
  {
    id: "torch",
    nameBn: "তারুণ্যের মশাল / বৈষম্যবিরোধী প্রতীক",
    nameEn: "Youth & Revolution Torch",
    symbolBn: "তারুণ্যের মশাল",
    symbolEn: "Torch of Youth",
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#dc2626" stroke-width="4"/>
        <!-- Torch Handle -->
        <path d="M54 62 L56 102 L64 102 L66 62 Z" fill="#92400e" stroke="#78350f" stroke-width="2"/>
        <path d="M48 62 L72 62 L66 54 L54 54 Z" fill="#d97706"/>
        <!-- Burning Flame (Layered) -->
        <path d="M60 14 C48 30 42 42 48 54 C54 54 58 48 60 42 C62 48 66 54 72 54 C78 42 72 30 60 14 Z" fill="#dc2626"/>
        <path d="M60 22 C52 34 50 42 54 50 C58 50 59 46 60 42 C61 46 62 50 66 50 C70 42 68 34 60 22 Z" fill="#f59e0b"/>
        <path d="M60 30 C56 38 54 44 58 48 C60 48 60 44 60 42 C60 44 60 48 62 48 C66 44 64 38 60 30 Z" fill="#fef08a"/>
      </svg>
    `)}`,
  },
];
