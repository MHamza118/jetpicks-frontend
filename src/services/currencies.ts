import currencyCodes from 'currency-codes';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Cache for currencies by country
const currencyCache: Map<string, Currency | null> = new Map();

/**
 * Get currency for a specific country
 */
export const getCurrencyByCountry = (countryName: string): Currency | null => {
  if (currencyCache.has(countryName)) {
    return currencyCache.get(countryName) || null;
  }

  try {
    // Try to find currency by country name
    const currency = (currencyCodes as any).country(countryName);
    
    if (currency && currency.length > 0) {
      const curr = currency[0];
      const result: Currency = {
        code: curr.code,
        name: curr.name || curr.code,
        symbol: getSymbolForCurrency(curr.code),
      };
      currencyCache.set(countryName, result);
      return result;
    }
  } catch (error) {
    console.warn(`Could not find currency for country: ${countryName}`);
  }

  currencyCache.set(countryName, null);
  return null;
};

/**
 * Get all available currencies
 */
export const getAllCurrencies = (): Currency[] => {
  try {
    const allCurrencies = (currencyCodes as any).data;
    return allCurrencies.map((curr: any) => ({
      code: curr.code,
      name: curr.name || curr.code,
      symbol: getSymbolForCurrency(curr.code),
    }));
  } catch (error) {
    console.error('Failed to get currencies:', error);
    return [];
  }
};

/**
 * Get currency symbol for a currency code
 */
export const getSymbolForCurrency = (code: string): string => {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF',
    CAD: 'C$',
    AUD: 'A$',
    NZD: 'NZ$',
    CNY: '¥',
    INR: '₹',
    MXN: '$',
    SGD: 'S$',
    HKD: 'HK$',
    NOK: 'kr',
    SEK: 'kr',
    DKK: 'kr',
    ZAR: 'R',
    BRL: 'R$',
    RUB: '₽',
    KRW: '₩',
    TRY: '₺',
    AED: 'د.إ',
    SAR: '﷼',
    QAR: '﷼',
    PKR: '₨',
    THB: '฿',
    MYR: 'RM',
    PHP: '₱',
    IDR: 'Rp',
    VND: '₫',
    BDT: '৳',
    LKR: 'Rs',
    NGN: '₦',
    KES: 'KSh',
    EGP: '£',
    ILS: '₪',
    AMD: '֏',
  };

  return symbols[code] || code;
};

/**
 * Format price with currency
 */
export const formatPriceWithCurrency = (price: number, currencyCode: string): string => {
  const symbol = getSymbolForCurrency(currencyCode);
  return `${symbol}${price.toFixed(2)}`;
};
