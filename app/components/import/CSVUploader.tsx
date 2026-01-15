'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface CSVUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function CSVUploader({ onFileSelected, disabled }: CSVUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
      alert('Please select a CSV or Excel file (.xlsx, .xls)');
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`
            relative border-4 border-dashed rounded-2xl p-12
            transition-all duration-200 transform
            ${dragActive 
              ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 scale-105' 
              : 'border-green-300 hover:border-green-400 bg-white hover:shadow-lg'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-102'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={disabled ? undefined : handleClick}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleChange}
            disabled={disabled}
          />

          <div className="flex flex-col items-center justify-center gap-6">
            <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full border-4 border-green-300">
              <Upload className="w-12 h-12 text-green-600" />
            </div>

            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 mb-2">
                📤 Drag your file here
              </p>
              <p className="text-base text-gray-600 font-semibold">
                or click to select from your computer
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-800">
                CSV, XLSX, XLS
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-4 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl border-2 border-green-300">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg">{selectedFile.name}</p>
                <p className="text-sm text-gray-600 font-semibold">
                  {(selectedFile.size / 1024).toFixed(2)} KB • ✅ Ready to process
                </p>
              </div>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-3 hover:bg-green-100 rounded-xl transition-all transform hover:scale-110 border-2 border-transparent hover:border-red-300"
                title="Remove file"
              >
                <X className="w-6 h-6 text-red-600" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

