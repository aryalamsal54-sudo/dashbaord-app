import express from 'express';
import pool from '../db';

const router = express.Router();

// Get all topics
router.get('/topics', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM electrical_topics ORDER BY updated_at DESC');
    const topics = rows.map(row => ({
      id: row.id,
      title: row.title,
      overview: row.overview || '',
      sections: typeof row.sections === 'string' ? JSON.parse(row.sections) : row.sections,
      customQA: typeof row.custom_qa === 'string' ? JSON.parse(row.custom_qa) : row.custom_qa
    }));
    res.json(topics);
  } catch (error: any) {
    console.error("Failed to fetch electrical topics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Save or update a topic
router.post('/topics', async (req, res) => {
  const { id, title, overview, sections, customQA } = req.body;
  
  try {
    await pool.query(`
      INSERT INTO electrical_topics (id, title, overview, sections, custom_qa, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = EXCLUDED.title,
        overview = EXCLUDED.overview,
        sections = EXCLUDED.sections,
        custom_qa = EXCLUDED.custom_qa,
        updated_at = CURRENT_TIMESTAMP
    `, [id, title, overview, JSON.stringify(sections), JSON.stringify(customQA)]);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save electrical topic:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a topic
router.delete('/topics/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM electrical_topics WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete electrical topic:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
