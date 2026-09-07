// College Website Theme Presets & Engine
// Curated presets inspired by top benchmark institutions: VIT Pune, COEP Tech, MIT-WPU, Somaiya, Manipal, Amrita
export const THEME_PRESETS = {
  oxford: {
    id: 'oxford',
    name: 'VIT Pune & Vellore',
    badge: 'Autonomous Navy & Gold',
    description: 'Oxford Navy Blue (#002147) and Academic Gold (#D97706) inspired by VIT Pune & Vellore',
    primary: '#002147',
    primaryDark: '#00152E',
    primaryLight: '#0A3366',
    secondary: '#00529B',
    accent: '#D97706',
    accentLight: '#FEF3C7'
  },
  crimson: {
    id: 'crimson',
    name: 'COEP Tech Heritage',
    badge: 'Est. 1854 Pune',
    description: 'Heritage University Crimson (#8B0000) with Slate Gray and Warm Amber highlights',
    primary: '#8B0000',
    primaryDark: '#5C0000',
    primaryLight: '#A51C30',
    secondary: '#1E293B',
    accent: '#D97706',
    accentLight: '#FEF3C7'
  },
  indigo: {
    id: 'indigo',
    name: 'MIT-WPU Imperial',
    badge: 'Modern University',
    description: 'Contemporary Royal Blue (#1E3A8A) with Sky Blue (#0284C7) and Golden Accents',
    primary: '#1E3A8A',
    primaryDark: '#0F2460',
    primaryLight: '#2563EB',
    secondary: '#0284C7',
    accent: '#F59E0B',
    accentLight: '#FEF3C7'
  },
  emerald: {
    id: 'emerald',
    name: 'Somaiya & Amrita',
    badge: 'Distinguished Green',
    description: 'Imperial Forest Green (#064E3B) with Emerald highlights and Academic Gold',
    primary: '#064E3B',
    primaryDark: '#022C22',
    primaryLight: '#047857',
    secondary: '#0F766E',
    accent: '#D97706',
    accentLight: '#FEF3C7'
  },
  maroon: {
    id: 'maroon',
    name: 'Manipal & Christ',
    badge: 'University Burgundy',
    description: 'Rich Academic Burgundy Maroon (#7F1D1D) with Bronze Gold and Ivory accents',
    primary: '#7F1D1D',
    primaryDark: '#450A0A',
    primaryLight: '#991B1B',
    secondary: '#92400E',
    accent: '#D97706',
    accentLight: '#FEF3C7'
  },
  slate: {
    id: 'slate',
    name: 'Cyber Tech Slate',
    badge: 'AI & Research Hub',
    description: 'Futuristic Charcoal Slate (#0F172A) with Electric Blue (#2563EB) highlights',
    primary: '#0F172A',
    primaryDark: '#020617',
    primaryLight: '#1E293B',
    secondary: '#2563EB',
    accent: '#0284C7',
    accentLight: '#E0F2FE'
  }
};

export function applyTheme(settings = {}) {
  if (typeof document === 'undefined') return;

  const presetKey = settings.theme_preset || 'oxford';
  const preset = THEME_PRESETS[presetKey] || THEME_PRESETS.oxford;

  const primary = settings.theme_primary_color || preset.primary;
  const accent = settings.theme_accent_color || preset.accent;
  const primaryDark = preset.primaryDark;
  const primaryLight = preset.primaryLight;
  const secondary = preset.secondary;
  const accentLight = preset.accentLight;

  const root = document.documentElement;
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-dark', primaryDark);
  root.style.setProperty('--color-primary-light', primaryLight);
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-accent-light', accentLight);
}
