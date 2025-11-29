import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();

// Obtener el perfil del empleado autenticado
router.get('/', verifyToken, profileController.getProfile);

// Actualizar el perfil del empleado autenticado
router.put('/', verifyToken, profileController.updateProfile);

// Cambiar la contraseña del empleado autenticado
router.put('/password', verifyToken, profileController.changePassword);

export default router;