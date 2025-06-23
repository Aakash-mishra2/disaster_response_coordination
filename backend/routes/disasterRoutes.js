import express from 'express';
import {
  createDisaster,
  getDisasters,
  updateDisaster,
  deleteDisaster
} from '../controllers/disasterController.js';

const router = express.Router();

router.post('/', createDisaster);
router.get('/', getDisasters);
router.put('/:id', updateDisaster);
router.delete('/:id', deleteDisaster);

export default router;
