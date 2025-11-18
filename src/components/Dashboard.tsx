import { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import EnpsScoreCard from './EnpsScoreCard';
import StatCard from './StatCard';
import RecentActivity from './RecentActivity';
import EmptyState from './EmptyState';
import { Users, FileText, Sparkles, Upload } from 'lucide-react';

type NavigationItem = 'dashboard' | 'upload' | 'stories' | 'interventions';

interface DashboardProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  onLogout: () => void;
}

export default function Dashboard({
  userId,
  userName,
  userEmail,
  userRole,
  onLogout,
}: DashboardProps) {
  const [activeNav, setActiveNav] = useState<NavigationItem>('dashboard');
  const [hasData] = useState(true);

  const mockActivities = [
    {
      id: '1',
      title: 'Q4 2024 Employee Pulse Survey',
      date: 'Nov 8, 2024',
      type: 'upload' as const,
    },
    {
      id: '2',
      title: 'Engineering Team Story Generated',
      date: 'Nov 7, 2024',
      type: 'story' as const,
    },
    {
      id: '3',
      title: 'Sales Team Intervention Plan',
      date: 'Nov 5, 2024',
      type: 'intervention' as const,
    },
  ];

  const handleUploadClick = () => {
    setActiveNav('upload');
  };

  const handleViewAllActivities = () => {
    console.log('View all activities');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onLogout={onLogout}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeNav === 'dashboard' && (
          <>
            {!hasData ? (
              <EmptyState onUploadClick={handleUploadClick} />
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {userName}
                  </h2>
                  <p className="text-gray-600">
                    Here's an overview of your employee pulse data and insights.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <EnpsScoreCard score={42} previousScore={38} />

                  <StatCard
                    title="Total Responses"
                    value="248"
                    icon={Users}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-50"
                    description="From 8 teams"
                  />

                  <StatCard
                    title="Teams Analyzed"
                    value="8"
                    icon={Users}
                    iconColor="text-green-600"
                    iconBgColor="bg-green-50"
                    description="Across departments"
                  />

                  <StatCard
                    title="Stories Generated"
                    value="3"
                    icon={Sparkles}
                    iconColor="text-purple-600"
                    iconBgColor="bg-purple-50"
                    description="AI-powered insights"
                  />
                </div>

                <div className="mb-8">
                  <button
                    onClick={handleUploadClick}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <Upload className="w-5 h-5" />
                    Upload New Survey Data
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RecentActivity
                    activities={mockActivities}
                    onViewAll={handleViewAllActivities}
                  />

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                          📊
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">View Stories</p>
                          <p className="text-sm text-gray-500">
                            See AI-generated insights
                          </p>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                          🎯
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Plan Interventions
                          </p>
                          <p className="text-sm text-gray-500">
                            Create action plans
                          </p>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                          📈
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            View Analytics
                          </p>
                          <p className="text-sm text-gray-500">
                            Explore trends and patterns
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeNav === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Upload Survey Data
              </h2>
              <p className="text-gray-600 mb-8">
                This feature will be available soon. You'll be able to upload your eNPS
                survey data in CSV, Excel, or JSON format.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'stories' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Stories</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              AI-generated narrative insights from your survey data will appear here.
            </p>
          </div>
        )}

        {activeNav === 'interventions' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Interventions
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Action plans and recommendations for your teams will be shown here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
