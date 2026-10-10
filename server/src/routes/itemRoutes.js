const express = require('express');
const router = express.Router();

const {
  createItem, getItems, getItemById, updateItem, deleteItem,
} = require('../controllers/itemController');

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validationMiddleware');
const { createItemValidator, updateItemValidator } = require('../validators/itemValidators');

// All item routes require authentication
router.use(authMiddleware);

router.get('/', getItems);
router.post('/', upload.single('photo'), createItemValidator, validate, createItem);
router.get('/:id', getItemById);
router.put('/:id', upload.single('photo'), updateItemValidator, validate, updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
