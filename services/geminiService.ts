
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ArtStyle, VisualAsset, DesignSystem, ProjectPlan } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to strip markdown code blocks
const cleanCodeBlock = (text: string): string => {
  const codeBlockRegex = /```(?:html|tsx|jsx|javascript|typescript|react)?\s*([\s\S]*?)\s*```/;
  const match = text.match(codeBlockRegex);
  if (match) return match[1].trim();

  const firstOpen = text.indexOf('<');
  const lastClose = text.lastIndexOf('>');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    return text.substring(firstOpen, lastClose + 1);
  }
  return text.trim();
};

/**
 * Step 1: PLAN - Define the "Collage Elements"
 */
export const planUIKit = async (userPrompt: string): Promise<ProjectPlan> => {
  try {
    const prompt = `
      You are an Avant-Garde Web Designer.
      User Request: "${userPrompt}"

      GOAL: Plan a "One-Page Poster" style website.
      DO NOT plan a standard scrollable website with blocks.
      Plan a chaotic, artistic, organic COLLAGE.

      1. Design System:
         - Theme Name.
         - Visual Description: Emphasize "organic", "overlapping", "hand-made".
         - Color Palette: 3-5 vivid colors.
         - Background: Must be a very light paper-like color (e.g. #fdfbf7, #fffdf0) so we can use blending modes effectively.

      2. Visual Assets (Generate 5-7 items):
         - **background_texture**: A full-screen subtle texture (paper, wall, noise).
         - **hero_cutout**: The main visual centerpiece (e.g. a giant character, a machine, a building).
         - **ui_sticker**: Functional elements treated as "stickers" (e.g., a "Start" button drawn on a piece of tape, a nav menu on a torn receipt).
         - **decoration_cutout**: Floating elements to add depth (e.g., stars, doodles, arrows, coffee stains).

      Ensure variety in shapes (tall, wide, circular, irregular).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            designSystem: {
              type: Type.OBJECT,
              properties: {
                themeName: { type: Type.STRING },
                visualDescription: { type: Type.STRING },
                colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                backgroundHex: { type: Type.STRING },
                fontPairing: {
                  type: Type.OBJECT,
                  properties: { heading: { type: Type.STRING }, body: { type: Type.STRING } }
                }
              },
              required: ['themeName', 'visualDescription', 'colorPalette', 'backgroundHex', 'fontPairing']
            },
            assets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['background_texture', 'hero_cutout', 'ui_sticker', 'decoration_cutout'] }
                },
                required: ['id', 'name', 'description', 'type']
              }
            }
          },
          required: ['designSystem', 'assets']
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);

  } catch (error) {
    console.error("Error planning UI kit:", error);
    throw new Error("Failed to plan the collage.");
  }
};

/**
 * Step 2: PAINT - Generate "Stickers" optimized for Blending
 */
export const generateAssetImage = async (asset: VisualAsset, style: ArtStyle, designSystem: DesignSystem): Promise<string> => {
  try {
    const stylePrompts: Record<ArtStyle, string> = {
      [ArtStyle.DOODLE]: "black ink doodle on white paper, thick varied line weight",
      [ArtStyle.GRAFFITI]: "street art sticker, distinct outline, vibrant marker colors on white",
      [ArtStyle.WATERCOLOR]: "watercolor painting, distinct edges, white background",
      [ArtStyle.MARKER]: "permanent marker sketch, bold strokes, white background",
      [ArtStyle.BLUEPRINT]: "blue ink technical drawing on white paper"
    };

    let specificInstruction = "";
    if (asset.type === 'background_texture') {
      specificInstruction = "A seamless full-page paper/wall texture. Light and subtle pattern. No text.";
    } else {
      specificInstruction = `
        ISOLATED OBJECT on PURE WHITE (#FFFFFF) background.
        High contrast.
        Die-cut sticker style.
        Definite edges.
        NO cropped edges (keep the whole object in frame).
      `;
    }

    const fullPrompt = `
      Create a design asset: "${asset.name}"
      Type: ${asset.type}
      Style: ${stylePrompts[style]}
      Palette: ${designSystem.colorPalette.join(', ')}
      
      Instructions:
      ${asset.description}
      ${specificInstruction}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] }
    });

    let imageUrl = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error("No image generated.");
    return imageUrl;

  } catch (error) {
    console.error(`Error generating image for ${asset.name}:`, error);
    throw error;
  }
};

/**
 * Step 3: ASSEMBLE - The "Collage Artist"
 */
export const assembleFullPage = async (
  assets: VisualAsset[], 
  designSystem: DesignSystem, 
  userPrompt: string
): Promise<string> => {
  try {
    const assetCatalog = assets.map(a => `
      - ID: ${a.id}
      - Type: ${a.type}
      - Desc: ${a.name}
      - Token: __ASSET_${a.id}__
    `).join('\n');

    const prompt = `
    You are an Award-Winning Digital Collage Artist and Frontend Developer.
    User Request: "${userPrompt}"
    
    GOAL: Create a single-screen, immersive, poster-style landing page.
    AESTHETIC: "Ordered Chaos". Organic, overlapping, tactile.
    
    ASSETS AVAILABLE:
    ${assetCatalog}
    
    DESIGN SYSTEM:
    - Background Hex: ${designSystem.backgroundHex}
    - Colors: ${designSystem.colorPalette.join(', ')}
    - Fonts: ${designSystem.fontPairing.heading}, ${designSystem.fontPairing.body}
    
    CRITICAL IMPLEMENTATION RULES (READ CAREFULLY):
    
    1. **NO WHITE BOXES**:
       - All images provided have white backgrounds. 
       - You MUST apply \`mix-blend-multiply\` (class="mix-blend-multiply") to ALL foreground images (hero, stickers, decorations).
       - This will make the white background transparent and blend the ink/paint into the page background.
    
    2. **Composition & Layout**:
       - **Do NOT use a standard grid.**
       - Use \`absolute\` positioning for almost everything to create a collage.
       - Use \`transform: rotate(...)\` liberally (e.g., -2deg, 5deg) to make elements look like they were pasted on.
       - Use \`z-index\` to layer decorations behind or in front of the hero.
       - The 'background_texture' should be \`absolute inset-0 object-cover -z-50 opacity-50\`.
    
    3. **UI Elements as Stickers**:
       - Buttons should look like they are drawn on the 'ui_sticker' asset. 
       - If you have a 'ui_sticker' for a button, wrap the text in a div, put the image absolutely behind the text, and rotate the whole container slightly.
    
    4. **Typography**:
       - Big, bold, artistic typography.
       - Text should also feel placed organically.
    
    5. **Interaction**:
       - Add \`hover:scale-105 hover:rotate-0 transition-transform duration-300\` to interactive elements.
    
    OUTPUT:
    - Return ONLY the valid HTML string.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: prompt }] }
    });

    let html = response.text ? cleanCodeBlock(response.text) : "";
    
    assets.forEach(asset => {
      if (asset.imageUrl) {
        const regex = new RegExp(`__ASSET_${asset.id}__`, 'g');
        html = html.replace(regex, asset.imageUrl);
      }
    });

    return html;

  } catch (error) {
    console.error("Error assembling page:", error);
    return "<div class='text-red-500'>Failed to assemble collage.</div>";
  }
};
