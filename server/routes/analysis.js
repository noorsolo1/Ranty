const express = require('express');
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { generatePatternSummary } = require('../services/gemini');

const router = express.Router();
router.use(authMiddleware);

// GET /api/analysis/emotions
router.get('/emotions', (req, res) => {
  const db = getDb();
  const rants = db.prepare('SELECT emotions FROM rants WHERE user_id = ? AND emotions IS NOT NULL')
    .all(req.user.id);

  const counts = {};
  for (const rant of rants) {
    const emotions = JSON.parse(rant.emotions);
    for (const e of emotions) {
      counts[e] = (counts[e] || 0) + 1;
    }
  }

  const result = Object.entries(counts)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count);

  res.json(result);
});

// GET /api/analysis/keywords
router.get('/keywords', (req, res) => {
  const db = getDb();
  const rants = db
    .prepare('SELECT trigger_keywords FROM rants WHERE user_id = ? AND trigger_keywords IS NOT NULL')
    .all(req.user.id);

  const counts = {};
  for (const rant of rants) {
    const keywords = JSON.parse(rant.trigger_keywords);
    for (const k of keywords) {
      const normalized = k.toLowerCase();
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
  }

  const result = Object.entries(counts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);

  res.json(result);
});

// GET /api/analysis/heatmap
router.get('/heatmap', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT hour_of_day as hour, COUNT(*) as count
    FROM rants
    WHERE user_id = ? AND hour_of_day IS NOT NULL
    GROUP BY hour_of_day
    ORDER BY hour_of_day
  `).all(req.user.id);

  // Fill in missing hours with 0
  const hourMap = {};
  for (const row of rows) hourMap[row.hour] = row.count;
  const result = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: hourMap[h] || 0 }));

  res.json(result);
});

// GET /api/analysis/summary
router.get('/summary', async (req, res) => {
  const db = getDb();

  // Check cache
  const cached = db
    .prepare('SELECT * FROM analysis_cache WHERE user_id = ?')
    .get(req.user.id);

  if (cached) {
    const ageMs = Date.now() - new Date(cached.generated_at).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    if (ageMs < oneDay) {
      return res.json({ summary: cached.summary, generated_at: cached.generated_at, cached: true });
    }
  }

  // Generate fresh
  try {
    const summary = await buildSummary(req.user.id, db);
    res.json({ summary, generated_at: new Date().toISOString(), cached: false });
  } catch (err) {
    console.error('Summary generation error:', err);
    if (cached) {
      return res.json({ summary: cached.summary, generated_at: cached.generated_at, cached: true, stale: true });
    }
    res.status(500).json({ error: 'Could not generate summary: ' + err.message });
  }
});

// POST /api/analysis/summary/refresh
router.post('/summary/refresh', async (req, res) => {
  const db = getDb();
  try {
    const summary = await buildSummary(req.user.id, db);
    res.json({ summary, generated_at: new Date().toISOString(), cached: false });
  } catch (err) {
    console.error('Summary refresh error:', err);
    res.status(500).json({ error: 'Could not generate summary: ' + err.message });
  }
});

async function buildSummary(userId, db) {
  const totalRow = db.prepare('SELECT COUNT(*) as total FROM rants WHERE user_id = ?').get(userId);
  const totalRants = totalRow.total;

  if (totalRants === 0) {
    return "You haven't recorded any rants yet. Start venting to see your emotional patterns here!";
  }

  const rants = db
    .prepare('SELECT emotions, trigger_keywords, sentiment_score, hour_of_day FROM rants WHERE user_id = ?')
    .all(userId);

  const emotionCounts = {};
  const keywordCounts = {};
  let sentimentSum = 0;
  let sentimentCount = 0;
  const hourCounts = {};

  for (const rant of rants) {
    if (rant.emotions) {
      JSON.parse(rant.emotions).forEach((e) => {
        emotionCounts[e] = (emotionCounts[e] || 0) + 1;
      });
    }
    if (rant.trigger_keywords) {
      JSON.parse(rant.trigger_keywords).forEach((k) => {
        const kl = k.toLowerCase();
        keywordCounts[kl] = (keywordCounts[kl] || 0) + 1;
      });
    }
    if (rant.sentiment_score !== null) {
      sentimentSum += rant.sentiment_score;
      sentimentCount++;
    }
    if (rant.hour_of_day !== null) {
      hourCounts[rant.hour_of_day] = (hourCounts[rant.hour_of_day] || 0) + 1;
    }
  }

  const sortedEmotions = Object.entries(emotionCounts)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const sortedKeywords = Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const avgSentiment = sentimentCount > 0 ? sentimentSum / sentimentCount : 0;

  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

  const stats = {
    totalRants,
    emotionCounts: sortedEmotions,
    topKeywords: sortedKeywords,
    avgSentiment,
    peakHour: parseInt(peakHour),
  };

  const summary = await generatePatternSummary(stats);

  // Upsert cache
  db.prepare(`
    INSERT INTO analysis_cache (user_id, summary, generated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET summary = excluded.summary, generated_at = excluded.generated_at
  `).run(userId, summary);

  return summary;
}

module.exports = router;
