
export enum GenerationStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  GENERATING_ASSETS = 'GENERATING_ASSETS',
  ASSEMBLING_PAGE = 'ASSEMBLING_PAGE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum ArtStyle {
  DOODLE = 'Hand-drawn Doodle (Black & White)',
  GRAFFITI = 'Colorful Graffiti',
  WATERCOLOR = 'Watercolor Sketch',
  MARKER = 'Permanent Marker',
  BLUEPRINT = 'Rough Blueprint'
}

export interface DesignSystem {
  themeName: string;
  visualDescription: string;
  colorPalette: string[];
  backgroundHex: string;
  fontPairing: {
    heading: string;
    body: string;
  };
}

export interface VisualAsset {
  id: string;
  name: string;
  description: string;
  // 'cutout' implies an object intended to be overlayed (blended)
  // 'texture' implies a full background layer
  type: 'background_texture' | 'hero_cutout' | 'ui_sticker' | 'decoration_cutout';
  imageUrl?: string;
  status: 'pending' | 'working' | 'completed' | 'error';
}

export interface ProjectPlan {
  designSystem: DesignSystem;
  assets: VisualAsset[];
}

export interface GeneratedPage {
  html: string;
  assets: VisualAsset[];
  designSystem: DesignSystem;
}

export interface GeneratedComponent {
  prompt: string;
  code: string;
  imageUrl?: string;
}
