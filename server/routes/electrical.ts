import express from 'express';
import db from '../db';

const router = express.Router();

// Get all topics
router.get('/topics', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM electrical_topics ORDER BY updated_at DESC').all() as any[];
    const topics = rows.map(row => ({
      id: row.id,
      title: row.title,
      overview: row.overview || '',
      sections: JSON.parse(row.sections || '{}'),
      customQA: JSON.parse(row.custom_qa || '[]')
    }));
    res.json(topics);
  } catch (error: any) {
    console.error("Failed to fetch electrical topics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Save or update a topic
router.post('/topics', (req, res) => {
  const { id, title, overview, sections, customQA } = req.body;
  
  try {
    db.prepare(`
      INSERT INTO electrical_topics (id, title, overview, sections, custom_qa, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        overview = excluded.overview,
        sections = excluded.sections,
        custom_qa = excluded.custom_qa,
        updated_at = CURRENT_TIMESTAMP
    `).run(id, title, overview, JSON.stringify(sections), JSON.stringify(customQA));
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save electrical topic:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a topic
router.delete('/topics/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM electrical_topics WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete electrical topic:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
