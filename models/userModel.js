import { pool } from '../db/connection.js';

export const userModel = {
    findByUsuario: async (usuario) => {
        const [rows] = await pool.query('SELECT * FROM empleados WHERE usuario = ?', [usuario]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    }
};