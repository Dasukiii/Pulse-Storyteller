import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, Calendar, ArrowRight } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  date: string;
  type: 'upload' | 'story' | 'intervention';
}

interface RecentActivityProps {
  activities: Activity[];
  onViewAll: () => void;
}

export default function RecentActivity({ activities, onViewAll }: RecentActivityProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return '📤';
      case 'story':
        return '📖';
      case 'intervention':
        return '🎯';
    }
  };

  const getActivityLabel = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return 'Survey Uploaded';
      case 'story':
        return 'Story Generated';
      case 'intervention':
        return 'Intervention Created';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <button
          onClick={onViewAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs mt-1">
              Your activity will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                  {getActivityLabel(activity.type)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
