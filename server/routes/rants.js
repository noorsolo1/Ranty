const express = require('express');
const fs = require('fs');
const path = require('path');
const { getDb } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { upload, renameAudioFile, deleteAudioFile, getAudioFilePath } = require('../services/audioStorage');
const { analyzeRant } = require('../services/gemini');

const router = express.Router();
router.use(authMiddleware);

// GET /api/rants?page=1&limit=20&search=
router.get('/', (req, res) => {
  const db = getDb();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  let query = 'SELECT * FROM rants WHERE user_id = ?';
  const params = [req.user.id];

  if (search) {
    query += ' AND (transcript LIKE ? OR title LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const { total } = db.prepare(countQuery).get(...params);

  query += ' ORDER BY recorded_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rants = db.prepare(query).all(...params).map(parseRant);

  res.json({ rants, total, page, limit, pages: Math.ceil(total / limit) });
});

// POST /api/rants (multipart)
router.post('/', upload.single('audio'), async (req, res) => {
  const db = getDb();
  const { transcript, duration_sec } = req.body;

  if (!transcript || !transcript.trim()) {
    if (req.file) deleteAudioFile(req.file.filename);
    return res.status(400).json({ error: 'transcript is required' });
  }

  const now = new Date();
  const hourOfDay = now.getHours();
  const title = transcript.trim().slice(0, 60);

  const result = db.prepare(`
    INSERT INTO rants (user_id, title, transcript, audio_filename, duration_sec, recorded_at, hour_of_day)
    VALUES (?, ?, ?, NULL, ?, datetime('now'), ?)
  `).run(req.user.id, title, transcript.trim(), parseInt(duration_sec) || null, hourOfDay);

  const rantId = result.lastInsertRowid;

  // Rename audio file if uploaded
  if (req.file) {
    const newFilename = renameAudioFile(req.file.filename, req.user.id, rantId);
    db.prepare('UPDATE rants SET audio_filename = ? WHERE id = ?').run(newFilename, rantId);
  }

  // Fire-and-forget Gemini analysis
  (async () => {
    try {
      const analysis = await analyzeRant(transcript);
      db.prepare(`
        UPDATE rants SET
          emotions = ?,
          trigger_keywords = ?,
          ai_summary = ?,
          sentiment_score = ?
        WHERE id = ?
      `).run(
        JSON.stringify(analysis.emotions),
        JSON.stringify(analysis.trigger_keywords),
        analysis.ai_summary,
        analysis.sentiment_score,
        rantId
      );
      console.log(`Gemini analysis complete for rant ${rantId}`);
    } catch (err) {
      console.error(`Gemini analysis failed for rant ${rantId}:`, err.message);
    }
  })();

  const rant = db.prepare('SELECT * FROM rants WHERE id = ?').get(rantId);
  res.status(201).json(parseRant(rant));
});

// GET /api/rants/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const rant = db.prepare('SELECT * FROM rants WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!rant) return res.status(404).json({ error: 'Rant not found' });
  res.json(parseRant(rant));
});

// DELETE /api/rants/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const rant = db.prepare('SELECT * FROM rants WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!rant) return res.status(404).json({ error: 'Rant not found' });

  if (rant.audio_filename) deleteAudioFile(rant.audio_filename);
  db.prepare('DELETE FROM rants WHERE id = ?').run(rant.id);

  res.json({ success: true });
});

// GET /api/rants/:id/audio (Range-request aware streaming)
router.get('/:id/audio', (req, res) => {
  const db = getDb();
  const rant = db.prepare('SELECT * FROM rants WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!rant) return res.status(404).json({ error: 'Rant not found' });
  if (!rant.audio_filename) return res.status(404).json({ error: 'No audio for this rant' });

  const filePath = getAudioFilePath(rant.audio_filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Audio file not found' });

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const rangeHeader = req.headers.range;

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/webm',
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/webm',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// POST /api/rants/:id/analyze (re-trigger Gemini)
router.post('/:id/analyze', async (req, res) => {
  const db = getDb();
  const rant = db.prepare('SELECT * FROM rants WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!rant) return res.status(404).json({ error: 'Rant not found' });

  try {
    const analysis = await analyzeRant(rant.transcript);
    db.prepare(`
      UPDATE rants SET
        emotions = ?,
        trigger_keywords = ?,
        ai_summary = ?,
        sentiment_score = ?
      WHERE id = ?
    `).run(
      JSON.stringify(analysis.emotions),
      JSON.stringify(analysis.trigger_keywords),
      analysis.ai_summary,
      analysis.sentiment_score,
      rant.id
    );

    const updated = db.prepare('SELECT * FROM rants WHERE id = ?').get(rant.id);
    res.json(parseRant(updated));
  } catch (err) {
    console.error('Re-analyze error:', err);
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});

function parseRant(rant) {
  return {
    ...rant,
    emotions: rant.emotions ? JSON.parse(rant.emotions) : null,
    trigger_keywords: rant.trigger_keywords ? JSON.parse(rant.trigger_keywords) : null,
  };
}

module.exports = router;
