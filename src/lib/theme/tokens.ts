import { ThemeConfig, theme } from 'antd';

const EMERALD = '#10B981';
const EMERALD_DARK = '#059669';
const MINT = '#34D399';

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: EMERALD,
    colorBgContainer: 'rgba(255,255,255,0.05)',
    colorBgLayout: 'transparent',
    colorBgElevated: 'rgba(255,255,255,0.08)',
    colorBorder: 'rgba(255,255,255,0.08)',
    colorBorderSecondary: 'rgba(255,255,255,0.06)',
    colorText: 'rgba(255,255,255,0.85)',
    colorTextSecondary: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  components: {
    Card: {
      colorBgContainer: 'rgba(255,255,255,0.05)',
    },
    Menu: {
      darkItemSelectedBg: 'rgba(16,185,129,0.12)',
      darkItemSelectedColor: MINT,
      darkItemHoverBg: 'rgba(255,255,255,0.04)',
    },
    Table: {
      headerBg: 'rgba(255,255,255,0.04)',
      rowHoverBg: 'rgba(16,185,129,0.06)',
    },
    Button: {
      primaryShadow: '0 0 12px rgba(16,185,129,0.25)',
    },
    Input: {
      colorBgContainer: 'rgba(255,255,255,0.04)',
    },
    Select: {
      colorBgContainer: 'rgba(255,255,255,0.04)',
    },
    Layout: {
      siderBg: 'transparent',
      headerBg: 'transparent',
      bodyBg: 'transparent',
    },
  },
};

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: EMERALD_DARK,
    colorBgContainer: 'rgba(255,255,255,0.7)',
    colorBgLayout: 'transparent',
    colorBgElevated: 'rgba(255,255,255,0.85)',
    colorBorder: 'rgba(0,0,0,0.06)',
    colorBorderSecondary: 'rgba(0,0,0,0.04)',
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    borderRadius: 12,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  components: {
    Card: {
      colorBgContainer: 'rgba(255,255,255,0.7)',
    },
    Menu: {
      itemSelectedBg: 'rgba(5,150,105,0.08)',
      itemSelectedColor: EMERALD_DARK,
      itemHoverBg: 'rgba(0,0,0,0.03)',
    },
    Table: {
      headerBg: 'rgba(255,255,255,0.5)',
      rowHoverBg: 'rgba(5,150,105,0.04)',
    },
    Button: {
      primaryShadow: '0 0 12px rgba(5,150,105,0.2)',
    },
    Layout: {
      siderBg: 'transparent',
      headerBg: 'transparent',
      bodyBg: 'transparent',
    },
  },
};
