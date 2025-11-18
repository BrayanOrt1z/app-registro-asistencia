import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;


export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            status: false, 
            message: 'No autenticado'
        }); // No autenticado()
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.status(401).json({
            status: false,
            message: 'Sesión expirada. Por favor, inicie sesión nuevamente.'
        });
    }

}

export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.rol)) {
            return res.status(403).json({
                status: false,
                message: 'No autorizado'
            });
        }
        next();
    }
}
