import { useState, useEffect } from 'react';
import { X, Download, TrendingUp, TrendingDown, FileText, Calendar, Target, Clock, Zap } from 'lucide-react';
import type { Story, Upload, Action } from '../lib/types';
import { exportStoryAsPDF } from '../lib/pdfExport';
import { getActionsByStoryId } from '../lib/data';
import { supabase } from '../lib/supabase';

interface StoryModalProps {
  story: Story;
  upload?: Upload;
  onClose: () => void;
  onViewInterventions: () => void;
}

export default function StoryModal({ story, upload, onClose, onViewInterventions }: StoryModalProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loadingActions, setLoadingActions] = useState(true);

  useEffect(() => {
    loadActions();
  }, [story.id]);

  const loadActions = async () => {
    try {
      setLoadingActions(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const storyActions = await getActionsByStoryId(user.id, story.id);
        setActions(storyActions);
      }
    } catch (error) {
      console.error('Failed to load actions:', error);
    } finally {
      setLoadingActions(false);
    }
  };
  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleDownloadPDF = () => {
    exportStoryAsPDF(story, actions);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-2xl font-bold">{story.team_name}</h2>
            <div className={`flex items-center gap-1 font-bold text-2xl ${getScoreColor(story.enps_score)}`}>
              {story.enps_score !== null && story.enps_score >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
              <span className="text-white">
                {story.enps_score !== null ? story.enps_score.toFixed(0) : 'N/A'}
              </span>
            </div>
            {story.sentiment && (
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getSentimentColor(
                  story.sentiment
                )}`}
              >
                {story.sentiment.charAt(0).toUpperCase() + story.sentiment.slice(1)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            {upload && (
              <section className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Dataset Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Source File</p>
                    <p className="text-slate-900 font-medium truncate">{upload.file_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Upload Date</p>
                    <p className="text-slate-900 font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(upload.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Total Responses</p>
                    <p className="text-slate-900 font-medium">{upload.total_responses}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Overall Score</p>
                    <p className="text-slate-900 font-medium">{upload.avg_score?.toFixed(1) || 'N/A'}</p>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                Summary
              </h3>
              <p className="text-slate-700 leading-relaxed text-base">
                {story.narrative || 'No narrative available'}
              </p>
            </section>

            {story.promoters_pct !== null && story.passives_pct !== null && story.detractors_pct !== null && (
              <section className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Team Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {story.promoters_pct.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Promoters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {story.passives_pct.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Passives</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {story.detractors_pct.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Detractors</div>
                  </div>
                </div>
              </section>
            )}

            {/* KEY THEMES REMOVED */}

            {story.strengths && story.strengths.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-green-900 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {story.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-slate-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {story.concerns && story.concerns.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-red-900 mb-3">Areas of Concern</h3>
                <ul className="space-y-2">
                  {story.concerns.map((concern, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">⚠</span>
                      <span className="text-slate-700">{concern}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!loadingActions && actions.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Recommended Actions
                </h3>
                <div className="space-y-4">
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900 flex-1">{action.title}</h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(
                            action.priority
                          )}`}
                        >
                          {action.priority.toUpperCase()}
                        </span>
                      </div>
                      {action.description && (
                        <p className="text-sm text-slate-600 mb-3">{action.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {action.effort && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{action.effort}h effort</span>
                          </div>
                        )}
                        {action.impact && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>{action.impact} impact</span>
                          </div>
                        )}
                      </div>
                      {action.action_items && action.action_items.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {action.action_items.map((item, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {story.quotes && story.quotes.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Sample Quotes</h3>
                <div className="space-y-3">
                  {story.quotes.map((quote, idx) => (
                    <blockquote
                      key={idx}
                      className="border-l-4 border-slate-300 pl-4 py-2 italic text-slate-600 bg-slate-50 rounded-r"
                    >
                      "{quote}"
                    </blockquote>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Download as PDF
          </button>
          <button
            onClick={onViewInterventions}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            View Actions
          </button>
        </div>
      </div>
    </div>
  );
}
