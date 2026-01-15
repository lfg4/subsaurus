'use client';

import { useState } from 'react';
import { Calendar, DollarSign, FileText, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface Column {
  name: string;
  type: 'date' | 'number' | 'text' | 'unknown';
  sampleValues: string[];
}

interface ColumnMapperProps {
  columns: Column[];
  previewRows: Array<Record<string, string | number>>;
  onMappingComplete: (mapping: {
    dateColumn: string;
    descriptionColumn: string;
    amountColumn: string;
    currencyColumn?: string;
  }, manualMode?: boolean) => void;
}

export function ColumnMapper({ columns, previewRows, onMappingComplete }: ColumnMapperProps) {
  const [dateColumn, setDateColumn] = useState<string>('');
  const [descriptionColumn, setDescriptionColumn] = useState<string>('');
  const [amountColumn, setAmountColumn] = useState<string>('');
  const [currencyColumn, setCurrencyColumn] = useState<string>('');

  useState(() => {
    const dateCol = columns.find(c => c.type === 'date');
    if (dateCol) setDateColumn(dateCol.name);

    const amountCol = columns.find(c => 
      c.type === 'number' && 
      (c.name.toLowerCase().includes('importe') || 
       c.name.toLowerCase().includes('amount') ||
       c.name.toLowerCase().includes('precio'))
    );
    if (amountCol) setAmountColumn(amountCol.name);

    const descCol = columns.find(c => 
      c.type === 'text' && 
      (c.name.toLowerCase().includes('descripci') || 
       c.name.toLowerCase().includes('description') ||
       c.name.toLowerCase().includes('concepto'))
    );
    if (descCol) setDescriptionColumn(descCol.name);

    const currCol = columns.find(c => 
      c.name.toLowerCase().includes('divisa') || 
      c.name.toLowerCase().includes('currency') ||
      c.name.toLowerCase().includes('moneda')
    );
    if (currCol) setCurrencyColumn(currCol.name);
  });

  const handleSubmit = (manualMode: boolean = false) => {
    if (!dateColumn || !descriptionColumn || !amountColumn) {
      toast.warning('Please select at least Date, Description and Amount columns');
      return;
    }

    onMappingComplete({
      dateColumn,
      descriptionColumn,
      amountColumn,
      currencyColumn: currencyColumn || undefined,
    }, manualMode);
  };

  const isFormValid = dateColumn && descriptionColumn && amountColumn;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🗺️</span>
        <div>
          <h3 className="text-2xl font-black text-gray-900">Column mapping</h3>
          <p className="text-base text-gray-600 font-semibold">
            Tell us which column in your file corresponds to each field
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fecha */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-base font-black text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg border-2 border-blue-300">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span>Date <span className="text-red-600 text-xl">*</span></span>
          </label>
          <select
            value={dateColumn}
            onChange={(e) => setDateColumn(e.target.value)}
            className="w-full px-5 py-4 border-4 border-green-300 rounded-xl focus:ring-4 focus:ring-green-400 focus:border-green-500 font-bold bg-white text-gray-900 text-base shadow-md hover:border-green-400 transition-all cursor-pointer"
          >
            <option value="">📅 Select column...</option>
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} {col.type === 'date' && '✓ (detected)'}
              </option>
            ))}
          </select>
          {dateColumn && (
            <div className="text-sm text-gray-600 font-semibold bg-gray-50 px-3 py-2 rounded-lg border-2 border-gray-200">
              <span className="text-gray-500">Example:</span> {columns.find(c => c.name === dateColumn)?.sampleValues[0]}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 text-base font-black text-gray-900">
            <div className="p-2 bg-purple-100 rounded-lg border-2 border-purple-300">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <span>Description <span className="text-red-600 text-xl">*</span></span>
          </label>
          <select
            value={descriptionColumn}
            onChange={(e) => setDescriptionColumn(e.target.value)}
            className="w-full px-5 py-4 border-4 border-green-300 rounded-xl focus:ring-4 focus:ring-green-400 focus:border-green-500 font-bold bg-white text-gray-900 text-base shadow-md hover:border-green-400 transition-all cursor-pointer"
          >
            <option value="">📝 Select column...</option>
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
          {descriptionColumn && (
            <div className="text-sm text-gray-600 font-semibold bg-gray-50 px-3 py-2 rounded-lg border-2 border-gray-200">
              <span className="text-gray-500">Example:</span> {columns.find(c => c.name === descriptionColumn)?.sampleValues[0]}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 text-base font-black text-gray-900">
            <div className="p-2 bg-green-100 rounded-lg border-2 border-green-300">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span>Amount <span className="text-red-600 text-xl">*</span></span>
          </label>
          <select
            value={amountColumn}
            onChange={(e) => setAmountColumn(e.target.value)}
            className="w-full px-5 py-4 border-4 border-green-300 rounded-xl focus:ring-4 focus:ring-green-400 focus:border-green-500 font-bold bg-white text-gray-900 text-base shadow-md hover:border-green-400 transition-all cursor-pointer"
          >
            <option value="">💰 Select column...</option>
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} {col.type === 'number' && '✓ (number)'}
              </option>
            ))}
          </select>
          {amountColumn && (
            <div className="text-sm text-gray-600 font-semibold bg-gray-50 px-3 py-2 rounded-lg border-2 border-gray-200">
              <span className="text-gray-500">Example:</span> {columns.find(c => c.name === amountColumn)?.sampleValues[0]}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 text-base font-black text-gray-900">
            <div className="p-2 bg-yellow-100 rounded-lg border-2 border-yellow-300">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <span>Currency <span className="text-gray-400 text-sm">(optional)</span></span>
          </label>
          <select
            value={currencyColumn}
            onChange={(e) => setCurrencyColumn(e.target.value)}
            className="w-full px-5 py-4 border-4 border-green-300 rounded-xl focus:ring-4 focus:ring-green-400 focus:border-green-500 font-bold bg-white text-gray-900 text-base shadow-md hover:border-green-400 transition-all cursor-pointer"
          >
            <option value="">💶 EUR by default</option>
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
          {currencyColumn && (
            <div className="text-sm text-gray-600 font-semibold bg-gray-50 px-3 py-2 rounded-lg border-2 border-gray-200">
              <span className="text-gray-500">Example:</span> {columns.find(c => c.name === currencyColumn)?.sampleValues[0]}
            </div>
          )}
        </div>
      </div>

      {previewRows.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
            <span>👀</span> Data preview
          </h4>
          <div className="overflow-x-auto border-4 border-green-400 rounded-2xl shadow-lg">
            <table className="min-w-full divide-y-2 divide-green-200">
              <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.name}
                      className="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase"
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-green-200">
                {previewRows.slice(0, 3).map((row, idx) => (
                  <tr key={`row-${idx}`} className="hover:bg-green-50 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={col.name}
                        className="px-6 py-3 text-sm text-gray-900 font-semibold whitespace-nowrap"
                      >
                        {String(row[col.name] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-4 border-blue-300 rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-900 text-center">
            <span className="text-2xl mr-2">🤔</span>
            Choose how to find your subscriptions: Let the dino detect them automatically or pick them yourself!
          </p>
        </div>

        <div className="flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={!isFormValid}
            className={`
              flex-1 px-6 py-4 rounded-xl font-black text-base transition-all transform shadow-lg border-4
              ${isFormValid
                ? 'bg-white text-gray-900 hover:bg-gray-50 hover:scale-105 border-blue-300 hover:border-blue-400'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
              }
            `}
          >
            <div className="text-3xl mb-2">🎯</div>
            <div>Select manually</div>
            <div className="text-xs font-semibold text-gray-600 mt-1">Choose transactions yourself</div>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={!isFormValid}
            className={`
              flex-1 px-6 py-4 rounded-xl font-black text-base transition-all transform shadow-lg border-4
              ${isFormValid
                ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:from-green-500 hover:to-emerald-500 hover:scale-105 border-green-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
              }
            `}
          >
            <div className="text-3xl mb-2">🤖</div>
            <div>Auto-detect</div>
            <div className="text-xs font-semibold mt-1 opacity-90">Let AI find patterns</div>
          </button>
        </div>
      </div>
    </div>
  );
}

