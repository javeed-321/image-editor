'use client';

import { alpha, createTheme } from '@mui/material/styles';
import { palette, rgba } from './palette';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar: {
      background: string;
      textColor: string;
      activeBackground: string;
      hoverBackground: string;
    };
  }
  interface PaletteOptions {
    sidebar: {
      background: string;
      textColor: string;
      activeBackground: string;
      hoverBackground: string;
    };
  }
}

const themeOptions = {
  palette: {
    primary: {
      main: 'rgb(115, 93, 255)', // --primary-rgb
      light: alpha('rgb(115, 93, 255)', 0.1),
    },
    secondary: {
      main: 'rgb(255, 90, 41)', // --secondary-rgb
    },
    text: {
      primary: '#222f36', // --default-text-color
      secondary: '#657a99', // --menu-prime-color
    },
    background: {
      default: 'rgb(245, 246, 250)', // --body-bg-rgb
      paper: '#ffffff', // --menu-bg
    },
    divider: '#e6eff1', // --menu-border-color
    sidebar: {
      background: '#ffffff',
      textColor: '#657a99',
      activeBackground: alpha('rgb(115, 93, 255)', 0.1),
      hoverBackground: alpha('rgb(115, 93, 255)', 0.05),
    },
  },
  typography: {
    fontFamily: 'inherit',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem', // 40px
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem', // 32px
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.85rem', // 14px
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '0.85rem', // 14px
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.57,
    },
    button: {
      fontSize: '0.875rem',
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      lineHeight: 2.5,
      textTransform: 'uppercase',
    },
  },
  shadows: [
    'none',
    '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)', // shadow-sm
    '0 0.5rem 1rem rgba(0, 0, 0, 0.15)', // shadow
    '0 1rem 3rem rgba(0, 0, 0, 0.175)', // shadow-lg
    '0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)',
    '0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)',
    '0 0.75rem 2rem rgba(0, 0, 0, 0.1)',
    '0 1rem 2.5rem rgba(0, 0, 0, 0.1)',
    '0 1.25rem 3rem rgba(0, 0, 0, 0.1)',
    '0 1.5rem 3.5rem rgba(0, 0, 0, 0.1)',
    '0 1.75rem 4rem rgba(0, 0, 0, 0.1)',
    '0 2rem 4.5rem rgba(0, 0, 0, 0.1)',
    '0 2.25rem 5rem rgba(0, 0, 0, 0.1)',
    '0 2.5rem 5.5rem rgba(0, 0, 0, 0.1)',
    '0 2.75rem 6rem rgba(0, 0, 0, 0.1)',
    '0 3rem 6.5rem rgba(0, 0, 0, 0.1)',
    '0 3.25rem 7rem rgba(0, 0, 0, 0.1)',
    '0 3.5rem 7.5rem rgba(0, 0, 0, 0.1)',
    '0 3.75rem 8rem rgba(0, 0, 0, 0.1)',
    '0 4rem 8.5rem rgba(0, 0, 0, 0.1)',
    '0 4.25rem 9rem rgba(0, 0, 0, 0.1)',
    '0 4.5rem 9.5rem rgba(0, 0, 0, 0.1)',
    '0 4.75rem 10rem rgba(0, 0, 0, 0.1)',
    '0 5rem 10.5rem rgba(0, 0, 0, 0.1)',
    '0 5.25rem 11rem rgba(0, 0, 0, 0.1)',
  ],
  shape: {
    borderRadius: 4,
  },
  spacing: 8, // Base spacing unit in pixels
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background?.default ?? '#f9fafb',
          color: palette.text?.primary ?? '#222f36',
          fontFamily: '"Quicksand", sans-serif',
          fontWeight: 500,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // Base styles
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '6px',
          padding: '6px 12px',
          minWidth: 'auto',
          fontSize: '0.85rem',
          lineHeight: 1.5,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: '1px',
        },
        sizeLarge: {
          padding: '10px 16px',
        },
        sizeSmall: {
          padding: '4px 8px',
        },
      },
      defaultProps: {
        variant: 'contained',
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.3rem',
          border: '1px solid #f3f2f9',
          boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '1rem',
          borderBottom: '1px solid #f3f2f9',
        },
        title: {
          fontSize: 17,
          fontWeight: 600,
        },
        action: {
          marginRight: 0,
          marginTop: 0,
          marginBottom: 0,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '1rem',
          '&:last-child': {
            paddingBottom: '1rem',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontSize: 13,
          padding: 0,
        },
        input: {
          padding: '9px 12px',
        },
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          padding: 0,
          borderRadius: '4px',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e6f1',
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e6f1',
            borderWidth: '1px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: rgba(palette.primary.main, 0.1),
            boxShadow: `0 0 4px ${rgba(palette.primary.main, 0.1)}`,
          },
        },
        input: {
          padding: '9px 12px',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 4,
          paddingLeft: 9,
          '& .MuiSvgIcon-root': {
            fill: '#e2e6f1',
          },
          '&.Mui-checked': {
            '& .MuiSvgIcon-root': {
              fill: palette.primary.main,
            },
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          display: 'inline-block',
          color: '#222f36',
          fontSize: 13,
          fontWeight: 500,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          marginRight: 0,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: '0.25rem',
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            background: palette.primary.main,
            color: '#ffffff',
          },
          '&.Mui-selected': {
            background: palette.primary.main,
            color: '#ffffff',
          },
        },
        icon: {
          fontSize: 12,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0.3rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.3rem',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {},
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgb(243, 242, 249)',
          padding: '12px 16px',
          fontWeight: 500,
          fontSize: 13.6,
        },
        head: {
          fontSize: 14,
          fontWeight: 600,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          color: palette.header.main,
        },
      },
    },
  },
  zIndex: {
    appBar: 1200,
    drawer: 1100,
  },
} as const;

// @ts-ignore
export const theme = createTheme(themeOptions);

// Dark theme options
export const darkThemeOptions = {
  ...themeOptions,
  components: {
    ...themeOptions.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#191814',
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#232226',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        head: {
          fontSize: 14,
          fontWeight: 600,
        },
      },
    },
  },
} as const;

// @ts-ignore
export const darkTheme = createTheme(darkThemeOptions);
