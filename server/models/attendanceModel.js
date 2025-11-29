import { pool } from '../config/database.js';

export const attendanceModel = {
    getLastMovement: async(employeeId) => {
        try {
            const [rows] = await pool.query('SELECT tipo_movimiento FROM registros_asistencia WHERE empleado_registrado_id = ? ORDER BY fecha_hora DESC LIMIT 1', [employeeId]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener el último movimiento:', error);
            throw error;
        }
    },

    insertAttendance: async(employeeId, movementType, employeePorterId = null, digitalSignature = null, method = 'QR') => {
        try {
            const actorId = employeePorterId ?? employeeId;

            const [result] = await pool.query('INSERT INTO registros_asistencia (empleado_registrado_id, tipo_movimiento, fecha_hora, registrado_por_id, firma_digital, metodo_registro) VALUES (?, ?, now(), ?, ?, ?)', [employeeId, movementType, actorId, digitalSignature, method]);
            return result;
        } catch (error) {
            console.error('Error al insertar el registro de asistencia:', error);
            throw error;
        }
    }
};