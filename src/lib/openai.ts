import { openai, handleOpenAIError, isOpenAIAvailable } from './openaiClient';
import type { Sentiment } from './types';

interface TeamAnalysisData {
  teamName: string;
  enpsScore: number;
  promoters: number;
  promotersPercent: number;
  passives: number;
  passivesPercent: number;
  detractors: number;
  detractorsPercent: number;
  responseCount: number;
  comments: string[];
}

interface AIGeneratedStory {
  narrative: string;
  sentiment: Sentiment;
  keyThemes: string[];
  quotes: string[];
  strengths: string[];
  concerns: string[];
}

interface AIGeneratedIntervention {
  title: string;
  description: string;
  actionItems: string[];
  effort: number;
  impact: string;
  timeline: string;
}

interface UserContext {
  organization_size?: string;
  primary_challenge?: string;
  action_plan_preference?: string;
}

export async function generateStoriesWithAI(
  teamsData: TeamAnalysisData[],
  userContext?: UserContext
): Promise<AIGeneratedStory[]> {
  const available = await isOpenAIAvailable();
  if (!available) {
    throw new Error('OpenAI API key is not configured. Please add the API key to continue.');
  }

  try {

    const contextInfo = userContext ? `
Context about the organization:
- Company size: ${userContext.organization_size || 'Not specified'}
- Primary engagement challenge: ${userContext.primary_challenge || 'Not specified'}
- Preferred action plan type: ${userContext.action_plan_preference || 'Not specified'}
` : '';

    const teamsPrompt = teamsData.map((teamData, idx) => `
Team ${idx + 1}: ${teamData.teamName}
- eNPS Score: ${teamData.enpsScore}
- Promoters: ${teamData.promoters} (${teamData.promotersPercent}%)
- Passives: ${teamData.passives} (${teamData.passivesPercent}%)
- Detractors: ${teamData.detractors} (${teamData.detractorsPercent}%)
- Response count: ${teamData.responseCount}

Comments (anonymized):
${teamData.comments.slice(0, 15).map((c, i) => `${i + 1}. "${c}"`).join('\n')}
`).join('\n---\n');

    const prompt = `${contextInfo}
Analyze this employee pulse survey data for multiple teams and create narrative insights for each.

${teamsPrompt}

For EACH team, generate a concise story (140-200 words) that:
1. Summarizes the team's sentiment and engagement level
2. Identifies 3-4 key themes from comments
3. ${userContext?.primary_challenge ? `Specifically addresses their primary challenge: ${userContext.primary_challenge}` : 'Highlights both strengths and areas of concern'}
4. ${userContext?.organization_size ? `Provides insights relevant to a ${userContext.organization_size} organization` : 'Provides context and trend insights'}
5. Includes 2-3 representative quotes (anonymized)

Return ONLY a valid JSON object with a "teams" array (no markdown, no extra text):
{
  "teams": [
    {
      "teamName": "exact team name from input",
      "narrative": "main story text",
      "sentiment": "positive" or "neutral" or "negative",
      "keyThemes": ["theme1", "theme2", "theme3"],
      "quotes": ["quote1", "quote2"],
      "strengths": ["strength1", "strength2"],
      "concerns": ["concern1", "concern2"]
    }
  ]
}`;

    const tokensPerTeam = 400;
    const maxTokens = Math.min(4000, teamsData.length * tokensPerTeam + 300);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR analyst specializing in employee engagement and eNPS analysis. Always return valid JSON without markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response (first 500 chars):', responseText.substring(0, 500));
      throw new Error(`Failed to parse AI response. The response may have been cut off. Try with fewer teams or contact support.`);
    }
    const teamsArray = parsed.teams || parsed;

    if (!Array.isArray(teamsArray)) {
      throw new Error('Response does not contain a valid teams array');
    }

    const validSentiments: Sentiment[] = ['positive', 'neutral', 'negative'];

    const stories = teamsArray.map((story: any) => {
      if (!story.teamName || typeof story.teamName !== 'string') {
        throw new Error('Invalid or missing teamName');
      }

      if (!validSentiments.includes(story.sentiment)) {
        throw new Error(`Invalid sentiment: ${story.sentiment}`);
      }

      if (!story.narrative || typeof story.narrative !== 'string') {
        throw new Error('Invalid or missing narrative');
      }

      return {
        narrative: story.narrative,
        sentiment: story.sentiment as Sentiment,
        keyThemes: Array.isArray(story.keyThemes) ? story.keyThemes.slice(0, 5) : [],
        quotes: Array.isArray(story.quotes) ? story.quotes.slice(0, 3) : [],
        strengths: Array.isArray(story.strengths) ? story.strengths.slice(0, 3) : [],
        concerns: Array.isArray(story.concerns) ? story.concerns.slice(0, 3) : [],
      };
    });

    if (stories.length !== teamsData.length) {
      throw new Error(`Expected ${teamsData.length} stories but got ${stories.length}`);
    }

    return stories;
  } catch (error: any) {
    const errorMessage = handleOpenAIError(error);
    console.error('Failed to generate stories with AI:', error);
    throw new Error(errorMessage);
  }
}

export async function generateStoryWithAI(
  teamData: TeamAnalysisData,
  userContext?: UserContext
): Promise<AIGeneratedStory> {
  const stories = await generateStoriesWithAI([teamData], userContext);
  return stories[0];
}

export async function generateInterventionsWithAI(
  teamName: string,
  enpsScore: number,
  keyThemes: string[],
  concerns: string[],
  userContext?: UserContext
): Promise<AIGeneratedIntervention[]> {
  const available = await isOpenAIAvailable();
  if (!available) {
    throw new Error('OpenAI API key is not configured. Please add the API key to continue.');
  }

  try {

    const contextInfo = userContext ? `
Organization context:
- Company size: ${userContext.organization_size || 'Not specified'}
- Primary focus: ${userContext.primary_challenge || 'Not specified'}
- Preferred action type: ${userContext.action_plan_preference || 'Not specified'}
` : '';

    const actionPreferenceGuidance = userContext?.action_plan_preference
      ? `

IMPORTANT: Match the preferred action style:
${userContext.action_plan_preference === 'small' ? '- Focus on quick wins (1-2 weeks, low effort, immediate impact)\n- Examples: weekly syncs, recognition programs, quick feedback loops' : ''}
${userContext.action_plan_preference === 'growing' ? '- Focus on balanced approach (1-3 months, moderate effort, sustainable change)\n- Mix quick wins with foundational improvements' : ''}
${userContext.action_plan_preference === 'midsize' ? '- Focus on strategic initiatives (3-6 months, higher effort, transformational)\n- Examples: restructure processes, implement new systems, culture transformation' : ''}
${userContext.action_plan_preference === 'enterprise' ? '- Provide a mix: 1 quick win (1-2 weeks), 1 medium-term (1-3 months), 1 strategic (3-6 months)' : ''}
`
      : '';

    const prompt = `${contextInfo}
Based on this team story and eNPS data, recommend 2-3 specific, actionable interventions:

Team: ${teamName}
eNPS: ${enpsScore}
Key themes: ${keyThemes.join(', ')}
Concerns: ${concerns.join(', ')}
${actionPreferenceGuidance}
For each intervention provide:
1. Title (clear action)
2. Description (why it matters, 2-3 sentences)
3. 3-5 specific action items
4. Effort level (1-5, where 1 is low effort and 5 is high effort)
5. Expected impact (brief description)
6. Implementation timeline (e.g., "1-2 weeks", "1-3 months")

${userContext?.primary_challenge ? `PRIORITIZE addressing: ${userContext.primary_challenge}` : ''}
${userContext?.organization_size ? `Ensure actions are realistic for a ${userContext.organization_size} organization` : ''}

Return ONLY a valid JSON object with an "interventions" array (no markdown, no extra text):
{
  "interventions": [
    {
      "title": "intervention title",
      "description": "why this matters",
      "actionItems": ["item1", "item2", "item3"],
      "effort": 3,
      "impact": "expected outcome",
      "timeline": "timeframe"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert organizational development consultant specializing in employee engagement interventions. Always return valid JSON without markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(responseText);
    const interventionsArray = parsed.interventions || parsed.actions || (Array.isArray(parsed) ? parsed : []);

    if (!Array.isArray(interventionsArray)) {
      throw new Error('Response does not contain a valid interventions array');
    }

    const interventions = interventionsArray.slice(0, 3).map((intervention: any) => {
      if (!intervention.title || typeof intervention.title !== 'string') {
        throw new Error('Invalid or missing intervention title');
      }

      return {
        title: intervention.title,
        description: intervention.description || '',
        actionItems: Array.isArray(intervention.actionItems)
          ? intervention.actionItems.slice(0, 5)
          : [],
        effort: typeof intervention.effort === 'number' && intervention.effort >= 1 && intervention.effort <= 5
          ? intervention.effort
          : 3,
        impact: intervention.impact || 'Expected to improve team engagement',
        timeline: intervention.timeline || '4-6 weeks',
      };
    });

    if (interventions.length === 0) {
      throw new Error('No valid actions generated');
    }

    return interventions;
  } catch (error: any) {
    const errorMessage = handleOpenAIError(error);
    console.error('Failed to generate interventions with AI:', error);
    throw new Error(errorMessage);
  }
}

export async function isAIAvailable(): Promise<boolean> {
  return isOpenAIAvailable();
}
