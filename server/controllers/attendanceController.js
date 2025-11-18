import jwt from 'jsonwebtoken';
import { attendanceModel } from '../models/attendanceModel.js';

export const generateQRToken = async (req, res) => {
    try {
        const qrToken = jwt.sign(
            {purpose: 'qr_access', time_checked: Date.now()}, process.env.QR_SECRET, {expiresIn: '15s'}
        )

        return res.status(200).json({data: qrToken});
    } catch (error) {
        console.error('Error al generar el token QR:', error);
        return res.status(500).json({message: 'Error del servidor al generar el token QR'});
    }
};

export const registerQR = async (req, res) => {
    const {qrToken} = req.body;
    const employeeId = req.user.id;

    if(!qrToken) {
        return res.status(400).json({message: "El token QR es obligatorio para el registro."});
    }

    try {
        jwt.verify(qrToken, process.env.QR_SECRET);

        const lastMovement = await attendanceModel.getLastMovement(employeeId);
        let newMovementType;

        if (lastMovement && lastMovement.tipo_movimiento === 'ENTRADA') {
            newMovementType = 'SALIDA';
        } else {
            newMovementType = 'ENTRADA'
        }

        await attendanceModel.insertAttendance(employeeId, newMovementType);        

        return res.status(200).json({message: "Asistencia registrada exitosamente"});
    } catch (error) {
        console.error('Fallo en la verificación del QR:', error.name);
        return res.status(401).json({ 
            message: "Acceso Denegado: El código QR es inválido o ha expirado.",
            details: error.message 
        });
    }
}


