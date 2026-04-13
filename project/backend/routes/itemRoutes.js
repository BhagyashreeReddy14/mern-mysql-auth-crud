const express = require('express');
const router = express.Router();
const {
  getItems,
  getStats,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

// All item routes are protected
router.use(protect);

router.get('/stats', getStats);       // GET /api/items/stats — must come before /:id
router.get('/', getItems);            // GET /api/items
router.get('/:id', getItem);          // GET /api/items/:id
router.post('/', createItem);         // POST /api/items
router.put('/:id', updateItem);       // PUT /api/items/:id
router.delete('/:id', deleteItem);    // DELETE /api/items/:id

module.exports = router;
