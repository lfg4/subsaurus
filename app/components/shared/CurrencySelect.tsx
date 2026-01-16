'use client';

import { useState, useEffect, useRef } from 'react';
import { getPopularCurrencies, getAllCurrencies, getCurrencySymbol } from '@/app/utils/currency';

interface CurrencySelectProps {
  value: string;
  onChange: (currency: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CurrencySelect({ value, onChange, disabled = false, className = '' }: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 disabled:bg-gray-100 text-left flex items-center justify-between bg-white font-semibold"
      >
        <span>{getCurrencySymbol(value)} {value}</span>
        <span className="text-green-600">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border-2 border-green-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          <div className="px-3 py-2 bg-green-50 font-bold text-sm text-gray-700 sticky top-0 border-b-2 border-green-200">
            Popular Currencies
          </div>
          {getPopularCurrencies().map(code => (
            <button
              key={code}
              type="button"
              onClick={() => {
                onChange(code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 hover:bg-green-50 transition ${
                value === code ? 'bg-green-100 font-bold text-green-900' : ''
              }`}
            >
              {getCurrencySymbol(code)} {code}
            </button>
          ))}
          
          <div className="px-3 py-2 bg-green-50 font-bold text-sm text-gray-700 sticky top-0 border-b-2 border-green-200">
            All Currencies (A-Z)
          </div>
          {getAllCurrencies().map(currency => (
            <button
              key={currency.code}
              type="button"
              onClick={() => {
                onChange(currency.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 hover:bg-green-50 text-sm transition ${
                value === currency.code ? 'bg-green-100 font-bold text-green-900' : ''
              }`}
            >
              {getCurrencySymbol(currency.code)} {currency.code} - {currency.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}