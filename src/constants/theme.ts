export const colors = {
  background: '#F7F4F0',
  surface: '#FFFFFF',
  surfaceMuted: '#F0EBE5',
  text: '#1A1A1A',
  textSecondary: '#5C534A',
  textMuted: '#8A8178',
  border: '#E4DDD4',
  borderLight: '#EDE8E2',
  accent: '#D4622A',
  accentDark: '#B84E1C',
  accentSoft: '#FBE8DE',
  accentGlow: '#F4C4A8',
  heroFrom: '#FFF5EE',
  heroTo: '#FBE8DE',
  success: '#2D6A4F',
  successSoft: '#E8F5EE',
  error: '#B00020',
  white: '#FFFFFF',
  overlay: 'rgba(26, 26, 26, 0.45)',
  drawerScrim: 'rgba(26, 26, 26, 0.35)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  section: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
} as const;

export const layout = {
  screenPaddingHorizontal: spacing.lg,
  screenPaddingTop: spacing.sm,
  screenPaddingBottom: spacing.lg,
} as const;

export const planTypeAccents: Record<string, string> = {
  date_night: '#C45C8A',
  night_out: '#D4622A',
  vacation: '#3D8B7A',
  road_trip: '#4A6FA5',
};

export const planTypeIcons: Record<string, string> = {
  date_night: 'heart',
  night_out: 'moon',
  vacation: 'plane',
  road_trip: 'car',
};

export const cssVariables = {
  '--color-background': colors.background,
  '--color-surface': colors.surface,
  '--color-surface-muted': colors.surfaceMuted,
  '--color-text': colors.text,
  '--color-text-secondary': colors.textSecondary,
  '--color-text-muted': colors.textMuted,
  '--color-border': colors.border,
  '--color-border-light': colors.borderLight,
  '--color-accent': colors.accent,
  '--color-accent-dark': colors.accentDark,
  '--color-accent-soft': colors.accentSoft,
  '--color-success': colors.success,
  '--color-success-soft': colors.successSoft,
  '--color-error': colors.error,
  '--spacing-xs': `${spacing.xs}px`,
  '--spacing-sm': `${spacing.sm}px`,
  '--spacing-md': `${spacing.md}px`,
  '--spacing-lg': `${spacing.lg}px`,
  '--spacing-xl': `${spacing.xl}px`,
  '--spacing-xxl': `${spacing.xxl}px`,
  '--radius-sm': `${radius.sm}px`,
  '--radius-md': `${radius.md}px`,
  '--radius-lg': `${radius.lg}px`,
  '--radius-pill': `${radius.pill}px`,
} as const;
