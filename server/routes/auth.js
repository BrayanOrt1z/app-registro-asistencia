import express from 'express';
import * as authController from '../controllers/authController.js';

const authRouter = express.Router();

// Definir rutas para el módulo de autenticación
authRouter.post('/login', authController.loginUser);

export default authRouter;

