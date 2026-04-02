import { getApiUrl } from "../lib/api";

export const geminiService = {
  async generateChatResponse(message: string, context: string, behavior: string, language: string) {
    try {
      const response = await fetch(getApiUrl('/api/chat/completions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          behavior,
          language,
          type: 'chat'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get AI response');
      }

      const data = await response.json();
      return data.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  },

  async generateDailyPlan(memories: any[], goals: any[]) {
    try {
      const response = await fetch(getApiUrl('/api/chat/completions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memories,
          goals,
          type: 'plan'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate plan');
      }

      const data = await response.json();
      // The backend returns the text, which should be a JSON string if type is 'plan'
      return JSON.parse(data.text || '{"plan": []}');
    } catch (error) {
      console.error('AI Plan Error:', error);
      return { plan: [] };
    }
  },

  async summarizeText(text: string) {
    if (!text || text.trim().length === 0) return "No text to summarize.";

    try {
      const response = await fetch(getApiUrl('/api/chat/completions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          type: 'summary'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to summarize text');
      }

      const data = await response.json();
      return data.text || "Failed to generate summary.";
    } catch (error) {
      console.error('AI Summary Error:', error);
      return "Failed to generate summary.";
    }
  }
};
