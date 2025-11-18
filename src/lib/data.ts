import { supabase } from './supabase';
import type {
  Upload,
  Story,
  Action,
  Intervention,
  CreateUploadInput,
  CreateStoryInput,
  CreateActionInput,
  CreateInterventionInput,
} from './types';

export async function saveUpload(
  userId: string,
  data: CreateUploadInput
): Promise<Upload> {
  const { data: upload, error } = await supabase
    .from('uploads')
    .insert({
      user_id: userId,
      file_name: data.file_name,
      total_responses: data.total_responses,
      avg_score: data.avg_score,
      status: data.status || 'uploaded',
      raw_data: data.raw_data,
    })
    .select()
    .single();

  if (error) throw error;
  return upload;
}

export async function getUploads(userId: string): Promise<Upload[]> {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .order('upload_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUploadById(
  userId: string,
  uploadId: string
): Promise<Upload | null> {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .eq('id', uploadId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateUploadStatus(
  userId: string,
  uploadId: string,
  status: 'uploaded' | 'validated' | 'processed'
): Promise<Upload> {
  const { data, error } = await supabase
    .from('uploads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', uploadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveStory(
  userId: string,
  data: CreateStoryInput
): Promise<Story> {
  const { data: story, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      upload_id: data.upload_id,
      team_name: data.team_name,
      enps_score: data.enps_score,
      narrative: data.narrative,
      sentiment: data.sentiment,
      key_themes: data.key_themes || [],
      quotes: data.quotes || [],
    })
    .select()
    .single();

  if (error) throw error;
  return story;
}

export async function getStories(userId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getStoriesByUploadId(
  userId: string,
  uploadId: string
): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .eq('upload_id', uploadId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getStoryById(
  userId: string,
  storyId: string
): Promise<Story | null> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .eq('id', storyId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveIntervention(
  userId: string,
  data: CreateInterventionInput
): Promise<Intervention> {
  const { data: intervention, error } = await supabase
    .from('interventions')
    .insert({
      user_id: userId,
      story_id: data.story_id,
      team_name: data.team_name,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      effort: data.effort,
      impact: data.impact,
      action_items: data.action_items || [],
      status: data.status || 'suggested',
      implementation_time: data.implementation_time,
    })
    .select()
    .single();

  if (error) throw error;
  return intervention;
}

export async function getActions(userId: string): Promise<Action[]> {
  const { data, error } = await supabase
    .from('interventions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export const getInterventions = getActions;

export async function getActionsByStoryId(
  userId: string,
  storyId: string
): Promise<Action[]> {
  const { data, error } = await supabase
    .from('interventions')
    .select('*')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export const getInterventionsByStoryId = getActionsByStoryId;

export async function getActionById(
  userId: string,
  actionId: string
): Promise<Action | null> {
  const { data, error } = await supabase
    .from('interventions')
    .select('*')
    .eq('user_id', userId)
    .eq('id', actionId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export const getInterventionById = getActionById;

export async function updateAction(
  userId: string,
  actionId: string,
  updates: Partial<CreateActionInput>
): Promise<Action> {
  const { data, error } = await supabase
    .from('interventions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', actionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const updateIntervention = updateAction;

export async function deleteUpload(userId: string, uploadId: string): Promise<void> {
  const { error } = await supabase
    .from('uploads')
    .delete()
    .eq('user_id', userId)
    .eq('id', uploadId);

  if (error) throw error;
}

export async function deleteStory(userId: string, storyId: string): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('user_id', userId)
    .eq('id', storyId);

  if (error) throw error;
}

export async function deleteAction(
  userId: string,
  actionId: string
): Promise<void> {
  const { error } = await supabase
    .from('interventions')
    .delete()
    .eq('user_id', userId)
    .eq('id', actionId);

  if (error) throw error;
}

export const deleteIntervention = deleteAction;

export async function getDashboardStats(userId: string) {
  const [uploads, stories, actions] = await Promise.all([
    getUploads(userId),
    getStories(userId),
    getActions(userId),
  ]);

  const totalResponses = uploads.reduce(
    (sum, upload) => sum + (upload.total_responses || 0),
    0
  );

  const latestUpload = uploads[0];
  const currentScore = latestUpload?.avg_score || null;

  const teamsAnalyzed = new Set(stories.map((s) => s.team_name)).size;

  return {
    currentEnpsScore: currentScore,
    totalResponses,
    teamsAnalyzed,
    storiesGenerated: stories.length,
    uploadsCount: uploads.length,
    interventionsCount: actions.length,
    actionsCount: actions.length,
  };
}
