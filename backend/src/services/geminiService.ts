import axios from 'axios';
import { ITemplate } from '../models/Template';
import { config } from '../config';

export interface GeminiLayoutSuggestion {
  crops: Array<{
    slotId: string;
    url: string;
    focus: 'face' | 'center';
    scale: number;
  }>;
  colorScheme: {
    primaryColor: string;
    accentColor: string;
    goldColor: string;
    themeName: string;
  };
  sloganTagline?: string;
}

/**
 * Calls Google Gemini API for creative poster composition suggestions (color palette, focal crops)
 * with robust error handling and instant fallback per architecture.md §6.
 */
export async function generateLayoutSuggestion(
  template: ITemplate,
  photoUrls: string[],
  formData: any,
): Promise<GeminiLayoutSuggestion> {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

  // If no API key configured, use intelligent default heuristics
  if (!apiKey) {
    return getFallbackLayoutSuggestion(template, photoUrls, formData);
  }

  const prompt = `
You are a senior graphic designer specializing in Bangladeshi political and festive print posters.
Analyze the following poster request and output a STRICT JSON object (no markdown, no backticks, just raw JSON) with aesthetic layout and color suggestions:

Occasion: ${formData.occasionType || template.occasionType}
Template Title: ${template.title}
Headline: ${formData.headlineText || formData.headline || ''}
Party/Organization: ${formData.party || ''}
Candidate: ${formData.name || ''}, ${formData.designation || ''}
Number of Photos: ${photoUrls.length}

Respond with EXACTLY this JSON structure:
{
  "themeName": "name of theme",
  "primaryColor": "#hex (deep rich dark/green/navy)",
  "accentColor": "#hex (vibrant red/emerald/gold)",
  "goldColor": "#f59e0b",
  "crops": [
    ${photoUrls.map((_, i) => `{"slotId": "photo${i + 1}", "focus": "face", "scale": 1.0}`).join(',\n    ')}
  ],
  "sloganTagline": "refined impactful slogan in Bengali"
}
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        },
      },
      { timeout: 4500 }
    );

    const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response from Gemini');
    }

    // Clean JSON markdown fences if present
    const cleanedJson = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      crops: photoUrls.map((url, i) => ({
        slotId: `photo${i + 1}`,
        url,
        focus: parsed.crops?.[i]?.focus || 'face',
        scale: parsed.crops?.[i]?.scale || 1.0,
      })),
      colorScheme: {
        primaryColor: parsed.primaryColor || '#064e3b',
        accentColor: parsed.accentColor || '#dc2626',
        goldColor: parsed.goldColor || '#f59e0b',
        themeName: parsed.themeName || 'AI Custom Theme',
      },
      sloganTagline: parsed.sloganTagline || formData.headline,
    };
  } catch (err: any) {
    console.warn('⚠️ Gemini API fallback invoked (reason: ' + (err.message || 'timeout/key') + ')');
    return getFallbackLayoutSuggestion(template, photoUrls, formData);
  }
}

/**
 * Deterministic fallback matching Bangladeshi political poster color grammar.
 */
function getFallbackLayoutSuggestion(
  template: ITemplate,
  photoUrls: string[],
  formData: any,
): GeminiLayoutSuggestion {
  const occasion = (formData.occasionType || template.occasionType || '').toLowerCase();

  let primaryColor = '#064e3b'; // Default Forest Green (Bangladesh flag vibe)
  let accentColor = '#dc2626';  // Red circle accent
  let goldColor = '#f59e0b';    // Royal Gold
  let themeName = 'জাতীয় বিজয় থিম';

  if (occasion.includes('eid') || occasion.includes('utsob')) {
    primaryColor = '#065f46';
    accentColor = '#d97706';
    goldColor = '#fbbf24';
    themeName = 'ঈদ মোবারক উৎসব থিম';
  } else if (occasion.includes('rally') || occasion.includes('political') || occasion.includes('election')) {
    primaryColor = '#0f172a';
    accentColor = '#e11d48';
    goldColor = '#eab308';
    themeName = 'দলীয় সমাবেশ ও প্রচার থিম';
  } else if (occasion.includes('shok') || occasion.includes('tribute')) {
    primaryColor = '#18181b';
    accentColor = '#71717a';
    goldColor = '#d4d4d8';
    themeName = 'শ্রদ্ধাঞ্জলি ও শোক থিম';
  }

  const crops = photoUrls.map((url, idx) => ({
    slotId: `photo${idx + 1}`,
    url,
    focus: 'face' as const,
    scale: 1.0,
  }));

  return {
    crops,
    colorScheme: {
      primaryColor,
      accentColor,
      goldColor,
      themeName,
    },
    sloganTagline: formData.headline,
  };
}
