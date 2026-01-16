'use client';

import { useState } from 'react';
import { CSVUploader } from './CSVUploader';
import { ColumnMapper } from './ColumnMapper';
import { ImportPreview } from './ImportPreview';
import { ManualSubscriptionSelector } from './ManualSubscriptionSelector';
import { ParseCSVService } from '@/app/lib/import/ParseCSV.service';
import { importApi, type SubscriptionPreview } from '@/app/lib/api';

type Step = 'upload' | 'mapping' | 'manual-select' | 'preview' | 'success' | 'error';

interface Column {
  name: string;
  type: 'date' | 'number' | 'text' | 'unknown';
  sampleValues: string[];
}

interface ImportWizardProps {
  slackWorkspaceId: string;
  createdBySlackUserId: string;
  defaultSlackUserIds?: string[];
  onComplete?: () => void;
}

export function ImportWizard({
  slackWorkspaceId,
  createdBySlackUserId,
  defaultSlackUserIds = [],
  onComplete,
}: ImportWizardProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [previewRows, setPreviewRows] = useState<Array<Record<string, string | number>>>([]);
  const [mapping, setMapping] = useState<{ dateColumn: string; descriptionColumn: string; amountColumn: string; currencyColumn?: string } | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: Array<{ pattern: string; error: string }> } | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<Array<{ date: Date; description: string; amount: number; currency: string }>>([]);

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    setError(null);

    try {
      const parser = new ParseCSVService();
      const result = await parser.parseFile(selectedFile);
      
      setColumns(result.columns);
      setPreviewRows(result.previewRows);
      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingComplete = async (columnMapping: { dateColumn: string; descriptionColumn: string; amountColumn: string; currencyColumn?: string }, manualMode: boolean = false) => {
    if (!file) return;

    setMapping(columnMapping);
    setIsLoading(true);
    setError(null);

    try {
      const parser = new ParseCSVService();
      const transactions = await parser.parseTransactions(file, columnMapping);
      
      setParsedTransactions(transactions);

      if (manualMode) {
        setStep('manual-select');
      } else {
        const { previews } = await importApi.detectSubscriptions(
          transactions.map(tx => ({
            date: tx.date.toISOString(),
            description: tx.description,
            amount: tx.amount,
            currency: tx.currency,
          }))
        );
        
        setSubscriptions(previews);
        setStep('preview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSelection = async (selectedTransactions: Array<{ date: Date; description: string; amount: number; currency: string; _groupKey?: string }>) => {
    setIsLoading(true);
    
    try {
      const groups: Record<string, typeof selectedTransactions> = {};
      
      for (const tx of selectedTransactions) {
        const key = tx._groupKey || tx.description.toLowerCase().trim();
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(tx);
      }
      
      const previews: typeof subscriptions = [];
      
      for (const [_, groupTransactions] of Object.entries(groups)) {
        const sortedTransactions = groupTransactions.sort((a, b) => a.date.getTime() - b.date.getTime());
        const avgAmount = sortedTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / sortedTransactions.length;
        const lastDate = sortedTransactions[sortedTransactions.length - 1].date;
        
        let cycle = 'monthly';
        let nextRenewalDate = new Date(lastDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        if (sortedTransactions.length >= 2) {
          const intervals: number[] = [];
          for (let i = 1; i < sortedTransactions.length; i++) {
            const days = Math.round((sortedTransactions[i].date.getTime() - sortedTransactions[i-1].date.getTime()) / (1000 * 60 * 60 * 24));
            intervals.push(days);
          }
          const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
          
          if (Math.abs(avgInterval - 30) <= 7) {
            cycle = 'Mensual';
            nextRenewalDate = new Date(lastDate);
            nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
          } else if (Math.abs(avgInterval - 90) <= 10) {
            cycle = 'Trimestral';
            nextRenewalDate = new Date(lastDate);
            nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 3);
          } else if (Math.abs(avgInterval - 180) <= 15) {
            cycle = 'Semestral';
            nextRenewalDate = new Date(lastDate);
            nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 6);
          } else if (Math.abs(avgInterval - 365) <= 30) {
            cycle = 'Anual';
            nextRenewalDate = new Date(lastDate);
            nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
          } else {
            cycle = 'Mensual';
          }
        }
        
        previews.push({
          name: sortedTransactions[0].description,
          amount: `${avgAmount.toFixed(2)} ${sortedTransactions[0].currency}`,
          cycle: cycle,
          nextRenewal: nextRenewalDate.toLocaleDateString('es-ES'),
          occurrences: sortedTransactions.length,
          confidence: '100%',
          transactions: sortedTransactions.map(tx => ({
            date: tx.date.toLocaleDateString('es-ES'),
            amount: Math.abs(tx.amount)
          }))
        });
      }
      
      setSubscriptions(previews);
      setStep('preview');
    } catch (err) {
      console.error('Error processing manual selection:', err);
      setError(err instanceof Error ? err.message : 'Error processing selected transactions');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async (selectedNames: string[]) => {
    if (!file || !mapping) return;

    setIsLoading(true);
    setError(null);

    try {
      const parser = new ParseCSVService();
      const transactions = await parser.parseTransactions(file, mapping);
      
      const { previews } = await importApi.detectSubscriptions(
        transactions.map(tx => ({
          date: tx.date.toISOString(),
          description: tx.description,
          amount: tx.amount,
          currency: tx.currency,
        }))
      );
      
      const selectedPreviews = previews.filter(p => selectedNames.includes(p.name));

      const result = await importApi.confirmImport(selectedPreviews, {
        slackWorkspaceId,
        createdBySlackUserId,
        defaultSlackUserIds,
        skipDuplicates: true,
      });

      setImportResult(result);
      setStep('success');

      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'preview') {
      if (parsedTransactions.length > 0) {
        setStep('manual-select');
      } else {
        setStep('mapping');
      }
    } else if (step === 'manual-select') {
      setStep('mapping');
    } else if (step === 'mapping') {
      setStep('upload');
      setFile(null);
      setColumns([]);
      setPreviewRows([]);
      setParsedTransactions([]);
    }
  };

  const handleRetry = () => {
    setStep('upload');
    setFile(null);
    setColumns([]);
    setPreviewRows([]);
    setMapping(null);
    setSubscriptions([]);
    setError(null);
    setImportResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {(['upload', 'mapping', 'preview'] as const).map((s, idx) => {
            const stepLabels = {
              upload: 'Upload file',
              mapping: 'Map columns',
              preview: 'Review & confirm',
            };

            const stepEmojis = {
              upload: '📤',
              mapping: '🗺️',
              preview: '👀',
            };

            const isActive = step === s;
            const isCompleted = 
              (s === 'upload' && ['mapping', 'preview', 'success'].includes(step)) ||
              (s === 'mapping' && ['preview', 'success'].includes(step)) ||
              (s === 'preview' && step === 'success');

            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl
                      border-4 shadow-lg transition-all transform
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-white border-green-500 scale-105' 
                        : isActive 
                          ? 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white border-blue-500 scale-110 animate-pulse' 
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : isActive ? stepEmojis[s] : idx + 1}
                  </div>
                  <div className={`mt-3 text-base font-black transition-all ${isActive ? 'text-blue-600 scale-110' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {stepLabels[s]}
                  </div>
                </div>
                {idx < 2 && (
                  <div className={`h-2 flex-1 mx-4 rounded-full transition-all ${isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-4 border-green-400 p-8">
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-8xl mb-6 animate-bounce">🦖</div>
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4" />
            <p className="text-gray-700 font-black text-xl">The dino is thinking...</p>
          </div>
        )}

        {!isLoading && step === 'upload' && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-5xl">🦖</span>
              <h2 className="text-3xl font-black text-gray-900">Import subscriptions from CSV/Excel</h2>
            </div>
            <CSVUploader onFileSelected={handleFileSelected} />
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-4 border-blue-300 rounded-2xl p-6 shadow-lg">
              <h3 className="font-black text-blue-900 mb-3 text-lg flex items-center gap-2">
                <span>💡</span> Tips for the dino
              </h3>
              <ul className="text-base text-blue-800 space-y-2 font-semibold">
                <li className="flex items-start gap-2">
                  <span>📄</span>
                  <span>Upload the complete statement from your card or bank account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📅</span>
                  <span>More months of history = better detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📊</span>
                  <span>We support CSV and Excel formats (XLSX, XLS)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🤖</span>
                  <span>The system automatically detects recurring expenses</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {!isLoading && step === 'mapping' && (
          <ColumnMapper
            columns={columns}
            previewRows={previewRows}
            onMappingComplete={handleMappingComplete}
          />
        )}

        {!isLoading && step === 'manual-select' && (
          <ManualSubscriptionSelector
            transactions={parsedTransactions}
            onConfirm={handleManualSelection}
            onBack={() => setStep('mapping')}
          />
        )}

        {!isLoading && step === 'preview' && (
          <ImportPreview
            subscriptions={subscriptions}
            onConfirm={handleConfirmImport}
            onBack={handleBack}
          />
        )}

        {step === 'success' && importResult && (
          <div className="text-center py-12">
            <div className="text-8xl mb-6 animate-bounce">🦖🎉</div>
            <h3 className="text-4xl font-black text-gray-900 mb-3">
              The dino is full!
            </h3>
            <div className="text-gray-700 space-y-2 font-bold text-lg">
              <p className="text-green-600">✅ {importResult.imported} subscriptions imported</p>
              {importResult.skipped > 0 && (
                <p className="text-orange-600">⚠️ {importResult.skipped} skipped (duplicates)</p>
              )}
              {importResult.errors.length > 0 && (
                <p className="text-red-600">❌ {importResult.errors.length} with errors</p>
              )}
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-8 bg-red-50 border-4 border-red-300 rounded-2xl p-6 max-w-md mx-auto shadow-lg">
                <h4 className="font-black text-red-900 mb-3 text-lg">⚠️ Errors:</h4>
                <div className="text-sm text-red-800 space-y-2 text-left font-semibold">
                  {importResult.errors.map((err, idx) => (
                    <div key={`error-${err.pattern}-${idx}`}>
                      • <strong>{err.pattern}</strong>: {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">🦖💥</div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">
              The dino choked!
            </h3>
            <p className="text-red-600 font-bold text-lg mb-8 max-w-md mx-auto">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-8 py-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all transform hover:scale-105 font-black text-lg shadow-lg border-2 border-blue-300"
            >
              🔄 Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

