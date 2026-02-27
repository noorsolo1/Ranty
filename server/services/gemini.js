const { GoogleGenerativeAI } = require('@google/generative-ai');

const VALID_EMOTIONS = [
  'angry', 'anxious', 'sad', 'frustrated', 'overwhelmed',
  'scared', 'lonely', 'ashamed', 'discouraged', 'hopeful',
];

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

function stripMarkdownFences(text) {
  return text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
}

async function analyzeRant(transcript) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an empathetic emotional intelligence assistant. Analyze this voice rant transcript and return ONLY valid JSON with no markdown fences.

Transcript:
"${transcript}"

Return exactly this JSON structure:
{
  "emotions": ["array of 1-4 emotions from this list only: angry, anxious, sad, frustrated, overwhelmed, scared, lonely, ashamed, discouraged, hopeful"],
  "trigger_keywords": ["3-8 real nouns or short phrases that triggered the emotion, extracted directly from the transcript"],
  "ai_summary": "2-3 sentences in second person (You...) that acknowledge the feeling and offer one gentle, actionable reframe",
  "sentiment_score": -0.7
}

Rules:
- sentiment_score is a float from -1.0 (very negative) to 1.0 (very positive)
- emotions must only use words from the provided list
- trigger_keywords should be concrete nouns from the actual text
- Return ONLY the JSON object, nothing else`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = stripMarkdownFences(text);
  const parsed = JSON.parse(cleaned);

  // Validate and sanitize
  const emotions = (parsed.emotions || []).filter((e) => VALID_EMOTIONS.includes(e)).slice(0, 4);
  const trigger_keywords = (parsed.trigger_keywords || []).slice(0, 8);
  const ai_summary = parsed.ai_summary || '';
  const sentiment_score = Math.max(-1, Math.min(1, parseFloat(parsed.sentiment_score) || 0));

  return { emotions, trigger_keywords, ai_summary, sentiment_score };
}

async function generatePatternSummary(stats) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const { totalRants, emotionCounts, topKeywords, avgSentiment, peakHour } = stats;

  const prompt = `You are an empathetic emotional intelligence coach. Based on aggregated rant data, write a personalized pattern analysis in 3-4 paragraphs.

User stats:
- Total rants recorded: ${totalRants}
- Top emotions (most frequent first): ${emotionCounts.map((e) => `${e.emotion} (${e.count}x)`).join(', ')}
- Most common triggers: ${topKeywords.map((k) => `"${k.keyword}" (${k.count}x)`).join(', ')}
- Average sentiment score: ${avgSentiment.toFixed(2)} (scale: -1.0 worst to 1.0 best)
- Peak venting hour: ${peakHour}:00

Write a warm, insightful summary that:
1. Acknowledges the main emotional themes without judgment
2. Points out interesting patterns (like peak times, recurring triggers)
3. Offers 2-3 specific, actionable suggestions based on these patterns
4. Ends with an encouraging note about the act of self-reflection itself

Address the user directly using "you/your". Keep it between 150-250 words.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { analyzeRant, generatePatternSummary };
