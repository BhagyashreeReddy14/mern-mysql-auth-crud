const { promisePool } = require('../config/db');

// ─── GET /api/items ──────────────────────────────────────────────────────────
const getItems = async (req, res, next) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/items/stats ────────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'active') AS active,
        SUM(status = 'pending') AS pending,
        SUM(status = 'completed') AS completed
       FROM items WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/items/:id ──────────────────────────────────────────────────────
const getItem = async (req, res, next) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/items ─────────────────────────────────────────────────────────
const createItem = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const validStatuses = ['active', 'pending', 'completed'];
    const itemStatus = validStatuses.includes(status) ? status : 'active';

    const [result] = await promisePool.query(
      'INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [req.user.id, title, description || null, itemStatus]
    );

    const [newItem] = await promisePool.query('SELECT * FROM items WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Item created', data: newItem[0] });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/items/:id ──────────────────────────────────────────────────────
const updateItem = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    // Ensure item belongs to this user
    const [existing] = await promisePool.query(
      'SELECT id FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const validStatuses = ['active', 'pending', 'completed'];

    await promisePool.query(
      `UPDATE items SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = CASE WHEN ? IN ('active','pending','completed') THEN ? ELSE status END
       WHERE id = ? AND user_id = ?`,
      [title || null, description || null, status, status, req.params.id, req.user.id]
    );

    const [updated] = await promisePool.query('SELECT * FROM items WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Item updated', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/items/:id ───────────────────────────────────────────────────
const deleteItem = async (req, res, next) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getItems, getStats, getItem, createItem, updateItem, deleteItem };
