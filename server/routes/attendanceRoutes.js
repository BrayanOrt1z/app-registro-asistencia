import express from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { generateQRToken, registerQR } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/generate', verifyToken, checkRole(['admin-qr']), generateQRToken);

router.post('/register-attendance', verifyToken, registerQR);

export default router;