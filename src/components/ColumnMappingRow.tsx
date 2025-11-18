import { CheckCircle, XCircle } from 'lucide-react';

interface ColumnMappingRowProps {
  systemField: string;
  label: string;
  required: boolean;
  availableColumns: string[];
  selectedColumn: string | null;
  previewValues: string[];
  isValid: boolean;
  onColumnSelect: (column: string | null) => void;
}

export default function ColumnMappingRow({
  systemField,
  label,
  required,
  availableColumns,
  selectedColumn,
  previewValues,
  isValid,
  onColumnSelect,
}: ColumnMappingRowProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{label}</span>
          {required && (
            <span className="text-xs text-red-600 font-semibold">*</span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <select
          value={selectedColumn || ''}
          onChange={(e) => onColumnSelect(e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select column...</option>
          {availableColumns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          {previewValues.length > 0 ? (
            previewValues.map((value, index) => (
              <span key={index} className="text-sm text-gray-600 truncate">
                {value}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400 italic">
              No preview available
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        {selectedColumn ? (
          isValid ? (
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
          )
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )}
      </td>
    </tr>
  );
}
