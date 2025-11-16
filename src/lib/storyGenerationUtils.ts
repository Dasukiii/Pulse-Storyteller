import type { Sentiment } from './types';
import { generateStoriesWithAI } from './openai';

export interface GenerationSettings {
  selectedTeams: string[];
  allTeams: boolean;
  detailLevel: 'summary' | 'detailed';
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface TeamData {
  team: string;
  responses: any[];
  scores: number[];
  comments: string[];
  avgScore: number;
  enpsScore: number;
}

export interface GeneratedStory {
  teamName: string;
  enpsScore: number;
  promoters: number;
  promotersPercent: number;
  passives: number;
  passivesPercent: number;
  detractors: number;
  detractorsPercent: number;
  sentiment: Sentiment;
  narrative: string;
  keyThemes: string[];
  quotes: string[];
  strengths: string[];
  concerns: string[];
}

export const GENERATION_STEPS: ProcessingStep[] = [
  { id: 'scores', label: 'Analyzing eNPS scores', status: 'pending' },
  { id: 'comments', label: 'Processing comments', status: 'pending' },
  { id: 'themes', label: 'Identifying themes', status: 'pending' },
  { id: 'narratives', label: 'Generating narratives', status: 'pending' },
  { id: 'recommendations', label: 'Creating recommendations', status: 'pending' },
];

export function groupDataByTeam(data: any[]): TeamData[] {
  const teamGroups: Record<string, any[]> = {};

  data.forEach((row) => {
    const team = row.Team;
    if (!teamGroups[team]) {
      teamGroups[team] = [];
    }
    teamGroups[team].push(row);
  });

  return Object.entries(teamGroups).map(([team, responses]) => {
    const scores = responses
      .map((r) => parseFloat(r.Score))
      .filter((s) => !isNaN(s));

    const comments = responses
      .map((r) => r.Comments)
      .filter((c) => c && c.trim() !== '');

    const avgScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;

    const promoters = scores.filter((s) => s >= 9).length;
    const detractors = scores.filter((s) => s <= 6).length;
    const enpsScore = Math.round(
      ((promoters - detractors) / responses.length) * 100
    );

    return {
      team,
      responses,
      scores,
      comments,
      avgScore: Math.round(avgScore * 10) / 10,
      enpsScore,
    };
  });
}


export interface UserContext {
  organization_size?: string;
  primary_challenge?: string;
  action_plan_preference?: string;
}

export async function generateStoriesForTeams(
  teamDataList: TeamData[],
  settings: GenerationSettings,
  onStepUpdate: (stepId: string, status: ProcessingStep['status']) => void,
  onProgress?: (current: number, total: number, teamName: string) => void,
  userContext?: UserContext
): Promise<GeneratedStory[]> {
  const stories: GeneratedStory[] = [];

  onStepUpdate('scores', 'processing');
  await simulateDelay(500);
  onStepUpdate('scores', 'completed');

  onStepUpdate('comments', 'processing');
  await simulateDelay(500);
  onStepUpdate('comments', 'completed');

  onStepUpdate('themes', 'processing');
  await simulateDelay(500);
  onStepUpdate('themes', 'completed');

  onStepUpdate('narratives', 'processing');

  const teamsAnalysisData = teamDataList.map((teamData) => {
    const promoters = teamData.scores.filter((s) => s >= 9).length;
    const passives = teamData.scores.filter((s) => s >= 7 && s < 9).length;
    const detractors = teamData.scores.filter((s) => s < 7).length;
    const total = teamData.responses.length;

    const promotersPercent = Math.round((promoters / total) * 1000) / 10;
    const passivesPercent = Math.round((passives / total) * 1000) / 10;
    const detractorsPercent = Math.round((detractors / total) * 1000) / 10;

    return {
      teamName: teamData.team,
      enpsScore: teamData.enpsScore,
      promoters,
      promotersPercent,
      passives,
      passivesPercent,
      detractors,
      detractorsPercent,
      responseCount: total,
      comments: teamData.comments,
      teamIndex: teamDataList.indexOf(teamData),
    };
  });

  if (onProgress) {
    onProgress(1, teamDataList.length, 'All teams');
  }

  const aiStories = await generateStoriesWithAI(teamsAnalysisData, userContext);

  for (let i = 0; i < teamDataList.length; i++) {
    const teamData = teamDataList[i];
    const analysisData = teamsAnalysisData[i];
    const aiStory = aiStories[i];

    stories.push({
      teamName: teamData.team,
      enpsScore: teamData.enpsScore,
      promoters: analysisData.promoters,
      promotersPercent: analysisData.promotersPercent,
      passives: analysisData.passives,
      passivesPercent: analysisData.passivesPercent,
      detractors: analysisData.detractors,
      detractorsPercent: analysisData.detractorsPercent,
      sentiment: aiStory.sentiment,
      narrative: aiStory.narrative,
      keyThemes: aiStory.keyThemes,
      quotes: aiStory.quotes,
      strengths: aiStory.strengths,
      concerns: aiStory.concerns,
    });

    await simulateDelay(100);
  }

  onStepUpdate('narratives', 'completed');

  onStepUpdate('recommendations', 'processing');
  await simulateDelay(500);
  onStepUpdate('recommendations', 'completed');

  return stories;
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDefaultSettings(teams: string[]): GenerationSettings {
  return {
    selectedTeams: teams,
    allTeams: true,
    detailLevel: 'detailed',
  };
}
