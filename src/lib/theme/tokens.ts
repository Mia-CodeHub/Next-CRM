import { ThemeConfig, theme } from 'antd';

const NEON_GREEN = '#39FF14';

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: NEON_GREEN,
    colorBgContainer: '#1a1a2e',
    colorBgLayout: '#0f0f1a',
    colorBgElevated: '#1e1e32',
    colorBorder: '#2a2a3e',
    colorText: '#e0e0e0',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  components: {
    Menu: { darkItemSelectedBg: 'rgba(57,255,20,0.1)', darkItemSelectedColor: NEON_GREEN },
    Table: { headerBg: '#1e1e32', rowHoverBg: 'rgba(57,255,20,0.04)' },
    Card: { colorBorderSecondary: '#2a2a3e' },
    Button: { primaryShadow: '0 0 8px rgba(57,255,20,0.3)' },
  },
};

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#16a34a',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
};
