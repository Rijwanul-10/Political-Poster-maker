import puppeteer from 'puppeteer';
import { ITemplate } from '../models/Template';

/**
 * Renders a high-resolution, print-ready Bengali political or festival poster
 * using Puppeteer and CSS styling matching authentic Bangladeshi poster design grammar.
 * Supports stretch features:
 * - Custom Bangla headline font selection ('Tiro Bangla' | 'Hind Siliguri' | 'Anek Bangla')
 * - Flexible photo grid layouts (1-up, 2-up, 3-up grid or circle cutout)
 * - Optional watermark removal
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
  const primaryColor = suggestion?.colorScheme?.primaryColor || (isEid ? '#065f46' : '#047857');
  const accentColor = suggestion?.colorScheme?.accentColor || (isEid ? '#d97706' : '#dc2626');
  const goldColor = suggestion?.colorScheme?.goldColor || '#f59e0b';

  // Stretch Feature: Bangla font selection
  const chosenFont = formData.headlineFont || 'Tiro Bangla';
  const headlineFontFamily = chosenFont === 'Hind Siliguri' 
    ? "'Hind Siliguri', sans-serif" 
    : chosenFont === 'Anek Bangla' 
    ? "'Anek Bangla', sans-serif" 
    : "'Tiro Bangla', serif";

  // Stretch Feature: Multiple photo layout styles ('grid', 'cutout', 'circle')
  const photoLayout = formData.photoLayout || 'cutout';

  const photosHtml = photoUrls.map((url, idx) => `
    <div class="photo-card photo-card-${photoLayout} photo-${idx + 1}">
      <div class="photo-inner">
        <img src="${url}" alt="Leader ${idx + 1}" />
      </div>
      <div class="photo-glow"></div>
    </div>
  `).join('');

  // Stretch Feature: Watermark toggle
  const showWatermark = formData.watermark !== false;

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
            background: #ffffff;
          }
          .poster {
            width: ${width}px;
            height: ${height}px;
            position: relative;
            background: linear-gradient(180deg, ${primaryColor} 0%, #022c22 45%, #0f172a 100%);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 60px;
            color: #ffffff;
            overflow: hidden;
          }

          /* Bangladeshi Flag / Decorative Background Elements */
          .bg-circle {
            position: absolute;
            top: 280px;
            left: 50%;
            transform: translateX(-50%);
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, ${accentColor} 0%, rgba(220, 38, 38, 0.4) 60%, transparent 80%);
            border-radius: 50%;
            filter: blur(20px);
            z-index: 1;
            opacity: 0.85;
          }

          .border-frame {
            position: absolute;
            inset: 25px;
            border: 4px solid ${goldColor};
            border-radius: 20px;
            pointer-events: none;
            z-index: 50;
            box-shadow: inset 0 0 20px rgba(245, 158, 11, 0.3);
          }

          .corner-deco {
            position: absolute;
            width: 50px;
            height: 50px;
            border: 8px solid ${goldColor};
            z-index: 51;
          }
          .corner-tl { top: 35px; left: 35px; border-right: none; border-bottom: none; }
          .corner-tr { top: 35px; right: 35px; border-left: none; border-bottom: none; }
          .corner-bl { bottom: 35px; left: 35px; border-right: none; border-top: none; }
          .corner-br { bottom: 35px; right: 35px; border-left: none; border-top: none; }

          /* Header / Party / Slogan */
          .header-box {
            position: relative;
            z-index: 10;
            text-align: center;
          }
          .party-pill {
            display: inline-block;
            padding: 10px 40px;
            background: linear-gradient(90deg, #b45309, #d97706, #b45309);
            color: #ffffff;
            font-size: 26px;
            font-weight: 800;
            border-radius: 50px;
            letter-spacing: 1px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
            border: 2px solid #fef3c7;
            margin-bottom: 20px;
          }
          .headline-text {
            font-family: ${headlineFontFamily};
            font-size: 56px;
            font-weight: 800;
            line-height: 1.25;
            color: #fef08a;
            text-shadow: 0 4px 15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.5);
            max-width: 1000px;
            margin: 0 auto;
          }
          .sub-occasion {
            font-size: 28px;
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
            gap: 30px;
            margin: 30px 0;
            flex: 1;
          }
          .photo-card {
            position: relative;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            border: 5px solid #fcd34d;
            background: #000;
          }
          .photo-card-circle {
            border-radius: 50% !important;
            border: 6px solid #fcd34d !important;
          }
          .photo-card-grid {
            border-radius: 16px !important;
            border: 4px solid #f59e0b !important;
          }
          .photo-1 { width: 340px; height: 420px; }
          .photo-2 { width: 340px; height: 420px; }
          .photo-3 { width: 300px; height: 380px; }
          .photo-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          /* Bottom Candidate Card / Ribbon */
          .footer-box {
            position: relative;
            z-index: 10;
            text-align: center;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(2, 44, 34, 0.95) 100%);
            border-radius: 24px;
            padding: 28px 40px;
            border: 2px solid rgba(245, 158, 11, 0.4);
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
          }
          .candidate-label {
            font-size: 20px;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .candidate-name {
            font-size: 50px;
            font-weight: 800;
            color: #ffffff;
            text-shadow: 0 3px 10px rgba(0,0,0,0.8);
            margin: 4px 0 8px;
          }
          .candidate-designation {
            font-size: 30px;
            font-weight: 700;
            color: #38bdf8;
            text-shadow: 0 2px 6px rgba(0,0,0,0.5);
          }
          .candidate-meta {
            margin-top: 8px;
            font-size: 22px;
            color: #cbd5e1;
            font-weight: 500;
          }

          /* Watermark */
          .watermark-tag {
            position: absolute;
            bottom: 35px;
            right: 45px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.4);
            letter-spacing: 1px;
            z-index: 52;
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
            <div class="party-pill">${formData.party || 'বাংলাদেশ'}</div>
            <h1 class="headline-text">${formData.headlineText || formData.headline || template.title}</h1>
            <div class="sub-occasion">${formData.district ? formData.district + ' • ' : ''}${template.title}</div>
          </div>

          <!-- Photos -->
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

          ${showWatermark ? '<div class="watermark-tag">পোস্টার কারিগর • AI Studio</div>' : ''}
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
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const screenshot = await page.screenshot({ type: 'png' });
    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}
