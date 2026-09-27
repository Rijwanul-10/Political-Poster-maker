import puppeteer from 'puppeteer';
import { ITemplate } from '../models/Template';
import { IPoster } from '../models/Poster';

/**
 * Stub renderer that uses Puppeteer to generate an image buffer.
 * In a real implementation you would load an HTML template, inject data and screenshots.
 */
export async function renderPosterToBuffer(
  template: ITemplate,
  suggestion: any,
  formData: any,
  photoUrls: string[],
): Promise<Buffer> {
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

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html);
  const buffer = await page.screenshot({ type: 'png' }) as Buffer;
  await browser.close();
  return buffer;
}
