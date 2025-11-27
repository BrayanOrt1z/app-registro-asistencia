import jwt from 'jsonwebtoken';
import { attendanceModel } from '../models/attendanceModel.js';
import responseUtil from '../utils/responses.js';

const { sendSuccess, sendError } = responseUtil;

export const generateQRToken = async (req, res) => {
    try {
        const qrToken = jwt.sign(
            {purpose: 'qr_access', time_checked: Date.now()}, process.env.QR_SECRET, {expiresIn: '60s'}
        )

        return sendSuccess(res, 'Token QR generado exitosamente', {qrToken}, 200);
    } catch (error) {
        return sendError(res, 'Error del servidor al generar el token QR', 500, error.message);
    }
};

export const registerQR = async (req, res) => {
    const {qrToken} = req.body;
    const employeeId = req.user.id;

    if(!qrToken) {
        return sendError(res, 'El token QR es obligatorio para el registro.', 400);
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

        await attendanceModel.insertAttendance(employeeId, newMovementType, null, null, 'QR');        

        return sendSuccess(res, 'Asistencia registrada exitosamente', {
            tipo: newMovementType,
            metodo: 'QR'
        }, 200);
    } catch (error) {
        return sendError(res, 'Acceso Denegado: El código QR es inválido o ha expirado.', 401, error.message);
    }
}

export const registerAssisted = async (req, resp) => {
    const { employeeId, digitalSignature } = req.body;
    const porterId = req.user.id;

    if (!employeeId || !digitalSignature) {
        return sendError(resp, 'El ID del empleado y la firma digital son obligatorios para el registro asistido.', 400);
    }

    try {
        const lastMovement = await attendanceModel.getLastMovement(employeeId);
        let newMovementType;

        if (lastMovement && lastMovement.tipo_movimiento === 'ENTRADA') {
            newMovementType = 'SALIDA';
        } else {
            newMovementType = 'ENTRADA'
        }

        await attendanceModel.insertAttendance(employeeId, newMovementType, porterId, digitalSignature, 'MANUAL');

        return sendSuccess(resp, 'Asistencia registrada exitosamente', {
            tipo: newMovementType,
            metodo: 'MANUAL'
        }, 200);
    }
    catch (error) {
        return sendError(resp, 'Error del servidor al registrar la asistencia asistida.', 500, error.message);
    }
}
