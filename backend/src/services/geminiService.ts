import axios from 'axios';
import { ITemplate } from '../models/Template';
import { GenerationLog } from '../models/GenerationLog';
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
    secondaryBgColor?: string;
    accentColor: string;
    goldColor: string;
    themeName: string;
    bgGradientType?: 'linear' | 'radial' | 'mesh' | 'angular';
    cardTheme?: 'glass' | 'gold_frame' | 'modern_clean' | 'patriotic' | 'bold_dark';
  };
  sloganTagline?: string;
}

interface TemplateDecorationCache {
  colorScheme: {
    primaryColor: string;
    secondaryBgColor?: string;
    accentColor: string;
    goldColor: string;
    themeName: string;
    bgGradientType?: 'linear' | 'radial' | 'mesh' | 'angular';
    cardTheme?: 'glass' | 'gold_frame' | 'modern_clean' | 'patriotic' | 'bold_dark';
  };
  sloganTagline?: string;
  cachedAt: number;
}

/**
 * In-memory AI cost-control cache:
 * Stores template-level decorative color schemes and layouts per occasion/party/prompt,
 * so duplicate calls across users or bulk generations reuse the AI output with 0 token cost and instant latency.
 */
const templateDecorationCache = new Map<string, TemplateDecorationCache>();

/**
 * Calls Google Gemini API for creative poster composition suggestions (color palette, focal crops, layout theme)
 * incorporating user's custom design & color preference prompt, with template-level caching and cost tracking.
 */
export async function generateLayoutSuggestion(
  template: ITemplate,
  photoUrls: string[],
  formData: any,
  posterId?: any,
): Promise<GeminiLayoutSuggestion> {
  const startTime = Date.now();
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

  // 1. Check Gemini Cost-Control Cache
  const userPromptClean = (formData.userDesignPrompt || '').trim().toLowerCase();
  const cacheKey = `${template._id || template.occasionType}_${formData.party || 'default'}_${userPromptClean}`;

  if (templateDecorationCache.has(cacheKey)) {
    const cached = templateDecorationCache.get(cacheKey)!;
    const latencyMs = Date.now() - startTime;
    console.log(`⚡ [Gemini Cost Control] Reusing cached template-level decoration for: "${cacheKey}" (0 tokens, ${latencyMs}ms)`);

    // Log cache hit to GenerationLog
    if (posterId) {
      GenerationLog.create({
        posterId,
        geminiPromptUsed: `[CACHE_HIT] ${cacheKey}`,
        tokensUsed: 0,
        latencyMs,
        success: true,
        cached: true,
      }).catch((err) => console.warn('Failed to log cached GenerationLog:', err.message));
    }

    return {
      crops: photoUrls.map((url, i) => ({
        slotId: `photo${i + 1}`,
        url,
        focus: 'face',
        scale: 1.0,
      })),
      colorScheme: cached.colorScheme,
      sloganTagline: cached.sloganTagline || formData.headline,
    };
  }

  // If no API key configured, use intelligent heuristic parsing user's prompt
  if (!apiKey) {
    const fallback = getFallbackLayoutSuggestion(template, photoUrls, formData);
    // Cache the heuristic result as well
    templateDecorationCache.set(cacheKey, {
      colorScheme: fallback.colorScheme,
      sloganTagline: fallback.sloganTagline,
      cachedAt: Date.now(),
    });

    if (posterId) {
      GenerationLog.create({
        posterId,
        geminiPromptUsed: '[HEURISTIC_FALLBACK] No API Key',
        tokensUsed: 0,
        latencyMs: Date.now() - startTime,
        success: true,
        cached: false,
      }).catch(() => {});
    }

    return fallback;
  }

  const userPrompt = formData.userDesignPrompt
    ? `User Design & Color Preference: "${formData.userDesignPrompt}"`
    : 'No custom user prompt; design according to occasion and party colors.';

  const prompt = `
You are a master graphic designer specializing in Bangladeshi political, celebration, and VIP print posters.
The user wants a customized poster layout and color scheme.
${userPrompt}

Analyze the poster request below and output a STRICT JSON object (no markdown, no backticks, just raw JSON):
- Occasion: ${formData.occasionType || template.occasionType}
- Template Title: ${template.title}
- Headline: ${formData.headlineText || formData.headline || ''}
- Party/Organization: ${formData.party || ''}
- Candidate: ${formData.name || ''}, ${formData.designation || ''}
- Number of Photos: ${photoUrls.length}

Respond with EXACTLY this JSON structure:
{
  "themeName": "creative theme name in Bengali/English",
  "primaryColor": "#hex (deep dominant background color, e.g. deep royal blue, emerald green, midnight navy, maroon, or dark carbon)",
  "secondaryBgColor": "#hex (complementary darker contrast shade for bottom/gradient)",
  "accentColor": "#hex (vibrant accent highlight like cyan, golden amber, fiery crimson, or bright emerald)",
  "goldColor": "#hex (luxurious gold or yellow accent, e.g. #f59e0b)",
  "bgGradientType": "linear" | "radial" | "mesh" | "angular",
  "cardTheme": "glass" | "gold_frame" | "modern_clean" | "patriotic" | "bold_dark",
  "crops": [
    ${photoUrls.map((_, i) => `{"slotId": "photo${i + 1}", "focus": "face", "scale": 1.0}`).join(',\n    ')}
  ],
  "sloganTagline": "refined impactful slogan in Bengali"
}
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 350,
        },
      },
      { timeout: 4500 }
    );

    const latencyMs = Date.now() - startTime;
    const tokensUsed = response.data?.usageMetadata?.totalTokenCount || 0;

    const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response from Gemini');
    }

    // Clean JSON markdown fences if present
    const cleanedJson = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    const suggestion: GeminiLayoutSuggestion = {
      crops: photoUrls.map((url, i) => ({
        slotId: `photo${i + 1}`,
        url,
        focus: parsed.crops?.[i]?.focus || 'face',
        scale: parsed.crops?.[i]?.scale || 1.0,
      })),
      colorScheme: {
        primaryColor: parsed.primaryColor || '#064e3b',
        secondaryBgColor: parsed.secondaryBgColor || '#022c22',
        accentColor: parsed.accentColor || '#dc2626',
        goldColor: parsed.goldColor || '#f59e0b',
        themeName: parsed.themeName || 'AI Custom Theme',
        bgGradientType: parsed.bgGradientType || 'linear',
        cardTheme: parsed.cardTheme || 'glass',
      },
      sloganTagline: parsed.sloganTagline || formData.headline,
    };

    // Cache the template-level decoration output for future users
    templateDecorationCache.set(cacheKey, {
      colorScheme: suggestion.colorScheme,
      sloganTagline: suggestion.sloganTagline,
      cachedAt: Date.now(),
    });

    // Record cost tracking log
    if (posterId) {
      GenerationLog.create({
        posterId,
        geminiPromptUsed: prompt.trim(),
        tokensUsed,
        latencyMs,
        success: true,
        cached: false,
      }).catch((err) => console.warn('Failed to log GenerationLog:', err.message));
    }

    return suggestion;
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.warn('⚠️ Gemini API fallback invoked (reason: ' + (err.message || 'timeout/key') + ')');

    // Record error attempt
    if (posterId) {
      GenerationLog.create({
        posterId,
        geminiPromptUsed: prompt.trim(),
        tokensUsed: 0,
        latencyMs,
        success: false,
        cached: false,
        errorMessage: err.message,
      }).catch(() => {});
    }

    const fallback = getFallbackLayoutSuggestion(template, photoUrls, formData);
    // Cache the fallback so repeated failures don't hammer the API
    templateDecorationCache.set(cacheKey, {
      colorScheme: fallback.colorScheme,
      sloganTagline: fallback.sloganTagline,
      cachedAt: Date.now(),
    });

    return fallback;
  }
}

/**
 * Intelligent deterministic fallback matching user prompt keywords and Bangladeshi poster design grammar.
 */
function getFallbackLayoutSuggestion(
  template: ITemplate,
  photoUrls: string[],
  formData: any,
): GeminiLayoutSuggestion {
  const occasion = (formData.occasionType || template.occasionType || '').toLowerCase();
  const userPrompt = (formData.userDesignPrompt || '').toLowerCase();

  // Smart color parsing based on user's custom prompt
  let primaryColor = '#064e3b';
  let secondaryBgColor = '#022c22';
  let accentColor = '#dc2626';
  let goldColor = '#f59e0b';
  let themeName = 'জাতীয় বিজয় থিম';
  let bgGradientType: 'linear' | 'radial' | 'mesh' | 'angular' = 'linear';
  let cardTheme: 'glass' | 'gold_frame' | 'modern_clean' | 'patriotic' | 'bold_dark' = 'glass';

  if (userPrompt.includes('blue') || userPrompt.includes('নীল') || userPrompt.includes('navy') || userPrompt.includes('নেভি') || userPrompt.includes('royal')) {
    primaryColor = '#0f294a';
    secondaryBgColor = '#031024';
    accentColor = '#0284c7';
    goldColor = '#fbbf24';
    themeName = 'রয়েল ব্লু ও সোনালী লাক্সারি থিম';
    cardTheme = 'glass';
    bgGradientType = 'linear';
  } else if (userPrompt.includes('purple') || userPrompt.includes('বেগুনি') || userPrompt.includes('violet') || userPrompt.includes('magenta')) {
    primaryColor = '#3b0764';
    secondaryBgColor = '#1e0c38';
    accentColor = '#c026d3';
    goldColor = '#facc15';
    themeName = 'রয়েল পার্পল ও অ্যামেথিস্ট থিম';
    cardTheme = 'glass';
    bgGradientType = 'radial';
  } else if (userPrompt.includes('dark') || userPrompt.includes('black') || userPrompt.includes('কালো') || userPrompt.includes('cyber') || userPrompt.includes('night')) {
    primaryColor = '#09090b';
    secondaryBgColor = '#18181b';
    accentColor = '#38bdf8';
    goldColor = '#f59e0b';
    themeName = 'মডার্ন ডার্ক সাইবার গ্লাস থিম';
    cardTheme = 'bold_dark';
    bgGradientType = 'mesh';
  } else if (userPrompt.includes('red') || userPrompt.includes('লাল') || userPrompt.includes('crimson') || userPrompt.includes('maroon') || userPrompt.includes('মেরুন')) {
    primaryColor = '#881337';
    secondaryBgColor = '#4c0519';
    accentColor = '#f43f5e';
    goldColor = '#fde047';
    themeName = 'বোল্ড ক্রাইমসন ও গোল্ডেন পাওয়ার থিম';
    cardTheme = 'patriotic';
    bgGradientType = 'angular';
  } else if (userPrompt.includes('orange') || userPrompt.includes('কমলা') || userPrompt.includes('amber') || userPrompt.includes('গেরুয়া')) {
    primaryColor = '#7c2d12';
    secondaryBgColor = '#431407';
    accentColor = '#ea580c';
    goldColor = '#fef08a';
    themeName = 'সানসেট অ্যাম্বার ও গোল্ড উৎসব থিম';
    cardTheme = 'modern_clean';
    bgGradientType = 'linear';
  } else if (userPrompt.includes('gold') || userPrompt.includes('সোনালী') || userPrompt.includes('vip') || userPrompt.includes('লাক্সারি')) {
    primaryColor = '#1e293b';
    secondaryBgColor = '#0f172a';
    accentColor = '#f59e0b';
    goldColor = '#fef08a';
    themeName = 'রয়েল প্রিমিয়াম গোল্ডেন ভিআইপি থিম';
    cardTheme = 'gold_frame';
    bgGradientType = 'linear';
  } else if (occasion.includes('eid') || occasion.includes('utsob') || userPrompt.includes('eid') || userPrompt.includes('ঈদ')) {
    primaryColor = '#065f46';
    secondaryBgColor = '#022c22';
    accentColor = '#d97706';
    goldColor = '#fbbf24';
    themeName = 'ঈদ মোবারক উৎসব থিম';
    cardTheme = 'glass';
  } else if (occasion.includes('rally') || occasion.includes('political') || occasion.includes('election')) {
    primaryColor = '#0f172a';
    secondaryBgColor = '#020617';
    accentColor = '#e11d48';
    goldColor = '#eab308';
    themeName = 'দলীয় সমাবেশ ও মহাসমাবেশ থিম';
    cardTheme = 'patriotic';
  } else if (occasion.includes('shok') || occasion.includes('tribute') || userPrompt.includes('শোক')) {
    primaryColor = '#18181b';
    secondaryBgColor = '#09090b';
    accentColor = '#71717a';
    goldColor = '#d4d4d8';
    themeName = 'শ্রদ্ধাঞ্জলি ও শোক থিম';
    cardTheme = 'bold_dark';
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
      secondaryBgColor,
      accentColor,
      goldColor,
      themeName,
      bgGradientType,
      cardTheme,
    },
    sloganTagline: formData.headline,
  };
}
