import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Definir rutas para el módulo de autenticación
router.post('/login', authController.loginUser);

export default router;

