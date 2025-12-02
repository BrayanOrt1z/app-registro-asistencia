import { pool } from './../config/database.js';

export const userModel = {
    findByUser: async (user) => {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    e.empleado_id,
                    e.nombre,
                    e.apellido,
                    e.correo,
                    e.usuario,
                    e.contrasenia,
                    e.cod_empleado,
                    e.activo,
                    e.metodo_registro,
                    r.rol_id,
                    r.nombre_rol AS rol,
                    emp.empresa_id,
                    emp.nombre_empresa AS empresa,
                    emp.nit,
                    emp.activo AS empresa_activa
                FROM empleados e
                JOIN roles r ON e.rol_id = r.rol_id
                JOIN empresas emp ON e.empresa_id = emp.empresa_id
                WHERE e.usuario = ? AND e.activo = true
            `, [user]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al buscar el usuario:', error);
            throw error;
        }
    },

    findById: async (id) => {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    e.empleado_id,
                    e.nombre,
                    e.apellido,
                    e.correo,
                    e.usuario,
                    e.cod_empleado,
                    e.activo,
                    e.metodo_registro,
                    r.rol_id,
                    r.nombre_rol AS rol,
                    emp.empresa_id,
                    emp.nombre_empresa AS empresa,
                    emp.nit,
                    emp.activo AS empresa_activa,
                    CONCAT(s.nombre, ' ', s.apellido) AS supervisor
                FROM empleados e
                JOIN roles r ON e.rol_id = r.rol_id
                JOIN empresas emp ON e.empresa_id = emp.empresa_id
                LEFT JOIN empleados s ON e.supervisor_id = s.empleado_id
                WHERE e.empleado_id = ?
            `, [id]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al buscar el usuario por ID:', error);
            throw error;
        }
    },

    findAll: async () => {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    e.empleado_id, 
                    e.nombre, 
                    e.apellido, 
                    e.correo, 
                    e.usuario, 
                    e.cod_empleado, 
                    e.activo,
                    r.nombre_rol, 
                    emp.nombre_empresa, 
                    CONCAT(s.nombre, ' ', s.apellido) AS supervisor_nombre
                FROM empleados e
                JOIN roles r ON e.rol_id = r.rol_id
                JOIN empresas emp ON e.empresa_id = emp.empresa_id
                LEFT JOIN empleados s ON e.supervisor_id = s.empleado_id
                ORDER BY e.empleado_id DESC
                `);

            return rows;
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            throw error;
        }
    },

    getSupervisorsByCompanyId: async (companyId) => {
        try {
            const [rows] = await pool.query(`
                SELECT
                    e.empleado_id,
                    e.cod_empleado,
                    CONCAT(e.nombre, ' ', e.apellido) AS nombre_completo
                FROM empleados e
                JOIN roles r ON e.rol_id = r.rol_id
                WHERE r.nombre_rol = 'supervisor'
                    AND e.empresa_id = ?
                    AND e.activo = true
                ORDER BY nombre_completo`, [companyId]);

            return rows;
        } catch (error) {
            console.error('Error al obtener supervisores por ID de empresa:', error);
            throw error;
        }
    },

    createNewUser: async (userData) => {
        try {
            const { nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, activo } = userData;

            const [result] = await pool.query(`
                INSERT INTO empleados 
                (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, activo]
            );
            
            return result.insertId;
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            throw error;
        }
    },

    updateUser: async (id, updateUserData) => {
        try {
            const {nombre, apellido, correo, usuario, cod_empleado, rol_id, empresa_id, supervisor_id, activo} = updateUserData;

            const [result] = await pool.query(`
                UPDATE empleados SET 
                    nombre = ?, 
                    apellido = ?, 
                    correo = ?, 
                    usuario = ?,
                    cod_empleado = ?, 
                    rol_id = ?, 
                    empresa_id = ?, 
                    supervisor_id = ?, 
                    activo = ?
                WHERE empleado_id = ?`,
                [nombre, apellido, correo, usuario, cod_empleado, rol_id, empresa_id, supervisor_id, activo, id]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al actualizar el empleado:', error);
            throw error;
        }
    },

    updateProfileUser: async (id, updateUserData) => {
        try {
            const {usuario, correo} = updateUserData;
            const [result] = await pool.query(`
                UPDATE empleados SET 
                    usuario = ?, 
                    correo = ?
                WHERE empleado_id = ?`,
                [usuario, correo, id]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al actualizar el perfil del empleado:', error);
            throw error;
        }
    },

    updatePasswordProfile: async (id, newHashedPassword) => {
        try {
            const [result] = await pool.query(`
                UPDATE empleados SET 
                    contrasenia = ?
                WHERE empleado_id = ?`,
                [newHashedPassword, id]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al actualizar la contraseña del empleado:', error);
            throw error;
        }
    },

    reactivateUser: async (id) => {
        try {
            const [result] = await pool.query(`
                UPDATE empleados SET activo = true WHERE empleado_id = ?`, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al reactivar el empleado:', error);
            throw error;
        }
    },

    deactivateUser: async (id) => {
        try {
            const [result] = await pool.query(`
                UPDATE empleados SET activo = false WHERE empleado_id = ?`, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al desactivar el empleado:', error);
            throw error;
        }
    }
};