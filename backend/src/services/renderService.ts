import puppeteer from 'puppeteer';
import { ITemplate } from '../models/Template';

/**
 * Renders a high-resolution, print-ready Bengali political or festival poster
 * using Puppeteer and CSS styling matching authentic Bangladeshi poster design grammar.
 * Features:
 * - Dynamic AI-driven color schemes and themes (user prompt guided)
 * - Mandatory Party Logo & optional Extra Organization Logo
 * - Individual Photo Roles / Designations (Leader, General Secretary, Member, etc.)
 * - Multiple layout styles ('cutout', 'circle', 'grid')
 * - Bangla typography font selection ('Tiro Bangla' | 'Hind Siliguri' | 'Anek Bangla')
 * - Server-enforced watermark banner
 */
export async function renderPosterToBuffer(
  template: ITemplate,
  suggestion: any,
  formData: any,
  photoUrls: string[],
): Promise<Buffer> {
  const width = template.layoutConfig?.canvas?.width || 1200;
  const height = template.layoutConfig?.canvas?.height || 1600;

  const isEid = template.occasionType === 'eid_utsob' || formData.headline?.includes('ঈদ');

  // Dynamic colors from Gemini suggestion or user prompt
  const primaryColor = suggestion?.colorScheme?.primaryColor || (isEid ? '#065f46' : '#047857');
  const secondaryBgColor = suggestion?.colorScheme?.secondaryBgColor || (isEid ? '#022c22' : '#022c22');
  const accentColor = suggestion?.colorScheme?.accentColor || (isEid ? '#d97706' : '#dc2626');
  const goldColor = suggestion?.colorScheme?.goldColor || '#f59e0b';
  const cardTheme = suggestion?.colorScheme?.cardTheme || 'glass';
  const bgGradientType = suggestion?.colorScheme?.bgGradientType || 'linear';

  // Typography font selection
  const chosenFont = formData.headlineFont || 'Tiro Bangla';
  const headlineFontFamily = chosenFont === 'Hind Siliguri' 
    ? "'Hind Siliguri', sans-serif" 
    : chosenFont === 'Anek Bangla' 
    ? "'Anek Bangla', sans-serif" 
    : "'Tiro Bangla', serif";

  // Photo layout style
  const photoLayout = formData.photoLayout || 'cutout';

  // Photo details (roles and names)
  const photoDetails = formData.photoDetails || [];

  // Generate HTML for photos with their respective titles and roles
  const photosHtml = photoUrls.map((url, idx) => {
    const detail = photoDetails[idx] || {};
    const roleText = detail.role || (idx === 0 ? 'প্রধান নেতা / অতিথি' : idx === 1 ? 'বিশেষ অতিথি' : 'সম্মানিত সদস্য');
    const nameText = detail.name || '';

    return `
      <div class="photo-card photo-card-${photoLayout} photo-${idx + 1}">
        <div class="photo-inner">
          <img src="${url}" alt="Leader ${idx + 1}" />
        </div>
        <div class="photo-badge">
          <div class="photo-role">${roleText}</div>
          ${nameText ? `<div class="photo-name">${nameText}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Party Logo & Extra Logo
  const partyLogoUrl = formData.partyLogoUrl;
  const extraLogoUrl = formData.extraLogoUrl;

  const partyLogoHtml = partyLogoUrl ? `
    <div class="logo-seal party-logo-seal" title="দলীয় প্রতীক">
      <img src="${partyLogoUrl}" alt="দলীয় প্রতীক" />
    </div>
  ` : '';

  const extraLogoHtml = extraLogoUrl ? `
    <div class="logo-seal extra-logo-seal" title="অতিরিক্ত লোগো">
      <img src="${extraLogoUrl}" alt="সংগঠন লোগো" />
    </div>
  ` : '';

  // Watermark toggle
  const showWatermark = formData.watermark !== false;

  // Construct dynamic background CSS based on gradient type
  let bgGradientCss = `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryBgColor} 45%, #0f172a 100%)`;
  if (bgGradientType === 'radial') {
    bgGradientCss = `radial-gradient(ellipse at 50% 25%, ${primaryColor} 0%, ${secondaryBgColor} 70%, #030712 100%)`;
  } else if (bgGradientType === 'mesh') {
    bgGradientCss = `radial-gradient(at 15% 15%, ${accentColor}44 0px, transparent 50%), radial-gradient(at 85% 20%, ${primaryColor} 0px, transparent 55%), linear-gradient(180deg, ${primaryColor} 0%, ${secondaryBgColor} 60%, #09090b 100%)`;
  } else if (bgGradientType === 'angular') {
    bgGradientCss = `linear-gradient(145deg, ${primaryColor} 0%, ${secondaryBgColor} 55%, #09090b 100%)`;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
      <head>
        <meta charset="UTF-8" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&family=Tiro+Bangla:ital@0;1&family=Anek+Bangla:wght@600;700;800&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
            font-family: 'Hind Siliguri', sans-serif;
            background: #000000;
          }
          .poster {
            width: ${width}px;
            height: ${height}px;
            position: relative;
            background: ${bgGradientCss};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 55px;
            color: #ffffff;
            overflow: hidden;
          }

          /* Ambient Glow Elements */
          .bg-circle {
            position: absolute;
            top: 260px;
            left: 50%;
            transform: translateX(-50%);
            width: 720px;
            height: 720px;
            background: radial-gradient(circle, ${accentColor} 0%, rgba(220, 38, 38, 0.35) 60%, transparent 80%);
            border-radius: 50%;
            filter: blur(25px);
            z-index: 1;
            opacity: 0.85;
          }

          .border-frame {
            position: absolute;
            inset: 25px;
            border: 4px solid ${goldColor};
            border-radius: 24px;
            pointer-events: none;
            z-index: 50;
            box-shadow: inset 0 0 25px rgba(245, 158, 11, 0.25);
          }

          .corner-deco {
            position: absolute;
            width: 50px;
            height: 50px;
            border: 8px solid ${goldColor};
            z-index: 51;
          }
          .corner-tl { top: 35px; left: 35px; border-right: none; border-bottom: none; border-radius: 12px 0 0 0; }
          .corner-tr { top: 35px; right: 35px; border-left: none; border-bottom: none; border-radius: 0 12px 0 0; }
          .corner-bl { bottom: 35px; left: 35px; border-right: none; border-top: none; border-radius: 0 0 0 12px; }
          .corner-br { bottom: 35px; right: 35px; border-left: none; border-top: none; border-radius: 0 0 12px 0; }

          /* Header & Logos */
          .header-box {
            position: relative;
            z-index: 10;
            text-align: center;
          }
          .header-logo-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 25px;
            margin-bottom: 18px;
          }
          .logo-seal {
            width: 78px;
            height: 78px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.95);
            border: 3px solid ${goldColor};
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 7px;
          }
          .logo-seal img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .party-pill {
            display: inline-block;
            padding: 10px 45px;
            background: linear-gradient(90deg, #92400e, #d97706, #92400e);
            color: #ffffff;
            font-size: 26px;
            font-weight: 800;
            border-radius: 50px;
            letter-spacing: 1px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.45);
            border: 2px solid #fef3c7;
          }
          .headline-text {
            font-family: ${headlineFontFamily};
            font-size: 58px;
            font-weight: 800;
            line-height: 1.22;
            color: #fef08a;
            text-shadow: 0 4px 18px rgba(0, 0, 0, 0.85), 0 0 35px rgba(245, 158, 11, 0.55);
            max-width: 1020px;
            margin: 8px auto 0;
          }
          .sub-occasion {
            font-size: 26px;
            color: #e2e8f0;
            margin-top: 10px;
            font-weight: 600;
            text-shadow: 0 2px 8px rgba(0,0,0,0.6);
          }

          /* Photos Section */
          .photos-container {
            position: relative;
            z-index: 10;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 28px;
            margin: 25px 0 20px;
            flex: 1;
          }
          .photo-card {
            position: relative;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 22px 45px rgba(0,0,0,0.65);
            border: 5px solid ${goldColor};
            background: #000;
            display: flex;
            flex-direction: column;
          }
          .photo-card-circle {
            border-radius: 50% !important;
            border: 6px solid ${goldColor} !important;
          }
          .photo-card-grid {
            border-radius: 18px !important;
            border: 4px solid ${goldColor} !important;
          }
          .photo-1 { width: 330px; height: 410px; }
          .photo-2 { width: 330px; height: 410px; }
          .photo-3 { width: 300px; height: 380px; }
          .photo-inner {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          .photo-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          /* Photo Role & Name Badges */
          .photo-badge {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(15,23,42,0.92) 50%, rgba(2,44,34,0.98) 100%);
            padding: 8px 12px 12px;
            text-align: center;
            border-top: 2px solid ${goldColor};
            backdrop-filter: blur(8px);
          }
          .photo-role {
            font-size: 16px;
            font-weight: 800;
            color: #fef08a;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
            letter-spacing: 0.5px;
          }
          .photo-name {
            font-size: 19px;
            font-weight: 700;
            color: #ffffff;
            margin-top: 2px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* Bottom Candidate Card / Ribbon */
          .footer-box {
            position: relative;
            z-index: 10;
            text-align: center;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(2, 44, 34, 0.95) 100%);
            border-radius: 24px;
            padding: 24px 40px;
            border: 2px solid rgba(245, 158, 11, 0.45);
            box-shadow: 0 15px 35px rgba(0,0,0,0.55);
            backdrop-filter: blur(15px);
          }
          .candidate-label {
            font-size: 19px;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .candidate-name {
            font-size: 48px;
            font-weight: 800;
            color: #ffffff;
            text-shadow: 0 3px 10px rgba(0,0,0,0.8);
            margin: 4px 0 6px;
          }
          .candidate-designation {
            font-size: 28px;
            font-weight: 700;
            color: #38bdf8;
            text-shadow: 0 2px 6px rgba(0,0,0,0.5);
          }
          .candidate-meta {
            margin-top: 6px;
            font-size: 21px;
            color: #cbd5e1;
            font-weight: 500;
          }

          /* Watermark - Prominent diagonal overlay banner */
          .watermark-overlay {
            position: absolute;
            inset: 0;
            z-index: 100;
            overflow: hidden;
            pointer-events: none;
          }
          .watermark-overlay::before {
            content: '';
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 80px,
              rgba(255, 255, 255, 0.03) 80px,
              rgba(255, 255, 255, 0.03) 82px
            );
          }
          .watermark-band {
            position: absolute;
            top: 55px;
            left: -30px;
            right: -30px;
            background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.7) 100%);
            padding: 14px 0;
            text-align: center;
            z-index: 101;
            border-top: 3px solid rgba(245, 158, 11, 0.8);
            border-bottom: 3px solid rgba(245, 158, 11, 0.8);
          }
          .watermark-band-text {
            color: rgba(255, 255, 255, 0.92);
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 4px;
            text-transform: uppercase;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            font-family: 'Hind Siliguri', sans-serif;
          }
          .watermark-diagonal {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 180px;
            transform: rotate(-35deg);
            z-index: 99;
          }
          .watermark-diag-text {
            color: rgba(255, 255, 255, 0.12);
            font-size: 64px;
            font-weight: 900;
            letter-spacing: 12px;
            white-space: nowrap;
            font-family: 'Hind Siliguri', sans-serif;
            text-shadow: 0 0 20px rgba(0,0,0,0.3);
          }
        </style>
      </head>
      <body>
        <div class="poster">
          <div class="border-frame"></div>
          <div class="corner-deco corner-tl"></div>
          <div class="corner-deco corner-tr"></div>
          <div class="corner-deco corner-bl"></div>
          <div class="corner-deco corner-br"></div>
          <div class="bg-circle"></div>

          <!-- Header -->
          <div class="header-box">
            <div class="header-logo-bar">
              ${partyLogoHtml}
              <div class="party-pill">${formData.party || 'বাংলাদেশ'}</div>
              ${extraLogoHtml}
            </div>
            <h1 class="headline-text">${formData.headlineText || formData.headline || template.title}</h1>
            <div class="sub-occasion">${formData.district ? formData.district + ' • ' : ''}${template.title}</div>
          </div>

          <!-- Photos with Roles -->
          <div class="photos-container">
            ${photosHtml || '<div style="color: #cbd5e1; font-size: 24px;">ছবি সংযুক্ত নেই</div>'}
          </div>

          <!-- Footer Leader Details -->
          <div class="footer-box">
            <div class="candidate-label">প্রচারে / শুভেচ্ছান্তে</div>
            <div class="candidate-name">${formData.name || 'নেতার নাম'}</div>
            <div class="candidate-designation">${formData.designation || 'পদবী'}</div>
            <div class="candidate-meta">${formData.party || ''} ${formData.district ? '• ' + formData.district : ''}</div>
          </div>

          ${showWatermark ? `
          <!-- Prominent Watermark -->
          <div class="watermark-overlay">
            <div class="watermark-band">
              <div class="watermark-band-text">পোস্টার কারিগর &bull; POSTER KARIGOR</div>
            </div>
            <div class="watermark-diagonal">
              <div class="watermark-diag-text">পোস্টার কারিগর</div>
              <div class="watermark-diag-text">POSTER KARIGOR</div>
              <div class="watermark-diag-text">পোস্টার কারিগর</div>
            </div>
          </div>
          ` : ''}
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const screenshot = await page.screenshot({ type: 'png' });
    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}
