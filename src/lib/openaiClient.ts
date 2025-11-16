import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;
let apiKeyCache: string | null = null;
let apiKeyPromise: Promise<string | null> | null = null;

async function fetchOpenAIApiKey(): Promise<string | null> {
  if (apiKeyCache) return apiKeyCache;

  if (apiKeyPromise) return apiKeyPromise;

  apiKeyPromise = (async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase credentials not found');
        return null;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/get-openai-key`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch OpenAI API key:', response.status);
        return null;
      }

      const data = await response.json();
      apiKeyCache = data.apiKey;
      return apiKeyCache;
    } catch (error) {
      console.error('Error fetching OpenAI API key:', error);
      return null;
    } finally {
      apiKeyPromise = null;
    }
  })();

  return apiKeyPromise;
}

async function getOpenAIClient(): Promise<OpenAI> {
  if (openaiInstance) {
    return openaiInstance;
  }

  const openaiApiKey = await fetchOpenAIApiKey();

  if (!openaiApiKey) {
    throw new Error('OpenAI API key is not configured. Please contact your administrator.');
  }

  openaiInstance = new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true,
  });

  return openaiInstance;
}

export const openai = {
  get chat() {
    return {
      completions: {
        create: async (...args: any[]) => {
          const client = await getOpenAIClient();
          return client.chat.completions.create(...args);
        }
      }
    };
  }
};

export async function isOpenAIAvailable(): Promise<boolean> {
  try {
    const apiKey = await fetchOpenAIApiKey();
    return !!apiKey;
  } catch {
    return false;
  }
}

export const handleOpenAIError = (error: any): string => {
  if (error?.message?.includes('not configured')) {
    return 'OpenAI API key is not configured. Please contact your administrator.';
  } else if (error.status === 429) {
    return 'Rate limit exceeded. Please wait a moment and try again.';
  } else if (error.status === 401) {
    return 'Invalid API key. Please check your OpenAI configuration.';
  } else if (error.status === 500) {
    return 'OpenAI service error. Please try again later.';
  } else if (error?.message) {
    return error.message;
  } else {
    return 'Failed to generate insights. Please try again.';
  }
};
