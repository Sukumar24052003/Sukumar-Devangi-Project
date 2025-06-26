import express from 'express';
import { getAllUsers,deleteUser } from '../controllers/user.controller.js';
import User from '../models/user.model.js';
import { generateTokens } from '../utils/token.js';
const router = express.Router();

router.get('/', getAllUsers);
router.delete('/:id', deleteUser);


export default router;
