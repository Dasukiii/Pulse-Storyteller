import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle, ArrowRight, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  validateFileSize,
  validateFileType,
  parseCSVFile,
  downloadSampleTemplate,
  formatFileSize,
  calculateEnpsScore,
  type ParsedSurveyData,
  type SurveyRow,
} from '../lib/uploadUtils';
import { saveUpload, getUploads, deleteUpload } from '../lib/data';
import type { Upload as UploadType } from '../lib/types';
import { supabase } from '../lib/supabase';

interface UploadPageProps {
  userId: string;
  onUploadComplete?: (uploadId: string) => void;
}

export default function UploadPage({ userId, onUploadComplete }: UploadPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSurveyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState<UploadType[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUploads();
  }, [userId]);

  const loadUploads = async () => {
    try {
      setLoadingUploads(true);
      const data = await getUploads(userId);
      setUploads(data);
    } catch (err) {
      console.error('Failed to load uploads:', err);
    } finally {
      setLoadingUploads(false);
    }
  };

  const handleDelete = async (uploadId: string) => {
    try {
      setDeleting(uploadId);
      await deleteUpload(userId, uploadId);
      await loadUploads();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete upload:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete upload');
    } finally {
      setDeleting(null);
    }
  };

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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setParsedData(null);

    if (!validateFileType(selectedFile)) {
      setError('Invalid file type. Please upload a CSV or Excel file.');
      return;
    }

    if (!validateFileSize(selectedFile)) {
      setError('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const data = await parseCSVFile(selectedFile);
      setParsedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!file || !parsedData) return;

    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const enpsScore = calculateEnpsScore(parsedData.rows);

      const upload = await saveUpload(user.id, {
        file_name: file.name,
        total_responses: parsedData.totalResponses,
        avg_score: enpsScore,
        status: 'uploaded',
        raw_data: parsedData.rows,
      });

      await loadUploads();

      if (onUploadComplete) {
        onUploadComplete(upload.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save upload');
    } finally {
      setSaving(false);
    }
  };

  const handleChooseDifferentFile = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Survey Data</h2>
        <p className="text-gray-600">
          Upload your survey results to generate actions and stories
        </p>
      </div>

      {uploads.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Uploaded Files ({uploads.length})
            </CardTitle>
            <CardDescription>
              Your previously uploaded survey data files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUploads ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading uploads...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{upload.file_name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{upload.total_responses} responses</span>
                          <span>•</span>
                          <span>Score: {upload.avg_score?.toFixed(1) || 'N/A'}</span>
                          <span>•</span>
                          <span>{new Date(upload.upload_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{upload.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {deleteConfirm === upload.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 mr-2">Delete?</span>
                          <button
                            onClick={() => handleDelete(upload.id)}
                            disabled={deleting === upload.id}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {deleting === upload.id ? 'Deleting...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleting === upload.id}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(upload.id)}
                          disabled={deleting !== null}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete upload and related stories"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">File Format</h4>
            <p className="text-sm text-gray-600">
              Upload your survey data in CSV format (.csv)
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Recommended Columns</h4>
            <div className="flex flex-wrap gap-2">
              {['Employee_ID', 'Team', 'Score', 'Comments', 'Date'].map((col) => (
                <span
                  key={col}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                >
                  {col}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Score should be between 0-10. Comments field is optional.
            </p>
          </div>
          <div>
            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Download Sample Template
            </button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!file && (
        <Card>
          <CardContent className="pt-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    dragActive ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 ${
                      dragActive ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    {dragActive
                      ? 'Drop your file here'
                      : 'Drag & drop your file here'}
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse from your computer
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Supported formats: CSV</span>
                  <span>•</span>
                  <span>Max size: 5MB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Parsing file...</p>
              <p className="text-sm text-gray-500 mt-1">
                This may take a few moments
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {file && parsedData && !loading && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  File Loaded Successfully
                </span>
                <button
                  onClick={handleChooseDifferentFile}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Choose Different File
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {parsedData.totalResponses}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">eNPS Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculateEnpsScore(parsedData.rows)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Teams Detected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {parsedData.teamsDetected.length}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Teams: {parsedData.teamsDetected.join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>First 5 rows of your uploaded data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Employee ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Team
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Comments
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedData.rows.slice(0, 5).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">
                          {row.Employee_ID}
                        </td>
                        <td className="px-4 py-3 text-gray-900">{row.Team}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              row.Score >= 9
                                ? 'bg-green-100 text-green-700'
                                : row.Score >= 7
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {row.Score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {row.Comments || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{row.Date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.rows.length > 5 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Showing 5 of {parsedData.totalResponses} rows
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <button
              onClick={handleChooseDifferentFile}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
            >
              Choose Different File
            </button>
            <button
              onClick={handleContinue}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving Upload...
                </>
              ) : (
                <>
                  Continue to Validation
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
