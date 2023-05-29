import express from 'express';
import { registerUser, loginUser, googleSignIn } from '../controllers/userControllers';

const router = express.Router();

router.post('/', loginUser);
router.post('/register', registerUser);
router.post('/googlesignin', googleSignIn);

module.exports = router;