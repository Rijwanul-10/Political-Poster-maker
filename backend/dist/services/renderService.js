"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPosterToBuffer = renderPosterToBuffer;
const puppeteer_1 = __importDefault(require("puppeteer"));
/**
 * Stub renderer that uses Puppeteer to generate an image buffer.
 * In a real implementation you would load an HTML template, inject data and screenshots.
 */
async function renderPosterToBuffer(template, suggestion, formData, photoUrls) {
    // Simple HTML page for demo purposes
    const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .container { width: ${template.layoutConfig.canvas.width}px; height: ${template.layoutConfig.canvas.height}px; position: relative; background: #fff; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Placeholder content -->
          <h1>${formData.name ?? 'Name'}</h1>
        </div>
      </body>
    </html>
  `;
    const browser = await puppeteer_1.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html);
    const buffer = await page.screenshot({ type: 'png' });
    await browser.close();
    return buffer;
}
