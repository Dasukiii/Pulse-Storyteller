import { X, AlertCircle, Target, Zap, CheckCircle2, Clock } from 'lucide-react';
import type { Story, Action } from '../lib/types';

interface ActionsModalProps {
  story: Story;
  actions: Action[];
  loading: boolean;
  onClose: () => void;
}

export default function ActionsModal({
  story,
  actions,
  loading,
  onClose,
}: ActionsModalProps) {
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{story.team_name}</h2>
            <p className="text-sm text-slate-600 mt-1">
              Recommended Actions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No actions yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create actions to track action items for this team
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {action.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                            action.priority
                          )}`}
                        >
                          {getPriorityIcon(action.priority)}
                          {action.priority.charAt(0).toUpperCase() +
                            action.priority.slice(1)} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                    {action.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        Effort: <span className="font-medium text-slate-900">{action.effort}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        Impact: <span className="font-medium text-slate-900">{action.impact}</span>
                      </span>
                    </div>
                  </div>

                  {action.action_items && action.action_items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-600 mb-2">
                        Action Items
                      </p>
                      <ul className="space-y-2">
                        {action.action_items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Created {new Date(action.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
