import { pool } from './../config/database.js';

export const userModel = {
    findByUsuario: async (user) => {
        const [rows] = await pool.query('SELECT e.*, r.nombre_rol AS rol, emp.nombre_empresa AS empresa, emp.nit, emp.activo AS empresa_activa FROM empleados e JOIN roles r ON e.rol_id = r.rol_id JOIN empresas emp ON e.empresa_id = emp.empresa_id WHERE e.usuario = ?', [user]);
        
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT e.*, r.nombre_rol AS rol, emp.nombre_empresa AS empresa, emp.nit, emp.activo AS empresa_activa FROM empleados e JOIN roles r ON e.rol_id = r.rol_id JOIN empresas emp ON e.empresa_id = emp.empresa_id WHERE e.empleado_id = ?', [id]);
        
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    }
};

