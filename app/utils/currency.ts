import currencyCodes from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map';

export const getAllCurrencies = () => {
  const allCodes = currencyCodes.data;
  
  return allCodes
    .filter(c => c && c.code)
    .map(c => ({
      code: c.code,
      name: c.currency,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
};

export const getPopularCurrencies = () => {
  return [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 
    'AUD', 'CHF', 'CNY', 'INR', 'MXN'
  ];
};

export const getCurrencySymbol = (code: string): string => {
  return getSymbolFromCurrency(code) || code;
};

export const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
  }
};