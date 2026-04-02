import { supabase } from "../lib/supabase";

export async function handleChatCompletion(req: any, res: any) {
  const { message, context, behavior, language, type } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "OpenRouter API Key is not configured in the backend." });
  }

  try {
    let systemPrompt = "";
    let prompt = "";
    let responseFormat = undefined;

    if (type === "plan") {
      const { memories, goals } = req.body;
      const contextStr = memories?.reverse().map((m: any) => `${m.role}: ${m.content}`).join("\n") || "";
      const goalList = goals?.map((g: any) => g.title).join(", ") || "No active goals.";

      systemPrompt = `You are LOKEY-AI, a personal development mentor.
      Based on the user's conversation history and their active goals, generate a daily plan.
      The plan should be actionable, realistic, and motivating.
      Format the plan as a structured daily schedule in JSON format.`;

      prompt = `User's conversation history:\n${contextStr}\n\nUser's active goals:\n${goalList}\n\nPlease generate a daily plan for today.
      The response MUST be a JSON object with a "plan" array. Each item in "plan" must have "time", "task", and "type" (academic, personal, professional, or rest).`;
      
      responseFormat = { type: "json_object" };
    } else if (type === "summary") {
      const { text } = req.body;
      systemPrompt = "You are a helpful assistant that summarizes documents accurately and concisely.";
      prompt = `Please summarize the following text concisely:\n\n${text.substring(0, 10000)}`;
    } else {
      systemPrompt = `You are LOKEY-AI, a helpful and empathetic personal development mentor.
      The user's current behavior is detected as: ${behavior}.
      The user's preferred language is: ${language}.
      Please respond in ${language} while being supportive and addressing their behavior.
      If they are lazy, motivate them. If stressed, calm them. If confused, explain clearly.
      Keep the conversation history in mind.`;

      prompt = `${context}\nuser: ${message}`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://lokey-ai.vercel.app", // Optional
        "X-Title": "LOKEY-AI", // Optional
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001", // Or another model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: responseFormat
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter Error:", errorData);
      throw new Error(errorData.error?.message || "Failed to get response from OpenRouter");
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    res.json({ text: aiMessage });
  } catch (error: any) {
    console.error("Chat Completion Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during AI generation." });
  }
}

export async function handleSaveChat(req: any, res: any) {
  const { userId, userMessage, aiMessage } = req.body;

  if (!userId || !userMessage || !aiMessage) {
    return res.status(400).json({ error: "userId, userMessage, and aiMessage are required." });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase client is not initialized. Check backend environment variables." });
    }
    const { error: saveError } = await supabase
      .from("memory")
      .insert([
        { user_id: userId, role: "user", content: userMessage },
        { user_id: userId, role: "assistant", content: aiMessage }
      ]);

    if (saveError) throw saveError;

    res.json({ success: true });
  } catch (error) {
    console.error("Save Chat Error:", error);
    res.status(500).json({ error: "Internal server error during chat saving." });
  }
}
