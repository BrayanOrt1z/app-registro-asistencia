import express from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { generateQRToken, registerQR, registerAssisted } from '../controllers/attendanceController.js';

const router = express.Router();

// Generar código QR para registro de asistencia
router.get('/qr', verifyToken, checkRole(['admin-qr']), generateQRToken);

// Registro de asistencia por código QR
router.post('/register', verifyToken, registerQR);

// Registro de asistencia asistida
router.post('/assisted-register', verifyToken, checkRole(['admin', 'portero']), registerAssisted);

export default router;