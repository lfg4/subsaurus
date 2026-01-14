import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Transaction } from '../domain/Transaction';

export interface ColumnMapping {
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  currencyColumn?: string;
}

export interface DetectedColumn {
  name: string;
  type: 'date' | 'number' | 'text' | 'unknown';
  sampleValues: string[];
}

export interface ParseResult {
  columns: DetectedColumn[];
  rowCount: number;
  previewRows: Array<Record<string, string | number>>;
}


export class ParseCSVService {
  
  async parseFile(file: File): Promise<ParseResult> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      return this.parseCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      return this.parseExcel(file);
    }

    throw new Error('File format not supported. Use CSV or XLSX');
  }

  private async parseCSV(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Array<Record<string, string>>;
          
          if (data.length === 0) {
            reject(new Error('The CSV file is empty'));
            return;
          }

          const columns = this.detectColumns(data);
          const previewRows = data.slice(0, 5);

          resolve({
            columns,
            rowCount: data.length,
            previewRows,
          });
        },
        error: (error) => {
          reject(new Error(`Error parsing CSV: ${error.message}`));
        },
      });
    });
  }

  private async parseExcel(file: File): Promise<ParseResult> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { 
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false,
        defval: '',
        blankrows: false,
      }) as string[][];

      if (rawData.length < 2) {
        throw new Error('The Excel file needs at least 2 rows (header + data)');
      }

      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        const nonEmptyCount = row.filter(cell => cell && String(cell).trim() !== '').length;
        if (nonEmptyCount >= 2) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = rawData[headerRowIndex];
      const dataRows = rawData.slice(headerRowIndex + 1);

      const data: Array<Record<string, string>> = [];
      
      for (const row of dataRows) {
        const rowObj: Record<string, string> = {};
        let hasData = false;
        
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          const value = row[i] || '';
          
          const columnName = (header && String(header).trim()) 
            ? String(header).trim() 
            : `Column ${i + 1}`;
          
          rowObj[columnName] = String(value).trim();
          
          if (value && String(value).trim() !== '') {
            hasData = true;
          }
        }
        
        if (hasData) {
          data.push(rowObj);
        }
      }

      if (data.length === 0) {
        throw new Error('No valid data rows found after header row.');
      }

      const columns = this.detectColumns(data);
      
      if (columns.length === 0) {
        throw new Error('No valid columns detected.');
      }

      const previewRows = data.slice(0, 5);

      return {
        columns,
        rowCount: data.length,
        previewRows,
      };
    } catch (error) {
      console.error('Error parsing Excel:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to parse Excel file. Please make sure it\'s a valid Excel file with data.');
    }
  }

  private detectColumns(data: Array<Record<string, string | number>>): DetectedColumn[] {
    if (data.length === 0) {
      return [];
    }

    const headers = Object.keys(data[0]);
    const columns: DetectedColumn[] = [];

    for (const header of headers) {
      if (!header || header.trim() === '') {
        continue;
      }

      const sampleValues = data
        .slice(0, Math.min(10, data.length))
        .map(row => String(row[header] || ''))
        .filter(val => val && val.trim().length > 0);
      
      if (sampleValues.length === 0) {
        continue;
      }

      const type = this.detectColumnType(sampleValues);

      columns.push({
        name: header,
        type,
        sampleValues: sampleValues.slice(0, 3),
      });
    }

    return columns;
  }

  private detectColumnType(values: string[]): 'date' | 'number' | 'text' | 'unknown' {
    if (values.length === 0) {
      return 'unknown';
    }

    let dateCount = 0;
    let numberCount = 0;

    for (const value of values) {
      if (this.isDate(value)) {
        dateCount++;
      }

      if (this.isNumber(value)) {
        numberCount++;
      }
    }

    const dateRatio = dateCount / values.length;
    const numberRatio = numberCount / values.length;

    if (dateRatio >= 0.8) {
      return 'date';
    }

    if (numberRatio >= 0.8) {
      return 'number';
    }

    return 'text';
  }

  private isDate(value: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}/,
      /^\d{2}\/\d{2}\/\d{4}/,
      /^\d{2}-\d{2}-\d{4}/,
      /^\d{4}\/\d{2}\/\d{2}/,
    ];

    return datePatterns.some(pattern => pattern.test(value));
  }

  private isNumber(value: string): boolean {
    const normalized = value.trim().replace(/,/g, '.');
    const num = parseFloat(normalized);
    return !Number.isNaN(num) && Number.isFinite(num);
  }

  async parseTransactions(
    file: File,
    mapping: ColumnMapping
  ): Promise<Transaction[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let data: Array<Record<string, string | number>>;

    if (extension === 'csv') {
      data = await this.getCSVData(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      data = await this.getExcelData(file);
    } else {
      throw new Error('Format not supported');
    }

    const transactions: Transaction[] = [];

    for (const row of data) {
      try {
        const dateStr = String(row[mapping.dateColumn] || '').trim();
        const description = String(row[mapping.descriptionColumn] || '').trim();
        const amountStr = String(row[mapping.amountColumn] || '').trim();
        
        if (!dateStr || !description || !amountStr) {
          continue;
        }

        const date = this.parseDate(dateStr);
        const amount = this.parseAmount(amountStr);
        const currency = mapping.currencyColumn 
          ? String(row[mapping.currencyColumn]).trim()
          : 'EUR';

        if (date && !Number.isNaN(amount) && amount !== 0) {
          const transaction = Transaction.create({
            date,
            description,
            amount,
            currency,
            rawRow: row,
          });

          transactions.push(transaction);
        }
      } catch {
      }
    }

    return transactions;
  }

  private async getCSVData(file: File): Promise<Array<Record<string, string>>> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as Array<Record<string, string>>);
        },
        error: reject,
      });
    });
  }

  private async getExcelData(file: File): Promise<Array<Record<string, string>>> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false
    });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false,
      defval: '',
      blankrows: false,
    }) as string[][];

    if (rawData.length < 2) {
      return [];
    }

    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      const nonEmptyCount = row.filter(cell => cell && String(cell).trim() !== '').length;
      if (nonEmptyCount >= 2) {
        headerRowIndex = i;
        break;
      }
    }

    const headers = rawData[headerRowIndex];
    const dataRows = rawData.slice(headerRowIndex + 1);

    const data: Array<Record<string, string>> = [];
    
    for (const row of dataRows) {
      const rowObj: Record<string, string> = {};
      let hasData = false;
      
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const value = row[i] || '';
        
        const columnName = (header && String(header).trim()) 
          ? String(header).trim() 
          : `Column ${i + 1}`;
        
        rowObj[columnName] = String(value).trim();
        
        if (value && String(value).trim() !== '') {
          hasData = true;
        }
      }
      
      if (hasData) {
        data.push(rowObj);
      }
    }

    return data;
  }

  private parseDate(value: string): Date {
    const trimmed = value.trim();

    if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(trimmed.split(' ')[0]);
    }

    if (trimmed.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      const [day, month, year] = trimmed.split('/');
      return new Date(`${year}-${month}-${day}`);
    }

    if (trimmed.match(/^\d{2}-\d{2}-\d{4}/)) {
      const [day, month, year] = trimmed.split('-');
      return new Date(`${year}-${month}-${day}`);
    }

    const date = new Date(trimmed);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }

    throw new Error(`Cannot parse date: ${value}`);
  }

  private parseAmount(value: string): number {
    const normalized = value
      .trim()
      .replace(/[€$£¥]/g, '')
      .replace(/\s/g, '')
      .replace(/,/g, '.');

    return parseFloat(normalized);
  }
}


