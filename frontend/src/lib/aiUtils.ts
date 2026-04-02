export function detectBehavior(message: string): string {
  const msg = message.toLowerCase();
  
  const keywords = {
    lazy: ["don't want to", "procrastinating", "tired", "lazy", "sleepy", "no energy", "bored", "can't be bothered"],
    stressed: ["anxious", "worried", "stressed", "overwhelmed", "pressure", "panic", "too much", "failing", "scared"],
    confused: ["don't understand", "lost", "confused", "what is", "how to", "unclear", "no idea", "help me understand"],
    motivated: ["excited", "ready", "let's go", "motivated", "pumped", "ambitious", "plan", "goal", "achieve"]
  };

  for (const [behavior, words] of Object.entries(keywords)) {
    if (words.some(word => msg.includes(word))) {
      return behavior;
    }
  }

  return "neutral";
}

export function detectLanguage(message: string): string {
  const msg = message.toLowerCase();
  
  // Simple Tamil detection (checking for common Tamil characters)
  const tamilRegex = /[\u0B80-\u0BFF]/;
  if (tamilRegex.test(message)) {
    return "Tamil";
  }

  // Common Tamil words in English script
  const tamilKeywords = ["vanakkam", "epadi", "irukinga", "nandri", "thambi", "anna", "akka", "amma", "appa"];
  if (tamilKeywords.some(word => msg.includes(word))) {
    return "Tamil";
  }

  return "English";
}
