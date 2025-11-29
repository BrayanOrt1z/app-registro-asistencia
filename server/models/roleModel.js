import { pool } from '../config/database.js';

export const roleModel = {
    findById: async (id) => {
        try {
            const [rows] = await pool.query('SELECT rol_id, nombre_rol FROM roles WHERE rol_id = ?', [id]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al buscar el rol por ID:', error);
            throw error;
        }
        
    },

    findIdByName: async (name) => {
        try {
            const [rows] = await pool.query('SELECT rol_id FROM roles WHERE nombre_rol = ?', [name]);
            
            return rows.length > 0 ? rows[0].rol_id : null;
        } catch (error) {
            console.error('Error al buscar el rol por nombre:', error);
            throw error;
        }
    },

    findAll: async () => {
        try {
            const [rows] = await pool.query('SELECT rol_id, nombre_rol FROM roles ORDER BY nombre_rol');
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los roles:', error);
            throw error;
        }
        
    }
}
