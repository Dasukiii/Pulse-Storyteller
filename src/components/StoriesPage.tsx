import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, BookOpen, Download, RefreshCw, ArrowUpDown, FileText, Sparkles, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getStories, getActionsByStoryId, saveIntervention, getUploads } from '../lib/data';
import { generateInterventionsWithAI } from '../lib/openai';
import type { Upload } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Story, Sentiment, Action } from '../lib/types';
import ActionsModal from './ActionsModal';
import StoryModal from './StoryModal';
import { exportStoryAsPDF } from '../lib/pdfExport';

type SortOption = 'score-desc' | 'score-asc' | 'name-asc' | 'date-desc' | 'date-asc';
type TimeFilter = 'all' | 'today' | 'week' | 'month';

export default function StoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [generatingActions, setGeneratingActions] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
  }, [user]);

  const loadStories = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [storiesData, uploadsData] = await Promise.all([
        getStories(user.id),
        getUploads(user.id)
      ]);
      setStories(storiesData);
      setUploads(uploadsData);
    } catch (err) {
      setError('Failed to load stories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewActions = async (story: Story) => {
    if (!user) return;

    setSelectedStory(story);
    setLoadingActions(true);
    setShowActionsModal(true);

    try {
      const data = await getActionsByStoryId(user.id, story.id);
      setActions(data);
    } catch (err) {
      console.error('Failed to load actions:', err);
      setActions([]);
    } finally {
      setLoadingActions(false);
    }
  };

  const handleExportStory = (story: Story, event: React.MouseEvent) => {
    event.stopPropagation();
    exportStoryAsPDF(story);
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setShowStoryModal(true);
  };

  const handleStoryModalViewActions = async () => {
    if (!user || !selectedStory) return;

    setShowStoryModal(false);
    setLoadingActions(true);
    setShowActionsModal(true);

    try {
      const data = await getActionsByStoryId(user.id, selectedStory.id);
      setActions(data);
    } catch (err) {
      console.error('Failed to load actions:', err);
      setActions([]);
    } finally {
      setLoadingActions(false);
    }
  };

  const handleCreateActions = async (story: Story) => {
    if (!user) return;

    setGeneratingActions(story.id);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_size, primary_challenge, action_plan_preference')
        .eq('id', user.id)
        .maybeSingle();

      const userContext = profileData ? {
        organization_size: profileData.organization_size,
        primary_challenge: profileData.primary_challenge,
        action_plan_preference: profileData.action_plan_preference,
      } : undefined;

      const interventions = await generateInterventionsWithAI(
        story.team_name,
        story.enps_score || 0,
        story.key_themes || [],
        story.concerns || [],
        userContext
      );

      for (const intervention of interventions) {
        await saveIntervention(user.id, {
          story_id: story.id,
          team_name: story.team_name,
          title: intervention.title,
          description: intervention.description,
          priority: intervention.priority,
          effort: intervention.effort,
          impact: intervention.impact,
          action_items: intervention.actionItems || [],
          implementation_time: intervention.implementationTime,
          status: 'suggested',
        });
      }

      await loadStories();

      setSelectedStory(story);
      setLoadingActions(true);
      setShowActionsModal(true);

      const data = await getActionsByStoryId(user.id, story.id);
      setActions(data);
      setLoadingActions(false);
    } catch (err) {
      console.error('Failed to generate actions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate actions');
    } finally {
      setGeneratingActions(null);
    }
  };

  const filteredAndSortedStories = useMemo(() => {
    let filtered = stories;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((story) =>
        story.team_name.toLowerCase().includes(term)
      );
    }

    if (sentimentFilter !== 'all') {
      filtered = filtered.filter((story) => story.sentiment === sentimentFilter);
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((story) => {
        const storyDate = new Date(story.generated_at);

        switch (timeFilter) {
          case 'today':
            return storyDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return storyDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return storyDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'score-desc':
        sorted.sort((a, b) => (b.enps_score || 0) - (a.enps_score || 0));
        break;
      case 'score-asc':
        sorted.sort((a, b) => (a.enps_score || 0) - (b.enps_score || 0));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.team_name.localeCompare(b.team_name));
        break;
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.generated_at).getTime() - new Date(b.generated_at).getTime());
        break;
    }

    return sorted;
  }, [stories, searchTerm, sentimentFilter, timeFilter, sortBy]);

  const getSentimentColor = (sentiment: Sentiment) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-white rounded-lg shadow animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <FileText className="w-5 h-5" />
                <div>
                  <p className="font-medium">{error}</p>
                  <button
                    onClick={loadStories}
                    className="text-sm text-red-600 hover:text-red-700 underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Stories & Insights</h1>
          <p className="text-slate-600 mb-8">AI-generated narratives and insights from your team data</p>

          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                No stories generated yet
              </h2>
              <p className="text-slate-600 mb-6">
                Upload data and generate team stories to see insights here
              </p>
              <button
                onClick={() => window.location.href = '#upload'}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Go to Upload
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Stories & Insights</h1>
            <p className="text-slate-600">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'} generated
            </p>
          </div>
          <button
            onClick={loadStories}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as Sentiment | 'all')}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>

              <Clock className="w-5 h-5 text-slate-600 ml-2" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-slate-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Score (High-Low)</option>
                <option value="score-asc">Score (Low-High)</option>
                <option value="name-asc">Team Name</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedStories.map((story) => (
            <Card
              key={story.id}
              className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
              onClick={() => handleStoryClick(story)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{story.team_name}</CardTitle>
                  <div className={`flex items-center gap-1 font-bold text-2xl ${getScoreColor(story.enps_score)}`}>
                    {story.enps_score !== null && story.enps_score >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    {story.enps_score !== null ? story.enps_score.toFixed(0) : 'N/A'}
                  </div>
                </div>
                {story.sentiment && (
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getSentimentColor(
                      story.sentiment
                    )}`}
                  >
                    {story.sentiment.charAt(0).toUpperCase() + story.sentiment.slice(1)}
                  </span>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-base text-slate-700 leading-relaxed line-clamp-3">
                      {story.narrative}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 mt-4">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewActions(story);
                      }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors"
                    >
                      View Action
                    </button>
                    <button
                      onClick={(e) => handleExportStory(story, e)}
                      className="px-2 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                      title="Download as PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateActions(story);
                      }}
                      disabled={generatingActions === story.id}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingActions === story.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Create Actions
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedStories.length === 0 && (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No stories match your filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {showStoryModal && selectedStory && (
        <StoryModal
          story={selectedStory}
          upload={uploads.find(u => u.id === selectedStory.upload_id)}
          onClose={() => {
            setShowStoryModal(false);
            setSelectedStory(null);
          }}
          onViewInterventions={handleStoryModalViewActions}
        />
      )}

      {showActionsModal && selectedStory && (
        <ActionsModal
          story={selectedStory}
          actions={actions}
          loading={loadingActions}
          onClose={() => {
            setShowActionsModal(false);
            setSelectedStory(null);
            setActions([]);
          }}
        />
      )}
    </div>
  );
}
