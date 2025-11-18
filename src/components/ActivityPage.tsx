import { useState, useEffect } from 'react';
import { Calendar, Upload, BookOpen, Zap, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getUploads, getStories, getActions } from '../lib/data';
import { useAuth } from '../hooks/useAuth';
import type { Upload as UploadType, Story, Action } from '../lib/types';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'upload' | 'story' | 'action';
  icon: typeof Upload | typeof BookOpen | typeof Zap;
  iconBg: string;
  iconColor: string;
}

interface ActivityPageProps {
  onBack: () => void;
}

export default function ActivityPage({ onBack }: ActivityPageProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, [user]);

  const loadActivities = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [uploads, stories, actions] = await Promise.all([
        getUploads(user.id),
        getStories(user.id),
        getActions(user.id),
      ]);

      const allActivities: Activity[] = [];

      uploads.forEach((upload) => {
        allActivities.push({
          id: upload.id,
          title: 'Data Upload',
          description: `Uploaded ${upload.file_name} with ${upload.total_responses} responses`,
          date: new Date(upload.upload_date).toISOString(),
          type: 'upload',
          icon: Upload,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        });
      });

      stories.forEach((story) => {
        allActivities.push({
          id: story.id,
          title: 'Story Generated',
          description: `Created narrative for ${story.team_name}`,
          date: new Date(story.generated_at).toISOString(),
          type: 'story',
          icon: BookOpen,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
        });
      });

      actions.forEach((action) => {
        allActivities.push({
          id: action.id,
          title: 'Action Created',
          description: `${action.title} for ${action.team_name}`,
          date: new Date(action.created_at).toISOString(),
          type: 'action',
          icon: Zap,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
        });
      });

      allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(allActivities);
    } catch (err) {
      setError('Failed to load activities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Activity</h1>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Activity</h1>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-12">
              <p className="text-center text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Activity</h1>
        </div>

        {activities.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No activities yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${activity.iconBg}`}>
                        <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900">{activity.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
