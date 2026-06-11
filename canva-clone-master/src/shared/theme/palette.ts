// Helper function to convert hex to rgb values
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
    : null;
};

// Helper function to create rgba from hex
export const rgba = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb}, ${alpha})` : hex;
};

// Main colors
const primary = '#735DFF';
const secondary = '#FF5A29';
const error = '#FF383C';
const warning = '#FF9A13';
const info = '#0C9CFC';
const success = '#0CC763';
const dark = '#0A0A0A';

export const palette = {
  mode: 'light',
  header: {
    main: '#61748f',
  },
  primary: {
    main: primary,
    light: rgba(primary, 0.3),
    dark: rgba(primary, 0.8),
    contrastText: '#fff',
  },
  secondary: {
    main: secondary,
    light: rgba(secondary, 0.3),
    dark: rgba(secondary, 0.8),
    contrastText: '#fff',
  },
  error: {
    main: error,
    light: rgba(error, 0.3),
    dark: rgba(error, 0.8),
    contrastText: '#fff',
  },
  warning: {
    main: warning,
    light: rgba(warning, 0.3),
    dark: rgba(warning, 0.8),
    contrastText: '#fff',
  },
  info: {
    main: info,
    light: rgba(info, 0.3),
    dark: rgba(info, 0.8),
    contrastText: '#fff',
  },
  success: {
    main: success,
    light: rgba(success, 0.3),
    dark: rgba(success, 0.8),
    contrastText: '#fff',
  },
  grey: {
    50: '#f9fafb',
    100: '#f2f4f5',
    200: '#e6eaeb',
    300: '#dbdfe1',
    400: '#949eb7',
    500: '#7987a1',
    600: '#4d5875',
    700: '#383853',
    800: '#323251',
    900: '#110f0f',
    A100: '#8699A3',
    A200: rgba('#8699A3', 0.2),
    A400: rgba('#8699A3', 0.4),
    A700: rgba('#8699A3', 0.7),
  },
  text: {
    primary: '#222f36',
    secondary: '#98a5c3',
    disabled: rgba(dark, 0.38),
  },
  divider: '#e6eff1',
  background: {
    default: '#f5f6fa',
    paper: '#ffffff',
  },
  action: {
    active: rgba(dark, 0.54),
    hover: rgba(dark, 0.04),
    hoverOpacity: 0.04,
    selected: rgba(dark, 0.08),
    selectedOpacity: 0.08,
    disabled: rgba(dark, 0.26),
    disabledBackground: rgba(dark, 0.12),
    disabledOpacity: 0.38,
    focus: rgba(dark, 0.12),
    focusOpacity: 0.12,
    activatedOpacity: 0.12,
  },
} as const;

// Additional custom colors that can be used with sx prop or styled components
export const extendedColors = {
  blue: '#0082FF',
  indigo: '#4d5ddb',
  yellow: '#fff621',
  teal: '#00D8D8',
  orange: '#FE7C58',
  purple: '#7B76FE',
  pink: '#FE549B',
  cyan: '#00D1D1',
};

// Gradient backgrounds
export const gradients = {
  primary: `linear-gradient(to bottom right, ${primary} 0%, ${secondary} 100%)`,
  secondary: `linear-gradient(to bottom right, ${secondary} 0%, #970312 100%)`,
  warning: `linear-gradient(to bottom right, ${warning} 0%, #4b5002 100%)`,
  info: `linear-gradient(to bottom right, ${info} 0%, #00428d 100%)`,
  success: `linear-gradient(to bottom right, ${success} 0%, #035643 100%)`,
  danger: `linear-gradient(to bottom right, ${error} 0%, #DE4980 100%)`,
  orange: 'linear-gradient(to bottom right, #FE7C58 0%, #c3072d 100%)',
  purple: 'linear-gradient(to bottom right, #7B76FE 0%, #0046d1 100%)',
  teal: 'linear-gradient(to bottom right, #00D8D8 0%, #086a5a 100%)',
  light: 'linear-gradient(to bottom right, #F7F8FA 0%, #D7FCFF 100%)',
  dark: 'linear-gradient(to bottom right, #0A0A0A 0%, #16657A 100%)',
};

// Dark mode palette override
export const darkPalette = {
  ...palette,
  background: {
    default: '#191814',
    paper: '#232226',
  },
  text: {
    primary: rgba('#ffffff', 0.8),
    secondary: rgba('#ffffff', 0.5),
    disabled: rgba('#ffffff', 0.38),
  },
  action: {
    active: rgba('#ffffff', 0.54),
    hover: rgba('#ffffff', 0.04),
    selected: rgba('#ffffff', 0.08),
    disabled: rgba('#ffffff', 0.26),
    disabledBackground: rgba('#ffffff', 0.12),
  },
} as const;
