import { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, Info, Users, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import ColumnMappingRow from './ColumnMappingRow';
import ValidationErrors from './ValidationErrors';
import { supabase } from '../lib/supabase';
import {
  getSystemFields,
  detectColumnMapping,
  validateMappedData,
  applyColumnMapping,
  getPreviewValues,
  calculateStatistics,
  calculateDataQuality,
  type ValidationResult,
  type DataStatistics,
  type DataQuality,
} from '../lib/validationUtils';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DataValidationPageProps {
  uploadId: string;
  onValidationComplete?: (uploadId: string, rawData: any[]) => void;
}

export default function DataValidationPage({
  uploadId,
  onValidationComplete,
}: DataValidationPageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string | null>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [statistics, setStatistics] = useState<DataStatistics | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);

  const systemFields = getSystemFields();

  useEffect(() => {
    loadUploadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadId]);

  useEffect(() => {
    if (rawData.length > 0) {
      performValidation();
      calculateStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnMapping, rawData]);

  const loadUploadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: upload, error: fetchError } = await supabase
        .from('uploads')
        .select('*')
        .eq('id', uploadId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!upload) {
        throw new Error('Upload not found');
      }

      setUploadFileName(upload.file_name);
      const data = upload.raw_data;

      if (!data || data.length === 0) {
        throw new Error('No data found in upload');
      }

      setRawData(data);

      const columns = Object.keys(data[0]);
      setAvailableColumns(columns);

      const detectedMapping = detectColumnMapping(columns);
      setColumnMapping(detectedMapping);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load upload data');
    } finally {
      setLoading(false);
    }
  };

  const performValidation = () => {
    const result = validateMappedData(rawData, columnMapping);
    setValidationResult(result);
  };

  const calculateStats = () => {
    const stats = calculateStatistics(rawData, columnMapping);
    setStatistics(stats);

    const quality = calculateDataQuality(rawData, columnMapping, validationResult?.errors || []);
    setDataQuality(quality);
  };

  const handleColumnSelect = (systemField: string, userColumn: string | null) => {
    setColumnMapping((prev) => ({
      ...prev,
      [systemField]: userColumn,
    }));
  };

  const handleProceed = async () => {
    if (!validationResult?.isValid) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const mappedData = applyColumnMapping(rawData, columnMapping);

      const { error: updateError } = await supabase
        .from('uploads')
        .update({
          status: 'validated',
          raw_data: mappedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', uploadId);

      if (updateError) throw updateError;

      if (onValidationComplete) {
        onValidationComplete(uploadId, rawData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update upload');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
                body { font-family: 'Figtree', sans-serif; }
            `}</style>
            <div className="max-w-7xl mx-auto font-figtree">
                <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading upload data...</p>
                </div>
                </div>
            </div>
        </>
    );
  }

  if (error) {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
                body { font-family: 'Figtree', sans-serif; }
            `}</style>
            <div className="max-w-7xl mx-auto font-figtree">
                <Card className="border-red-200 bg-red-50 rounded-xl shadow-md">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-900">Error Loading Data</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                    </div>
                </CardContent>
                </Card>
            </div>
        </>
    );
  }

  const allRequiredMapped = systemFields
    .filter((f) => f.required)
    .every((f) => columnMapping[f.key]);

  return (
    <>
      {/* Google Font Import and Body Style */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Figtree', sans-serif;
        }
      `}</style>
      <div className="max-w-7xl mx-auto font-figtree">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Validate & Map Your Data
          </h2>
          <p className="text-gray-600">
            Map your CSV columns to our system fields and validate the data quality
          </p>
        </div>

        <Card className="mb-6 rounded-xl shadow-md border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Instructions
            </CardTitle>
            <CardDescription>
              Select the matching column from your file for each system field
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">File:</span> {uploadFileName}
              </p>
              <p className="text-sm text-blue-900 mt-1">
                <span className="font-semibold">Rows:</span> {rawData.length}
              </p>
            </div>
          </CardContent>
        </Card>

        {validationResult?.warnings && validationResult.warnings.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 rounded-xl shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 mb-2">Warnings</p>
                  <ul className="space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-800">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {validationResult && !validationResult.isValid && (
          <div className="mb-6">
            <ValidationErrors errors={validationResult.errors} />
          </div>
        )}

        {/* Column Mapping Card */}
        <Card className="mb-6 rounded-xl shadow-md border-gray-200">
          <CardHeader>
            <CardTitle>Column Mapping</CardTitle>
            <CardDescription>
              Fields marked with * are required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      System Field
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Your Column
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Preview (First 3 Values)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {systemFields.map((field) => {
                    const selectedColumn = columnMapping[field.key];
                    const previewValues = getPreviewValues(rawData, selectedColumn);
                    const fieldErrors = validationResult?.errors.filter(
                      (e) => e.field === field.key
                    ) || [];
                    const isValid = selectedColumn ? fieldErrors.length === 0 : false;

                    return (
                      <ColumnMappingRow
                        key={field.key}
                        systemField={field.key}
                        label={field.label}
                        required={field.required}
                        availableColumns={availableColumns}
                        selectedColumn={selectedColumn}
                        previewValues={previewValues}
                        isValid={isValid}
                        onColumnSelect={(col) => handleColumnSelect(field.key, col)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {allRequiredMapped && validationResult?.isValid && (
            <Card className="mb-6 border-green-200 bg-green-50 rounded-xl shadow-md">
            <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                    <p className="font-semibold text-green-900">
                    Data validation successful!
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                    All {rawData.length} rows passed validation. Ready to proceed to
                    analysis.
                    </p>
                </div>
                </div>
            </CardContent>
            </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataQuality && (
            <Card className={`rounded-xl shadow-md ${
              dataQuality.rating === 'Excellent' || dataQuality.rating === 'Good'
                ? 'border-green-200 bg-green-50'
                : dataQuality.rating === 'Fair'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Data Quality</span>
                  <span className={`text-lg font-bold ${
                    dataQuality.rating === 'Excellent' || dataQuality.rating === 'Good'
                      ? 'text-green-700'
                      : dataQuality.rating === 'Fair'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    {dataQuality.rating}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Overall Score</span>
                    <span className="font-semibold">{dataQuality.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        dataQuality.score >= 80
                          ? 'bg-green-600'
                          : dataQuality.score >= 60
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${dataQuality.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-xs space-y-1 pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completeness</span>
                    <span className="font-medium">{dataQuality.completeness}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Scores</span>
                    <span className="font-medium">{dataQuality.validScores}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Consistency</span>
                    <span className="font-medium">{dataQuality.dateConsistency}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Tips:</p>
                  <ul className="space-y-1">
                    {dataQuality.tips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-600">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {statistics && statistics.totalResponses > 0 && (
            <>
              <div className="space-y-6">
                <Card className="rounded-xl shadow-md border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      eNPS Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        {statistics.enpsScore}
                      </div>
                      <p className="text-xs text-gray-500">eNPS Score</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Promoters (9-10)</span>
                        <span className="font-semibold text-green-600">
                          {statistics.promotersPercent}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Passives (7-8)</span>
                        <span className="font-semibold text-yellow-600">
                          {statistics.passivesPercent}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Detractors (0-6)</span>
                        <span className="font-semibold text-red-600">
                          {statistics.detractorsPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500 italic">
                        eNPS = Promoters% - Detractors%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        = {statistics.promotersPercent}% - {statistics.detractorsPercent}% = {statistics.enpsScore}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {statistics.dateRange.earliest && statistics.dateRange.latest && (
                  <Card className="rounded-xl shadow-md border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Date Range
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Earliest</span>
                        <span className="font-medium">{statistics.dateRange.earliest}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Latest</span>
                        <span className="font-medium">{statistics.dateRange.latest}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <Card className="rounded-xl shadow-md border-gray-200 lg:col-span-1 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Teams Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statistics.teamStats.length > 0 ? (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statistics.teamStats}
                          margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis
                            dataKey="team"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => (value.length > 10 ? `${value.slice(0, 10)}...` : value)}
                          />
                           <Tooltip
                            cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} // blue-50 opacity
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 shadow-lg rounded-xl border border-gray-200">
                                    <p className="font-semibold text-gray-900 mb-1">{label}</p>
                                    <p className="text-sm text-blue-600">
                                      Responses: {data.count}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Avg. Score: {data.avgScore}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" radius={8}>
                            <LabelList
                              position="top"
                              offset={8}
                              className="fill-gray-700"
                              fontSize={12}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-10">
                      No teams mapped yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>


        <div className="flex items-center justify-end gap-4 mt-6">
          <div className="flex-1">
            {!allRequiredMapped && (
              <p className="text-sm text-gray-600">
                Please map all required fields to continue
              </p>
            )}
          </div>
          <button
            onClick={handleProceed}
            disabled={!validationResult?.isValid || !allRequiredMapped || saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validating...
              </>
            ) : (
              <>
                Proceed to Analysis
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}