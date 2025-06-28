export interface UploadProgress {
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  totalRows: number;
  processedRows: number;
  errors: string[];
}

export interface CSVUploadResult {
  success: boolean;
  fileName: string;
  totalRows: number;
  insertedRows: number;
  errors: string[];
}

export interface SDWISFileMapping {
  fileName: string;
  tableName: string;
  displayName: string;
  description: string;
  requiredColumns: string[];
  uniqueKeyColumn: string;
  transform: (data: any[]) => any[];
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
}