import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { ValidationError } from '../lib/validationUtils';
import { groupErrorsByField } from '../lib/validationUtils';

interface ValidationErrorsProps {
  errors: ValidationError[];
}

export default function ValidationErrors({ errors }: ValidationErrorsProps) {
  const [expanded, setExpanded] = useState(false);

  if (errors.length === 0) return null;

  const errorsByField = groupErrorsByField(errors);
  const totalErrors = errors.length;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-base">Validation Errors Found</span>
          </div>
          <span className="text-sm font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
            {totalErrors} {totalErrors === 1 ? 'error' : 'errors'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {Object.entries(errorsByField).map(([field, count]) => (
            <div
              key={field}
              className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-red-200"
            >
              <div>
                <p className="font-medium text-gray-900">{field}</p>
                <p className="text-sm text-gray-600">
                  {count} {count === 1 ? 'row has' : 'rows have'} invalid values
                </p>
              </div>
              <span className="text-red-600 font-semibold">{count}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-700 hover:text-red-800 py-2"
        >
          {expanded ? (
            <>
              Hide Error Details
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              View Error Details
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {expanded && (
          <div className="bg-white rounded-lg border border-red-200 max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Row
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Field
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Value
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {errors.slice(0, 20).map((error, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">
                      {error.rowIndex >= 0 ? error.rowIndex + 1 : '-'}
                    </td>
                    <td className="px-4 py-2 text-gray-900">{error.field}</td>
                    <td className="px-4 py-2 text-gray-600 font-mono text-xs">
                      {error.value !== null && error.value !== undefined
                        ? error.value.toString()
                        : 'null'}
                    </td>
                    <td className="px-4 py-2 text-red-700">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {errors.length > 20 && (
              <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-600">
                Showing first 20 of {errors.length} errors
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
