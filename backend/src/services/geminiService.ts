import axios from 'axios';
import { Template } from '../models/Template';

/**
 * Mock implementation of Gemini layout suggestion.
 * In a real project you would call the Gemini API with a prompt that includes the template metadata,
 * photo URLs and form data, and parse the JSON response.
 */
export async function generateLayoutSuggestion(
  template: Template,
  photoUrls: string[],
  formData: any,
): Promise<{ crops: any[]; colorScheme?: string }> {
  // For MVP we return a deterministic placeholder:
  const crops = photoUrls.map((url, idx) => ({
    url,
    // Dummy crop: use the whole image
    crop: { x: 0, y: 0, width: 1, height: 1 },
    slotId: `photo${idx + 1}`,
  }));

  // Simple colour scheme based on occasion type (if any)
  const colorScheme = formData?.occasionType?.includes('eid') ? 'green' : 'red';

  return { crops, colorScheme };
}
