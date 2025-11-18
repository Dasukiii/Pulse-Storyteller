import { Upload, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  onUploadClick: () => void;
}

export default function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Upload className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Upload Your First Survey
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Get started by uploading your eNPS survey data. Our AI will analyze the results
          and generate insights, stories, and actionable recommendations for your teams.
        </p>
        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Upload className="w-5 h-5" />
          Upload Survey Data
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Supported formats:</p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="px-3 py-1 bg-gray-50 rounded-full">CSV</span>
            <span className="px-3 py-1 bg-gray-50 rounded-full">Excel</span>
            <span className="px-3 py-1 bg-gray-50 rounded-full">JSON</span>
          </div>
        </div>
      </div>
    </div>
  );
}
