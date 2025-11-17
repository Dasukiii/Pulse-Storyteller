import { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import EnpsScoreCard from './EnpsScoreCard';
import StatCard from './StatCard';
import RecentActivity from './RecentActivity';
import EmptyState from './EmptyState';
import UploadPage from './UploadPage';
import DataValidationPage from './DataValidationPage';
import StoriesPage from './StoriesPage';
import ActivityPage from './ActivityPage';
import { Users, FileText, Sparkles, Upload, AlertCircle } from 'lucide-react';
import { getUploads, getStories, getActions, getDashboardStats } from '../lib/data';
import type { Upload as UploadType, Story, Intervention } from '../lib/types';
import { supabase } from '../lib/supabase';
import { groupDataByTeam, generateStoriesForTeams } from '../lib/storyGenerationUtils';

type NavigationItem = 'dashboard' | 'upload' | 'validation' | 'stories' | 'activity';

interface DashboardProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  onLogout: () => void;
}

interface DashboardStats {
  currentEnpsScore: number | null;
  totalResponses: number;
  teamsAnalyzed: number;
  storiesGenerated: number;
  uploadsCount: number;
  interventionsCount: number;
}

interface Activity {
  id: string;
  title: string;
  date: string;
  type: 'upload' | 'story' | 'action';
}

function CombinedStatsCard({ stats }: { stats: DashboardStats | null }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Total Responses */}
        <div className="bg-yellow-50 rounded-xl p-4 h-44 flex flex-col">
          <div className="text-sm text-gray-500 h-10">
            Total Responses
          </div>

          {/* center area that keeps number aligned across all boxes */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {stats?.totalResponses ?? 'N/A'}
            </div>
          </div>

          {/* context anchored to bottom */}
          <div className="text-xs text-gray-400 mt-2">
            From {stats?.teamsAnalyzed ?? 'N/A'} teams
          </div>
        </div>

        {/* Teams Analyzed */}
        <div className="bg-gray-50 rounded-xl p-4 h-44 flex flex-col">
          <div className="text-sm text-gray-500 h-10">
            Teams Analyzed
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {stats?.teamsAnalyzed ?? 'N/A'}
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-2">All departments</div>
        </div>

        {/* Stories Generated */}
        <div className="bg-gray-50 rounded-xl p-4 h-44 flex flex-col">
          <div className="text-sm text-gray-500 h-10">
            AI Generated
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {stats?.storiesGenerated ?? 'N/A'}
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-2">Insights & Stories</div>
        </div>
      </div>
    </div>
  );
}


export default function Dashboard({
  userId,
  userName,
  userEmail,
  userRole,
  onLogout,
}: DashboardProps) {
  const [activeNav, setActiveNav] = useState<NavigationItem>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [generatingStories, setGeneratingStories] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number; message: string } | null>(null);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, uploads, stories, actions] = await Promise.all([
        getDashboardStats(userId),
        getUploads(userId),
        getStories(userId),
        getActions(userId),
      ]);

      setStats(dashboardStats);

      const recentActivities: Activity[] = [];

      uploads.slice(0, 3).forEach((upload) => {
        recentActivities.push({
          id: upload.id,
          title: upload.file_name,
          date: new Date(upload.upload_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          type: 'upload',
        });
      });

      stories.slice(0, 2).forEach((story) => {
        recentActivities.push({
          id: story.id,
          title: `${story.team_name} Story Generated`,
          date: new Date(story.generated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          type: 'story',
        });
      });

      actions.slice(0, 1).forEach((action) => {
        recentActivities.push({
          id: action.id,
          title: action.title,
          date: new Date(action.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          type: 'action',
        });
      });

      recentActivities.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setActivities(recentActivities.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    setActiveNav('upload');
  };

  const handleViewAllActivities = () => {
    setActiveNav('activity');
  };

  const handleUploadComplete = async (uploadId: string) => {
    setCurrentUploadId(uploadId);
    setActiveNav('validation');
  };

  const handleValidationComplete = async (uploadId: string, rawData: any[]) => {
    await generateStoriesAutomatically(uploadId, rawData);
  };

  const generateStoriesAutomatically = async (uploadId: string, rawData: any[]) => {
    setGeneratingStories(true);
    setGenerationError(null);
    setGenerationProgress(null);

    try {
      const teamDataList = groupDataByTeam(rawData);
      const teamCount = teamDataList.length;

      setGenerationProgress({
        current: 0,
        total: teamCount,
        message: `Preparing to analyze ${teamCount} team${teamCount > 1 ? 's' : ''}...`
      });

      const settings = {
        selectedTeams: teamDataList.map(td => td.team),
        allTeams: true,
        detailLevel: 'summary' as const,
      };

      setGenerationProgress({
        current: 0,
        total: teamCount,
        message: 'Loading your profile preferences...'
      });

      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_size, primary_challenge, action_plan_preference')
        .eq('id', userId)
        .single();

      const userContext = profileData ? {
        organization_size: profileData.organization_size,
        primary_challenge: profileData.primary_challenge,
        action_plan_preference: profileData.action_plan_preference,
      } : undefined;

      setGenerationProgress({
        current: 0,
        total: teamCount,
        message: 'Generating AI-powered insights...'
      });

      const stories = await generateStoriesForTeams(
        teamDataList,
        settings,
        () => {},
        undefined,
        userContext
      );

      setGenerationProgress({
        current: teamCount,
        total: teamCount,
        message: `Successfully generated ${stories.length} story${stories.length > 1 ? 'ies' : ''}!`
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      setGenerationProgress({
        current: teamCount,
        total: teamCount,
        message: 'Saving stories to database...'
      });

      for (const story of stories) {
        await supabase.from('stories').insert({
          user_id: user.id,
          upload_id: uploadId,
          team_name: story.teamName,
          enps_score: story.enpsScore,
          promoters_pct: story.promotersPercent,
          passives_pct: story.passivesPercent,
          detractors_pct: story.detractorsPercent,
          narrative: story.narrative,
          sentiment: story.sentiment,
          key_themes: story.keyThemes,
          quotes: story.quotes,
          strengths: story.strengths,
          concerns: story.concerns,
          generated_at: new Date().toISOString(),
        });
      }

      await loadDashboardData();
      setCurrentUploadId(null);
      setGeneratingStories(false);
      setGenerationProgress(null);
      setActiveNav('stories');
    } catch (error: any) {
      console.error('Error generating stories:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      setGenerationError(error?.message || 'Failed to generate stories. Please try again.');
      setGeneratingStories(false);
      setGenerationProgress(null);
    }
  };

  const hasData = stats && stats.uploadsCount > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-figtree">
        <DashboardHeader
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onLogout={onLogout}
        />
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Google Font Import and Body Style */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Figtree', sans-serif;
        }
      `}</style>

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

                  {/* Two-column layout:
                      Left (wide): RecentActivity (top) then Quick Actions (below)
                      Right (narrow): Upload button -> eNPS square -> Combined stats card
                  */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* LEFT: span 2 columns on large screens */}
                    <div className="lg:col-span-2 space-y-6">
                      <RecentActivity activities={activities} onViewAll={handleViewAllActivities} />

                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => setActiveNav('stories')}
                            className="w-full flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left"
                          >
                            <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">View Stories</p>
                              <p className="text-sm text-gray-500">
                                See AI-generated insights
                              </p>
                            </div>
                          </button>

                          {/* You can add more quick action buttons here */}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Upload button, eNPS, Combined stats */}
                    <div className="flex flex-col space-y-6">
                      <button
                        onClick={handleUploadClick}
                        className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        <Upload className="w-5 h-5" />
                        Upload New Survey Data
                      </button>

                      <div>
                        {stats?.currentEnpsScore !== null ? (
                          <EnpsScoreCard score={stats.currentEnpsScore || 0} />
                        ) : (
                          <StatCard
                            title="Current eNPS Score"
                            value="N/A"
                            icon={Sparkles}
                            iconColor="text-blue-600"
                            iconBgColor="bg-blue-50"
                            description="Upload data to see score"
                          />
                        )}
                      </div>

                      <CombinedStatsCard stats={stats} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeNav === 'upload' && (
            <UploadPage userId={userId} onUploadComplete={handleUploadComplete} />
          )}

          {activeNav === 'validation' && currentUploadId && !generatingStories && (
            <DataValidationPage
              uploadId={currentUploadId}
              onValidationComplete={handleValidationComplete}
            />
          )}

          {generatingStories && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-md text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Stories</h2>
                <p className="text-gray-600 mb-8">
                  Our AI is analyzing your data and creating personalized insights for all teams. This may take a minute...
                </p>

                {generationProgress && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{generationProgress.message}</span>
                      <span className="text-sm text-gray-500">{generationProgress.current}/{generationProgress.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                    Analyzing eNPS scores
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                    Processing comments and feedback
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                    Identifying key themes and patterns
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                    Generating narratives and insights
                  </div>
                </div>
              </div>
            </div>
          )}

          {generationError && !generatingStories && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-red-200 p-8 shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Story Generation Failed</h3>
                    <p className="text-gray-600 mb-4">{generationError}</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setActiveNav('validation')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => {
                          setGenerationError(null);
                          setActiveNav('dashboard');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'stories' && <StoriesPage />}

          {activeNav === 'activity' && <ActivityPage onBack={() => setActiveNav('dashboard')} />}
        </main>
      </div>
    </>
  );
}