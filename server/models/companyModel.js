import { pool } from '../config/database.js';

export const companyModel = {
    findById: async (id) => {
        try {
            const [rows] = await pool.query('SELECT empresa_id, nombre_empresa, nit, activo FROM empresas WHERE empresa_id = ?', [id]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al buscar la empresa por ID:', error);
            throw error;
        }
    },

    findIdByName: async (name) => {
        try {
            const [rows] = await pool.query('SELECT empresa_id FROM empresas WHERE nombre_empresa = ?', [name]);

            return rows.length > 0 ? rows[0].empresa_id : null;
        } catch (error) {
            console.error('Error al buscar la empresa por nombre:', error);
            throw error;
        }
    },

    findAll: async () => {
        try {
            const [rows] = await pool.query('SELECT empresa_id, nombre_empresa, nit, activo FROM empresas WHERE activo = true ORDER BY nombre_empresa');
            return rows;
        } catch (error) {
            console.error('Error al obtener todas las empresas:', error);
            throw error;
        }
    }
}