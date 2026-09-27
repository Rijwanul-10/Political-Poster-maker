import mongoose from 'mongoose';
import { config } from './config';
import { Template } from './models/Template';

// Helper to generate clean, high-resolution SVG thumbnails for template previews
function makeSvgThumbnail(
  title: string,
  sub: string,
  bg1: string,
  bg2: string,
  accent: string,
  gold: string,
  icon: string,
  layoutType: string
) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${bg1}" />
          <stop offset="60%" stop-color="${bg2}" />
          <stop offset="100%" stop-color="#050811" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="45%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.6" />
          <stop offset="100%" stop-color="transparent" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Background -->
      <rect width="600" height="800" fill="url(#bg)" />
      <circle cx="300" cy="280" r="240" fill="url(#glow)" />

      <!-- Golden Border -->
      <rect x="18" y="18" width="564" height="764" rx="20" fill="none" stroke="${gold}" stroke-width="4" stroke-opacity="0.85" />
      <rect x="26" y="26" width="548" height="748" rx="14" fill="none" stroke="${gold}" stroke-width="1.5" stroke-opacity="0.4" />

      <!-- Top Header / Pill -->
      <rect x="180" y="46" width="240" height="42" rx="21" fill="${gold}" />
      <text x="300" y="73" font-family="'Hind Siliguri', 'Inter', sans-serif" font-size="18" font-weight="900" fill="#111827" text-anchor="middle">
        বাংলাদেশ • POSTER
      </text>

      <!-- Main Headline -->
      <text x="300" y="130" font-family="'Tiro Bangla', 'Hind Siliguri', sans-serif" font-size="28" font-weight="800" fill="#fef08a" text-anchor="middle">
        ${title}
      </text>
      <text x="300" y="160" font-family="'Hind Siliguri', sans-serif" font-size="16" font-weight="600" fill="#e2e8f0" text-anchor="middle">
        ${sub}
      </text>

      <!-- Layout Representation -->
      ${
        layoutType === 'dual_cutout'
          ? `
        <!-- Dual Cutouts -->
        <rect x="60" y="210" width="220" height="310" rx="20" fill="#111827" stroke="${gold}" stroke-width="3" />
        <circle cx="170" cy="320" r="60" fill="${accent}" fill-opacity="0.3" />
        <text x="170" y="335" font-size="44" text-anchor="middle">${icon}</text>
        <rect x="80" y="470" width="180" height="36" rx="8" fill="${gold}" />
        <text x="170" y="494" font-family="sans-serif" font-size="13" font-weight="bold" fill="#000" text-anchor="middle">প্রধান নেতা</text>

        <rect x="320" y="210" width="220" height="310" rx="20" fill="#111827" stroke="${gold}" stroke-width="3" />
        <circle cx="430" cy="320" r="60" fill="${accent}" fill-opacity="0.3" />
        <text x="430" y="335" font-size="44" text-anchor="middle">${icon}</text>
        <rect x="340" y="470" width="180" height="36" rx="8" fill="${gold}" />
        <text x="430" y="494" font-family="sans-serif" font-size="13" font-weight="bold" fill="#000" text-anchor="middle">বিশেষ অতিথি</text>
      `
          : layoutType === 'solo_circle'
          ? `
        <!-- Solo Circle Portrait -->
        <circle cx="300" cy="360" r="160" fill="#111827" stroke="${gold}" stroke-width="6" />
        <circle cx="300" cy="360" r="135" fill="${accent}" fill-opacity="0.25" />
        <text x="300" y="385" font-size="80" text-anchor="middle">${icon}</text>
        <rect x="180" y="490" width="240" height="42" rx="21" fill="${gold}" />
        <text x="300" y="517" font-family="sans-serif" font-size="15" font-weight="bold" fill="#000" text-anchor="middle">প্রধান অতিথি / নেতা</text>
      `
          : layoutType === 'trio_hierarchy'
          ? `
        <!-- Trio Hierarchy -->
        <rect x="200" y="190" width="200" height="260" rx="18" fill="#111827" stroke="${gold}" stroke-width="4" />
        <text x="300" y="315" font-size="52" text-anchor="middle">⭐</text>
        <rect x="220" y="415" width="160" height="28" rx="6" fill="${gold}" />
        <text x="300" y="434" font-family="sans-serif" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">প্রধান নেতা</text>

        <rect x="50" y="300" width="160" height="210" rx="14" fill="#111827" stroke="${accent}" stroke-width="3" />
        <text x="130" y="400" font-size="36" text-anchor="middle">${icon}</text>

        <rect x="390" y="300" width="160" height="210" rx="14" fill="#111827" stroke="${accent}" stroke-width="3" />
        <text x="470" y="400" font-size="36" text-anchor="middle">${icon}</text>
      `
          : layoutType === 'triple_grid'
          ? `
        <!-- Triple Modern Grid -->
        <rect x="40" y="240" width="160" height="230" rx="14" fill="#111827" stroke="${gold}" stroke-width="3" />
        <text x="120" y="350" font-size="38" text-anchor="middle">${icon}</text>

        <rect x="220" y="240" width="160" height="230" rx="14" fill="#111827" stroke="${gold}" stroke-width="3" />
        <text x="300" y="350" font-size="38" text-anchor="middle">👑</text>

        <rect x="400" y="240" width="160" height="230" rx="14" fill="#111827" stroke="${gold}" stroke-width="3" />
        <text x="480" y="350" font-size="38" text-anchor="middle">${icon}</text>
      `
          : layoutType === 'triple_circle'
          ? `
        <!-- Triple Circles -->
        <circle cx="130" cy="340" r="75" fill="#111827" stroke="${gold}" stroke-width="4" />
        <text x="130" y="355" font-size="40" text-anchor="middle">${icon}</text>

        <circle cx="300" cy="330" r="95" fill="#111827" stroke="${gold}" stroke-width="5" />
        <text x="300" y="355" font-size="56" text-anchor="middle">👑</text>

        <circle cx="470" cy="340" r="75" fill="#111827" stroke="${gold}" stroke-width="4" />
        <text x="470" y="355" font-size="40" text-anchor="middle">${icon}</text>
      `
          : `
        <!-- Staggered Diagonal Stairs -->
        <rect x="60" y="220" width="180" height="240" rx="16" fill="#111827" stroke="${gold}" stroke-width="3" />
        <text x="150" y="335" font-size="40" text-anchor="middle">⚡</text>

        <rect x="210" y="260" width="180" height="240" rx="16" fill="#111827" stroke="${accent}" stroke-width="3" />
        <text x="300" y="375" font-size="40" text-anchor="middle">🔥</text>

        <rect x="360" y="300" width="180" height="240" rx="16" fill="#111827" stroke="${gold}" stroke-width="3" />
        <text x="450" y="415" font-size="40" text-anchor="middle">${icon}</text>
      `
      }

      <!-- Bottom Candidate Banner Box -->
      <rect x="40" y="580" width="520" height="150" rx="20" fill="#0f172a" fill-opacity="0.95" stroke="${gold}" stroke-width="2" />
      <text x="300" y="618" font-family="sans-serif" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">প্রচারে ও শুভেচ্ছান্তে</text>
      <text x="300" y="658" font-family="'Hind Siliguri', sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">নেতা / প্রার্থীর নাম</text>
      <text x="300" y="694" font-family="'Hind Siliguri', sans-serif" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">সভাপতি / সাধারণ সম্পাদক / সদস্য</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

async function seed() {
  try {
    await mongoose.connect(config.mongoUri, { dbName: 'political_poster' });
    console.log('✅ Connected to MongoDB Atlas (database: political_poster)');

    const templates = [
      // 1. মহান বিজয় দিবস (Victory Day) Classic
      {
        title: 'মহান বিজয় দিবস (Victory Day) Classic',
        occasionType: 'bijoy_dibosh',
        thumbnailUrl: makeSvgThumbnail(
          'মহান বিজয় দিবস',
          '১৬ই ডিসেম্বর জাতীয় গৌরব',
          '#064e3b',
          '#022c22',
          '#dc2626',
          '#f59e0b',
          '🇧🇩',
          'dual_cutout'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 120, y: 280, width: 440, height: 540, shape: 'cutout' },
            { id: 'photo2', x: 640, y: 280, width: 440, height: 540, shape: 'cutout' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 35, fontFamily: 'Tiro Bangla', fontSize: 56, color: '#fef08a', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 48, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 30, color: '#38bdf8', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['victory_monument.png', 'red_sun.png'],
            colorSchemeOptions: ['#064e3b', '#022c22', '#dc2626', '#f59e0b'],
          },
        },
        isActive: true,
      },

      // 2. পবিত্র ঈদুল ফিতর (Eid Mubarak) Royal Moon
      {
        title: 'পবিত্র ঈদুল ফিতর (Eid Mubarak) Royal Moon',
        occasionType: 'eid_utsob',
        thumbnailUrl: makeSvgThumbnail(
          'ঈদ মোবারক',
          'পবিত্র ঈদুল ফিতরের শুভেচ্ছা',
          '#065f46',
          '#022c22',
          '#d97706',
          '#fbbf24',
          '🌙',
          'solo_circle'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 350, y: 240, width: 500, height: 550, shape: 'circle' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 30, fontFamily: 'Tiro Bangla', fontSize: 58, color: '#fbbf24', role: 'headline' },
            { id: 'name', x: 100, y: 1340, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 48, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1410, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 30, color: '#34d399', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['crescent_moon.png', 'eid_lantern.png'],
            colorSchemeOptions: ['#065f46', '#022c22', '#d97706', '#fbbf24'],
          },
        },
        isActive: true,
      },

      // 3. ঐতিহাসিক দলীয় মহাসমাবেশ (Grand Political Rally)
      {
        title: 'ঐতিহাসিক দলীয় মহাসমাবেশ (Political Grand Rally)',
        occasionType: 'political_rally',
        thumbnailUrl: makeSvgThumbnail(
          'মহাসমাবেশ ও জনসভা',
          'সফল করুন • যোগ দিন',
          '#09090b',
          '#18181b',
          '#e11d48',
          '#f59e0b',
          '📢',
          'trio_hierarchy'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 380, y: 180, width: 440, height: 530, shape: 'cutout' },
            { id: 'photo2', x: 80, y: 320, width: 320, height: 420, shape: 'cutout' },
            { id: 'photo3', x: 800, y: 320, width: 320, height: 420, shape: 'cutout' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 40, fontFamily: 'Anek Bangla', fontSize: 56, color: '#e11d48', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 50, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 32, color: '#fbbf24', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['rally_flag.png', 'crowd_silhouette.png'],
            colorSchemeOptions: ['#09090b', '#18181b', '#e11d48', '#f59e0b'],
          },
        },
        isActive: true,
      },

      // 4. জাতীয় শোক দিবস ও বিনম্র শ্রদ্ধাঞ্জলি (Solemn Mourning)
      {
        title: 'জাতীয় শোক দিবস ও বিনম্র শ্রদ্ধাঞ্জলি (Solemn Mourning)',
        occasionType: 'shok_dibosh',
        thumbnailUrl: makeSvgThumbnail(
          'বিনম্র শ্রদ্ধাঞ্জলি',
          '১৫ই আগস্ট জাতীয় শোক দিবস',
          '#18181b',
          '#09090b',
          '#71717a',
          '#e4e4e7',
          '🕊️',
          'dual_cutout'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 120, y: 250, width: 450, height: 570, shape: 'cutout' },
            { id: 'photo2', x: 630, y: 320, width: 420, height: 500, shape: 'cutout' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 35, fontFamily: 'Tiro Bangla', fontSize: 54, color: '#e4e4e7', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 46, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 28, color: '#a1a1aa', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['black_ribbon.png', 'white_lotus.png'],
            colorSchemeOptions: ['#18181b', '#09090b', '#71717a', '#e4e4e7'],
          },
        },
        isActive: true,
      },

      // 5. নির্বাচনী প্রচার ও ভোট প্রার্থনা (Election Campaign & Ballot)
      {
        title: 'নির্বাচনী প্রচার ও ভোট প্রার্থনা (Election Campaign)',
        occasionType: 'nirbachoni_procar',
        thumbnailUrl: makeSvgThumbnail(
          'ভোট প্রার্থনা ও দোয়া',
          'মার্কায় ভোট দিয়ে সেবা করার সুযোগ দিন',
          '#0f294a',
          '#031024',
          '#0284c7',
          '#fbbf24',
          '🗳️',
          'triple_grid'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 80, y: 260, width: 320, height: 420, shape: 'grid' },
            { id: 'photo2', x: 440, y: 260, width: 320, height: 420, shape: 'grid' },
            { id: 'photo3', x: 800, y: 260, width: 320, height: 420, shape: 'grid' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 40, fontFamily: 'Hind Siliguri', fontSize: 56, color: '#fbbf24', role: 'headline' },
            { id: 'name', x: 100, y: 1340, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 50, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1410, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 32, color: '#38bdf8', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['ballot_box.png', 'vote_seal.png'],
            colorSchemeOptions: ['#0f294a', '#031024', '#0284c7', '#fbbf24'],
          },
        },
        isActive: true,
      },

      // 6. নববর্ষ ও উৎসবের শুভেচ্ছা (Bangla New Year & Folk Wishes)
      {
        title: 'নববর্ষ ও উৎসবের শুভেচ্ছা (Folk Festival Wishes)',
        occasionType: 'shuvessa',
        thumbnailUrl: makeSvgThumbnail(
          'শুভ নববর্ষ ১৪৩১',
          'উৎসব ও সম্প্রীতির শুভেচ্ছা',
          '#7c2d12',
          '#431407',
          '#ea580c',
          '#fef08a',
          '🌺',
          'triple_circle'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 120, y: 270, width: 290, height: 290, shape: 'circle' },
            { id: 'photo2', x: 450, y: 230, width: 340, height: 340, shape: 'circle' },
            { id: 'photo3', x: 820, y: 270, width: 290, height: 290, shape: 'circle' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 35, fontFamily: 'Tiro Bangla', fontSize: 56, color: '#fef08a', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 48, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 30, color: '#fdba74', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['alpana_mandala.png', 'terracotta_bird.png'],
            colorSchemeOptions: ['#7c2d12', '#431407', '#ea580c', '#fef08a'],
          },
        },
        isActive: true,
      },

      // 7. ছাত্র ও যুব গণঅভ্যুত্থান (Student Revolution & Youth Torch)
      {
        title: 'ছাত্র ও যুব গণঅভ্যুত্থান (Student Awakening & Youth)',
        occasionType: 'chhatra_andolon',
        thumbnailUrl: makeSvgThumbnail(
          'তারুণ্যের জয়গান',
          'বৈষম্যবিরোধী ছাত্র ও জনতার ঐক্য',
          '#3b0764',
          '#1e0c38',
          '#c026d3',
          '#facc15',
          '⚡',
          'staggered_diagonal'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 100, y: 220, width: 330, height: 420, shape: 'grid' },
            { id: 'photo2', x: 440, y: 270, width: 330, height: 420, shape: 'grid' },
            { id: 'photo3', x: 770, y: 320, width: 330, height: 420, shape: 'grid' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 35, fontFamily: 'Anek Bangla', fontSize: 58, color: '#facc15', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 50, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 32, color: '#e879f9', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['torch_flame.png', 'cyber_fist.png'],
            colorSchemeOptions: ['#3b0764', '#1e0c38', '#c026d3', '#facc15'],
          },
        },
        isActive: true,
      },

      // 8. মহান স্বাধীনতা ও জাতীয় দিবস (Independence Day Glory)
      {
        title: 'মহান স্বাধীনতা ও জাতীয় দিবস (Independence Day)',
        occasionType: 'swadhinata_dibosh',
        thumbnailUrl: makeSvgThumbnail(
          '২৬শে মার্চ স্বাধীনতা দিবস',
          'রক্তস্নাত বিজয়ের সূবর্ণ তোরণ',
          '#047857',
          '#022c22',
          '#b91c1c',
          '#fde047',
          '🏛️',
          'trio_hierarchy'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 380, y: 190, width: 440, height: 520, shape: 'cutout' },
            { id: 'photo2', x: 90, y: 330, width: 320, height: 410, shape: 'cutout' },
            { id: 'photo3', x: 790, y: 330, width: 320, height: 410, shape: 'cutout' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 35, fontFamily: 'Tiro Bangla', fontSize: 56, color: '#fde047', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 48, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 30, color: '#4ade80', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['smriti_soudho.png', 'golden_laurel.png'],
            colorSchemeOptions: ['#047857', '#022c22', '#b91c1c', '#fde047'],
          },
        },
        isActive: true,
      },

      // 9. আন্তর্জাতিক মাতৃভাষা ও শহীদ দিবস (Language Martyrs' Memorial)
      {
        title: 'আন্তর্জাতিক মাতৃভাষা ও শহীদ দিবস (Language Day)',
        occasionType: 'shohid_dibosh',
        thumbnailUrl: makeSvgThumbnail(
          'অমর একুশে ফেব্রুয়ারি',
          'রক্তে রাঙানো বর্ণমালা ও শ্রদ্ধাঞ্জলি',
          '#111827',
          '#030712',
          '#dc2626',
          '#ffffff',
          '🌹',
          'dual_cutout'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 130, y: 260, width: 420, height: 530, shape: 'cutout' },
            { id: 'photo2', x: 650, y: 260, width: 420, height: 530, shape: 'cutout' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 35, fontFamily: 'Tiro Bangla', fontSize: 56, color: '#ffffff', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 48, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 30, color: '#ef4444', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['shaheed_minar.png', 'blood_rose.png'],
            colorSchemeOptions: ['#111827', '#030712', '#dc2626', '#ffffff'],
          },
        },
        isActive: true,
      },

      // 10. দ্বি-বার্ষিক সম্মেলন ও কাউন্সিল (Party Council & National Convention)
      {
        title: 'দ্বি-বার্ষিক সম্মেলন ও কাউন্সিল (Party Council Convention)',
        occasionType: 'sommelon_council',
        thumbnailUrl: makeSvgThumbnail(
          'জাতীয় কাউন্সিল অধিবেশন',
          'ঐক্য, সংহতি ও নেতৃত্বের সম্মেলন',
          '#1e293b',
          '#0f172a',
          '#d97706',
          '#fef3c7',
          '🎖️',
          'trio_hierarchy'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 380, y: 180, width: 440, height: 520, shape: 'cutout' },
            { id: 'photo2', x: 90, y: 340, width: 310, height: 410, shape: 'cutout' },
            { id: 'photo3', x: 800, y: 340, width: 310, height: 410, shape: 'cutout' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 40, fontFamily: 'Hind Siliguri', fontSize: 56, color: '#fef3c7', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 50, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 32, color: '#fbbf24', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['council_podium.png', 'golden_star_emblem.png'],
            colorSchemeOptions: ['#1e293b', '#0f172a', '#d97706', '#fef3c7'],
          },
        },
        isActive: true,
      },

      // 11. পবিত্র ঈদে মিলাদুন্নবী (Eid-e-Miladunnabi Mubarak)
      {
        title: 'পবিত্র ঈদে মিলাদুন্নবী (Eid-e-Miladunnabi Mubarak)',
        occasionType: 'eid_utsob',
        thumbnailUrl: makeSvgThumbnail(
          '১২ই রবিউল আউয়াল',
          'পবিত্র ঈদে মিলাদুন্নবী (সা:) শুভেচ্ছা',
          '#064e3b',
          '#0f766e',
          '#f59e0b',
          '#ffffff',
          '🕌',
          'solo_circle'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 350, y: 240, width: 500, height: 550, shape: 'circle' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 35, fontFamily: 'Tiro Bangla', fontSize: 56, color: '#f59e0b', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 48, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 30, color: '#2dd4bf', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['green_dome.png', 'arabesque_frame.png'],
            colorSchemeOptions: ['#064e3b', '#0f766e', '#f59e0b', '#ffffff'],
          },
        },
        isActive: true,
      },

      // 12. শারদীয় দুর্গোৎসব ও ধর্মীয় সম্প্রীতি (Festive Harmony & Greetings)
      {
        title: 'শারদীয় দুর্গোৎসব ও ধর্মীয় সম্প্রীতি (Festive Harmony)',
        occasionType: 'shuvessa',
        thumbnailUrl: makeSvgThumbnail(
          'শারদীয় দুর্গোৎসব',
          'ধর্ম যার যার, উৎসব সবার • সম্প্রীতির শুভেচ্ছা',
          '#991b1b',
          '#450a0a',
          '#ea580c',
          '#fbbf24',
          '🪔',
          'triple_grid'
        ),
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 80, y: 260, width: 320, height: 420, shape: 'grid' },
            { id: 'photo2', x: 440, y: 260, width: 320, height: 420, shape: 'grid' },
            { id: 'photo3', x: 800, y: 260, width: 320, height: 420, shape: 'grid' },
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 80, maxWidth: 1000, maxChars: 40, fontFamily: 'Anek Bangla', fontSize: 56, color: '#fbbf24', role: 'headline' },
            { id: 'name', x: 100, y: 1350, maxWidth: 1000, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 50, color: '#ffffff', role: 'name' },
            { id: 'designation', x: 100, y: 1420, maxWidth: 1000, maxChars: 35, fontFamily: 'Hind Siliguri', fontSize: 32, color: '#fdba74', role: 'designation' },
          ],
          decoration: {
            baseAssets: ['marigold_garland.png', 'diya_lamp.png'],
            colorSchemeOptions: ['#991b1b', '#450a0a', '#ea580c', '#fbbf24'],
          },
        },
        isActive: true,
      },
    ];

    await Template.deleteMany({}); // clear old seeds
    const created = await Template.insertMany(templates as any);
    console.log(`✅ Successfully seeded ${created.length} unique templates across categories!`);
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB Disconnected');
  }
}

seed();
