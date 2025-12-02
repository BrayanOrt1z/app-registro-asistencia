import bcrypt from 'bcrypt';
import { userModel } from '../models/userModel.js';
import responseUtil from '../utils/responses.js';

const { sendSuccess, sendError } = responseUtil;
const SALT_ROUNDS = 10;

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return sendError(res, 'Usuario no encontrado', 404);
        }

        delete user.contrasenia;
        return sendSuccess(res, 'Perfil obtenido exitosamente', user);
    } catch (error) {
        return sendError(res, 'Error al obtener el perfil', 500);
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { user, email } = req.body;

        if (!user || !email) {
            return sendError(res, 'Usuario y correo son obligatorios', 400);
        }

        const currentUser = await userModel.findById(userId);

        if (!currentUser) {
            return sendError(res, 'Usuario no encontrado', 404);
        }

        if (user !== currentUser.usuario) {
            const existingUser = await userModel.findByUser(user);
            if (existingUser) {
                return sendError(res, 'El nombre de usuario ya está en uso', 409);
            }
        }

        const updatedData = {
            usuario: user,
            correo: email
        };

        const updated = await userModel.updateProfileUser(userId, updatedData);
        if (updated) {
            return sendSuccess(res, 'Perfil actualizado exitosamente', updated);
        } else {
            return sendError(res, 'Error al actualizar el perfil', 500);
            }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'El correo electrónico ya está registrado', 409);
        }

        return sendError(res, 'Error interno al actualizar el perfil', 500);
    }
}

export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const userLogin = req.user.username;

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendError(res, 'Las contraseñas actual y nueva son obligatorias', 400);
        }

        const currentUser = await userModel.findByUser(userLogin);

        if (!currentUser) {
            return sendError(res, 'Usuario no encontrado', 404);
        }

        const validPassword = await bcrypt.compare(currentPassword, currentUser.contrasenia);

        if (!validPassword) {
            return sendError(res, 'La contraseña actual es incorrecta', 401);
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        const passwordUpdated = await userModel.updatePasswordProfile(userId, hashedPassword);

        if (passwordUpdated) {
            return sendSuccess(res, 'Contraseña actualizada exitosamente');
        } else {
            return sendError(res, 'Error al actualizar la contraseña', 500);
        }
    } catch (error) {
        return sendError(res, 'Error interno al cambiar la contraseña', 500);
    }
}