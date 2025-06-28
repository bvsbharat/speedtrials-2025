import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Download, Database } from 'lucide-react';
import { CSVUploadService } from '../services/csvUploadService';
import { UploadProgress, CSVUploadResult } from '../types/upload';

export const DataUpload: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<CSVUploadResult[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isUploading) return;

    setIsUploading(true);
    setResults([]);
    
    // Initialize progress tracking
    const initialProgress: UploadProgress[] = acceptedFiles.map(file => ({
      fileName: file.name,
      status: 'pending',
      progress: 0,
      totalRows: 0,
      processedRows: 0,
      errors: []
    }));
    
    setUploadProgress(initialProgress);

    // Process files sequentially to avoid overwhelming the database
    const uploadResults: CSVUploadResult[] = [];

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      // Update status to processing
      setUploadProgress(prev => prev.map(p => 
        p.fileName === file.name 
          ? { ...p, status: 'processing' }
          : p
      ));

      try {
        const result = await CSVUploadService.uploadCSVData(
          file,
          (progress, processedRows, totalRows) => {
            setUploadProgress(prev => prev.map(p => 
              p.fileName === file.name 
                ? { ...p, progress, processedRows, totalRows }
                : p
            ));
          }
        );

        uploadResults.push(result);

        // Update final status
        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name 
            ? { 
                ...p, 
                status: result.success ? 'completed' : 'error',
                progress: 100,
                errors: result.errors
              }
            : p
        ));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        uploadResults.push({
          success: false,
          fileName: file.name,
          totalRows: 0,
          insertedRows: 0,
          errors: [errorMessage]
        });

        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name 
            ? { ...p, status: 'error', errors: [errorMessage] }
            : p
        ));
      }
    }

    setResults(uploadResults);
    setIsUploading(false);
  }, [isUploading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: true,
    disabled: isUploading
  });

  const clearTable = async (tableName: string) => {
    if (!confirm(`Are you sure you want to clear all data from ${tableName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await CSVUploadService.clearTable(tableName);
      alert(`Successfully cleared ${tableName} table`);
    } catch (error) {
      alert(`Failed to clear table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const downloadTemplate = () => {
    const templateData = CSVUploadService.FILE_MAPPINGS.map(mapping => ({
      'File Name': mapping.fileName,
      'Table Name': mapping.tableName,
      'Display Name': mapping.displayName,
      'Description': mapping.description,
      'Required Columns': mapping.requiredColumns.join(', ')
    }));

    const csv = [
      Object.keys(templateData[0]).join(','),
      ...templateData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sdwis_file_mapping.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">SDWIS Data Upload</h2>
            <p className="text-gray-600">Upload CSV files from the SDWIS export to populate the database</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>File Mapping Guide</span>
            </button>
          </div>
        </div>

        {/* File Mappings Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {CSVUploadService.FILE_MAPPINGS.map((mapping) => (
            <div key={mapping.fileName} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{mapping.displayName}</h3>
                <button
                  onClick={() => clearTable(mapping.tableName)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title={`Clear ${mapping.tableName} table`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{mapping.description}</p>
              <p className="text-xs text-gray-500">
                <strong>File:</strong> {mapping.fileName}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Table:</strong> {mapping.tableName}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-lg text-blue-600">Drop the CSV files here...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 mb-2">
                Drag & drop CSV files here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supports multiple files. Accepted formats: .csv
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h3>
          <div className="space-y-4">
            {uploadProgress.map((progress) => (
              <div key={progress.fileName} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{progress.fileName}</span>
                    {progress.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {progress.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {progress.processedRows} / {progress.totalRows} rows
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.status === 'completed'
                        ? 'bg-green-500'
                        : progress.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className={`capitalize ${
                    progress.status === 'completed'
                      ? 'text-green-600'
                      : progress.status === 'error'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}>
                    {progress.status}
                  </span>
                  <span className="text-gray-500">{Math.round(progress.progress)}%</span>
                </div>

                {progress.errors.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {progress.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Results Summary */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-green-900">
                    {results.filter(r => r.success).length}
                  </p>
                  <p className="text-sm text-green-600">Successful Uploads</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-red-900">
                    {results.filter(r => !r.success).length}
                  </p>
                  <p className="text-sm text-red-600">Failed Uploads</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-blue-900">
                    {results.reduce((sum, r) => sum + r.insertedRows, 0)}
                  </p>
                  <p className="text-sm text-blue-600">Total Rows Inserted</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.fileName}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.fileName}</span>
                  <span className="text-sm">
                    {result.insertedRows} / {result.totalRows} rows inserted
                  </span>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-sm text-red-700">
                    <strong>Errors:</strong>
                    <ul className="mt-1 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};