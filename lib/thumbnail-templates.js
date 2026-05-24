export const THUMBNAIL_MODES = [
  { id: 'cinematic', name: 'Cinematic', description: 'Premium cinematic poster treatments' },
  { id: 'netflix', name: 'Netflix Cinematic', description: 'Bold portrait poster with streaming aesthetic' },
  { id: 'marvel', name: 'Marvel Superhero', description: 'Heroic character poster, dynamic lighting' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', description: 'Neon glows, high-contrast futurism' },
  { id: 'horror', name: 'Horror Dark', description: 'Dark tones, suspenseful composition' },
  { id: 'anime', name: 'Anime Poster', description: 'Stylized character art and dynamic lighting' },
  { id: 'spotify', name: 'Spotify Album', description: 'Square album cover optimized for streaming' },
  { id: 'gaming', name: 'Gaming Esports', description: 'Action, UI overlays, high energy' },
  { id: 'scifi', name: 'Sci-Fi Futuristic', description: 'Futuristic vistas and sleek UI' },
  { id: 'vaporwave', name: 'Retro Vaporwave', description: 'Pastel neons, synthwave aesthetics' },
  { id: 'action', name: 'Action Blockbuster', description: 'Explosive, high-impact poster' },
];

export const ASPECT_RATIOS = [
  { id: '16:9', w: 1600, h: 900 },
  { id: '4:5', w: 1080, h: 1350 },
  { id: '1:1', w: 1200, h: 1200 },
  { id: '9:16', w: 1080, h: 1920 },
];

export function buildModePrompt(mode, title, overlay = '', style = '') {
  const base = `${title} ${overlay}`.trim();
  switch (mode) {
    case 'cinematic':
      return `Ultra-detailed cinematic poster for ${base}. Dramatic lighting, volumetric fog, shallow depth of field, cinematic color grading, epic composition, high contrast, 8k, studio photography, poster typography.`;
    case 'netflix':
      return `Netflix-style cinematic poster for ${base}. Portrait orientation, moody rim lighting, cinematic color grading (teal & orange), large bold title, high-contrast studio photo quality.`;
    case 'marvel':
      return `Superhero blockbuster poster for ${base}. Heroic pose, dramatic backlighting, sun flares, cinematic lens, dynamic composition, bold metallic typography, ultra-detailed.`;
    case 'cyberpunk':
      return `Cyberpunk neon scene for ${base}. Rain-soaked city, neon signs, magenta & cyan rim lights, holographic elements, high contrast reflections, moody atmosphere, cinematic depth.`;
    case 'gaming':
      return `Esports-style gaming thumbnail for ${base}. Action-focused subject, motion energy lines, HUD overlays, bold title, high saturation, crisp contrast, dynamic angle.`;
    case 'horror':
      return `Horror dark poster for ${base}. Deep shadows, desaturated tones with a single blood-red accent, subtle grain, ominous composition, unsettling negative space.`;
    case 'anime':
      return `Anime poster illustration for ${base}. Dynamic character composition, cel-shading, strong rim light, vibrant palette, exaggerated perspective, detailed background.`;
    case 'spotify':
      return `Square album cover for ${base}. Bold typography, simple iconography, cohesive color grading, textured background, modern minimal layout optimized for streaming.`;
    case 'scifi':
      return `Sci-fi futuristic vista for ${base}. Sleek architecture, hyperspace lighting, cool blue palette, holographic UI elements, ultra-detailed, cinematic scale.`;
    case 'vaporwave':
      return `Retro vaporwave poster for ${base}. Pastel gradients, palm silhouettes, retro grid perspective, neon pink & cyan, nostalgic synthwave vibe.`;
    case 'action':
      return `Action blockbuster poster for ${base}. Explosive particles, high-energy composition, dramatic lens flare, intense contrast, bold metallic typography.`;
    default:
      return `Cinematic artwork for ${base}. Premium lighting, depth, and typographic treatment.`;
  }
}

export const TYPOGRAPHY_PRESETS = {
  cinematic: { font: 'Inter, system-ui, sans-serif', size: 64, weight: 800, tracking: -0.02, style: 'uppercase', shadow: '0 12px 30px rgba(0,0,0,0.6)' },
  netflix: { font: 'Bebas Neue, system-ui, sans-serif', size: 72, weight: 700, tracking: 0, style: 'uppercase', shadow: '0 10px 20px rgba(0,0,0,0.55)' },
  marvel: { font: 'Impact, system-ui, sans-serif', size: 80, weight: 900, tracking: 0.02, style: 'uppercase', shadow: '0 14px 36px rgba(0,0,0,0.7)' },
  cyberpunk: { font: 'Orbitron, system-ui, sans-serif', size: 56, weight: 700, tracking: 0.01, style: 'uppercase', shadow: '0 8px 16px rgba(0,0,0,0.5)' },
  gaming: { font: 'Bungee, system-ui, sans-serif', size: 64, weight: 800, tracking: 0, style: 'uppercase', shadow: '0 10px 24px rgba(0,0,0,0.6)' },
  horror: { font: 'Cinzel, system-ui, serif', size: 60, weight: 700, tracking: 0, style: 'capitalize', shadow: '0 12px 28px rgba(0,0,0,0.7)' },
  anime: { font: 'Noto Sans JP, system-ui, sans-serif', size: 64, weight: 800, tracking: 0, style: 'uppercase', shadow: '0 8px 20px rgba(0,0,0,0.45)' },
  spotify: { font: 'Circular, system-ui, sans-serif', size: 56, weight: 700, tracking: 0, style: 'normal', shadow: '0 6px 16px rgba(0,0,0,0.35)' },
  scifi: { font: 'Rajdhani, system-ui, sans-serif', size: 60, weight: 700, tracking: 0.01, style: 'uppercase', shadow: '0 10px 22px rgba(0,0,0,0.5)' },
  vaporwave: { font: 'Montserrat, system-ui, sans-serif', size: 58, weight: 700, tracking: 0.02, style: 'uppercase', shadow: '0 8px 18px rgba(0,0,0,0.4)' },
  action: { font: 'Anton, system-ui, sans-serif', size: 76, weight: 900, tracking: 0, style: 'uppercase', shadow: '0 16px 40px rgba(0,0,0,0.75)' },
};

export function getModePalette(mode) {
  switch (mode) {
    case 'netflix': return ['#0b0f14', '#e50914', '#0f172a'];
    case 'marvel': return ['#08090b', '#d4a017', '#e63946'];
    case 'cyberpunk': return ['#0f172a', '#ff2d95', '#06b6d4'];
    case 'horror': return ['#050406', '#2b0b0b', '#8b0000'];
    case 'anime': return ['#0f172a', '#ff7ab6', '#ffd873'];
    case 'spotify': return ['#191414', '#1db954', '#1ed760'];
    case 'gaming': return ['#071122', '#00b7ff', '#ff0057'];
    case 'scifi': return ['#021024', '#7be4ff', '#a0a8ff'];
    case 'vaporwave': return ['#1b0727', '#ff77ff', '#7ef0ff'];
    case 'action': return ['#07070a', '#ffb703', '#ef233c'];
    default: return ['#0f172a', '#06b6d4', '#ec4899'];
  }
}

