export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  rate: number;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'VND', symbol: 'đ', name: 'Việt Nam Đồng', locale: 'vi-VN', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', rate: 0.000039 },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', rate: 0.000036 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', rate: 0.0058 },
  { code: 'KRW', symbol: '₩', name: 'Korean Won', locale: 'ko-KR', rate: 0.053 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH', rate: 0.0013 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', rate: 0.00028 },
];

export function formatCurrency(amount: number, currencyCode: string = 'VND'): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const converted = amount * currency.rate;

  if (currencyCode === 'VND') {
    return `${Math.round(converted).toLocaleString('vi-VN')} đ`;
  }

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2,
  }).format(converted);
}

export function convertAmount(amount: number, fromCode: string, toCode: string): number {
  const from = CURRENCIES.find((c) => c.code === fromCode) || CURRENCIES[0];
  const to = CURRENCIES.find((c) => c.code === toCode) || CURRENCIES[0];
  const inVND = amount / from.rate;
  return inVND * to.rate;
}
