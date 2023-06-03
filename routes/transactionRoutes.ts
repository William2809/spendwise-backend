import express from 'express';
import dotenv from  'dotenv';
import { addTransaction, getTransaction } from '../controllers/transactionController';
dotenv.config();
import { authUser } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/add', authUser, addTransaction);
router.get('/get', authUser, getTransaction);


module.exports = router;