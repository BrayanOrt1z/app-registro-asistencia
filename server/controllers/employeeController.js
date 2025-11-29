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
            active: active
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
    return res.status(501).json({ message: "Falta implementar: Listar empleados" });
};

export const getEmployeeById = async (req, res) => {
    return res.status(501).json({ message: "Falta implementar: Detalle empleado" });
};

export const updateEmployee = async (req, res) => {
    return res.status(501).json({ message: "Falta implementar: Actualizar empleado" });
};

export const deleteEmployee = async (req, res) => {
    return res.status(501).json({ message: "Falta implementar: Eliminar empleado" });
};