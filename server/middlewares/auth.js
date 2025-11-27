import jwt from 'jsonwebtoken';
import responseUtil from '../utils/responses.js';

const { sendError } = responseUtil;

const JWT_SECRET = process.env.JWT_SECRET;


export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return sendError(res, 'No autenticado', 401);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return sendError(res, 'Sesión expirada. Por favor, inicie sesión nuevamente.', 401);
    }
}

export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.rol)) {
            return sendError(res, 'No autorizado', 403);
        }
        next();
    }
}
