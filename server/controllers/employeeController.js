import bcrypt from 'bcrypt';
import { userModel } from '../models/userModel.js';
import { companyModel } from '../models/companyModel.js';
import { roleModel } from '../models/roleModel.js';
import responseUtil from '../utils/responses.js';

const SALT_ROUNDS = 10;
const { sendSuccess, sendError } = responseUtil;

export const createEmployee = async (req, res) => {
    try {
        const {name, lastName, email, user, password, employeeCode, roleName, companyName, supervisorId, active} = req.body;

        if (!name || !lastName || !user || !password || !employeeCode || !roleName || !companyName) {
            return sendError(res, 'Faltan datos obligatorios', 400);
        }

        const roleId = await roleModel.findIdByName(roleName);
        const companyId = await companyModel.findIdByName(companyName);

        const existingUser = await userModel.findByUser(user);
        if (existingUser) {
            return sendError(res, 'El usuario ya existe', 409);
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newEmployee = {
            nombre: name,
            apellido: lastName,
            correo: email,
            usuario: user,
            contrasenia: hashedPassword,
            cod_empleado: employeeCode,
            rol_id: roleId,
            empresa_id: companyId,
            supervisor_id: supervisorId,
            activo: active
        };

        const employeeCreated = await userModel.createNewUser(newEmployee);

        return sendSuccess(res, 'Usuario creado exitosamente', {id: employeeCreated}, 201);
        
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('cod_empleado')) {
                return sendError(res, 'El código de empleado ya existe', 409);
            }
            
            if (error.sqlMessage.includes('usuario')) {
                return sendError(res, 'El nombre de usuario ya está en uso', 409);
            }

            if (error.sqlMessage.includes('correo')) {
                return sendError(res, 'El correo electrónico ya está en uso', 409);
            }

            return sendError(res, 'Ya existe un registro con estos datos', 409);
        }

        if (error.message && error.message.includes('no existe')) {
            return sendError(res, error.message, 400);
        }

        return sendError(res, 'Error interno del servidor al crear el empleado', 500);
    }
}

export const getSupervisorsByCompany = async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!companyId) {
            return sendError(res, 'El ID de la empresa es obligatorio', 400);
        }

        const supervisors = await userModel.getSupervisorsByCompanyId(companyId);
        return sendSuccess(res, 'Lista de supervisores obtenida exitosamente', supervisors);
    } catch (error) {
        sendError(res, 'Error al obtener los supervisores', 500, error.message);
    }
}

export const getRoles = async (req, res) => {
    try {
        const roles = await roleModel.findAll();
        return sendSuccess(res, 'Lista de roles obtenida exitosamente', roles);
    } catch (error) {
        sendError(res, 'Error al obtener los roles', 500, error.message);
    }
}

export const getCompanies = async (req, res) => {
    try {
        const companies = await companyModel.findAll();
        return sendSuccess(res, 'Lista de empresas obtenida exitosamente', companies);
    } catch (error) {
        sendError(res, 'Error al obtener las empresas', 500, error.message);
    }
}

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await userModel.findAll();
        return sendSuccess(res, 'Lista de empleados obtenida exitosamente', employees);
    } catch (error) {
        return sendError(res, 'Error al obtener los empleados', 500, error.message);
    }
};

export const getEmployeesByCompany = async (req, res) => {
    try {
        const { companyId } = req.query;

        if (!companyId) {
            return sendError(res, 'El ID de la empresa es obligatorio', 400);
        }

        const employees = await userModel.getEmployeesByCompany(companyId);
        return sendSuccess(res, 'Lista de empleados obtenida exitosamente', employees);
    } catch (error) {
        return sendError(res, 'Error al obtener los empleados', 500, error.message);
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await userModel.findById(id);
        if (!employee) {
            return sendError(res, 'Empleado no encontrado', 404);
        }
        return sendSuccess(res, 'Empleado obtenido exitosamente', employee);
    } catch (error) {
        return sendError(res, 'Error al obtener el empleado', 500, error.message);
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const {name, lastName, email, user, employeeCode, roleName, companyName, supervisorId, active} = req.body;
        const { id } = req.params;

        const currentEmployee = await userModel.findById(id);
        if (!currentEmployee) {
            return sendError(res, 'Empleado no encontrado', 404);
        }

        const roleId = roleName ? await roleModel.findIdByName(roleName) : null;
        const companyId = companyName ? await companyModel.findIdByName(companyName) : null;

        if (user !== currentEmployee.usuario) {
            const existingUser = await userModel.findByUser(user);
            if (existingUser) {
                return sendError(res, 'El usuario ya existe', 409);
            }
        }

        const updatedEmployee = {
            nombre: name || currentEmployee.nombre,
            apellido: lastName || currentEmployee.apellido,
            correo: email || currentEmployee.correo,
            usuario: user || currentEmployee.usuario,
            cod_empleado: employeeCode || currentEmployee.cod_empleado,
            rol_id: roleId || currentEmployee.rol_id,
            empresa_id: companyId || currentEmployee.empresa_id,
            supervisor_id: supervisorId || currentEmployee.supervisor_id,
            activo: active !== undefined ? active : currentEmployee.activo
        };

        const resultUpdate = await userModel.updateUser(id, updatedEmployee);
        
        if (resultUpdate) {
            return sendSuccess(res, 'Empleado actualizado correctamente', 200);
        } else {
            sendError(res, 'No se pudo actualizar: Empleado no encontrado', 404);
        }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('cod_empleado')) {
                return sendError(res, 'No se pudo actualizar: El código de empleado ya existe', 409);
            }

            if (error.sqlMessage.includes('usuario')) {
                return sendError(res, 'No se pudo actualizar: El nombre de usuario ya está en uso', 409);
            }

            if (error.sqlMessage.includes('correo')) {
                return sendError(res, 'No se pudo actualizar: El correo electrónico ya está en uso', 409);
            }

            return sendError(res, 'No se pudo actualizar: Ya existe un registro con estos datos', 409);
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            sendError(res, 'No se pudo actualizar: Rol, Empresa o Supervisor no existen', 400);
        }

        return sendError(res, 'Error interno del servidor al actualizar el empleado', 500, error.message);
    }
}

export const reactivateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const resultReactivated = await userModel.reactivateUser(id);
        if (resultReactivated) {
            return sendSuccess(res, 'Empleado reactivado correctamente', 200);
        } else {
            return sendError(res, 'Empleado no encontrado', 404);
        }
    } catch (error) {
        sendError(res, 'Error al reactivar el empleado', 500, error.message);
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const resultDeleted = await userModel.deactivateUser(id);
        if (resultDeleted) {
            return sendSuccess(res, 'Empleado desactivado correctamente', 200);
        } else {
            return sendError(res, 'Empleado no encontrado', 404);
        }
    } catch (error) {
        return sendError(res, 'Error al eliminar el empleado', 500, error.message);
    }
};