import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userModel } from './../models/userModel.js';
import responseUtil from '../utils/responses.js';

const { sendSuccess, sendError } = responseUtil;

export const loginUser = async (req, res) => {
    const {user, password} = req.body;

    if (!user || !password) {
        return sendError(res, 'Usuario y contraseña son requeridos', 400);
    }

    try {
        const foundUser = await userModel.findByUsuario(user);

        if (!foundUser) {
            return sendError(res, 'Usuario o contraseña incorrectos', 401);
        }

        const validPassword = await bcrypt.compare(password, foundUser.contrasenia);

        if (!validPassword) {
            return sendError(res, 'Usuario o contraseña incorrectos', 401);
        } 
            
        const token = jwt.sign(
            {id: foundUser.empleado_id, rol: foundUser.rol},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
            maxAge: 3600000
        });

        return sendSuccess(res, 'Inicio de sesión exitoso', {
            id: foundUser.empleado_id, 
            username: foundUser.usuario, 
            rol: foundUser.rol
        }, 200); 
        
    } catch (error){
        return sendError(res, 'Error del servidor', 500, error.message); 
    };
};

