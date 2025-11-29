import express from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import * as employeeController from '../controllers/employeeController.js';

const router = express.Router();

// RUTAS DE BÚSQUEDA DE EMPLEADOS

// Obtener lista de empresas
router.get('/lookups/companies', verifyToken, checkRole(['admin']), employeeController.getCompanies);

// Obtener lista de supervisores por empresa
router.get('/lookups/supervisors', verifyToken, checkRole(['admin']), employeeController.getSupervisorsByCompany);

// Obtener lista de roles
router.get('/lookups/roles', verifyToken, checkRole(['admin']), employeeController.getRoles);

// RUTAS CRUD EMPLEADOS

// Crear un nuevo empleado
router.post('/', verifyToken, checkRole(['admin']), employeeController.createEmployee);

// Obtener todos los empleados
router.get('/', verifyToken, checkRole(['admin']), employeeController.getAllEmployees);

// Obtener detalles de un empleado
router.get('/:id', verifyToken, checkRole(['admin']), employeeController.getEmployeeById);

// Actualizar un empleado
router.put('/:id', verifyToken, checkRole(['admin']), employeeController.updateEmployee);

// Eliminar un empleado
router.delete('/:id', verifyToken, checkRole(['admin']), employeeController.deleteEmployee);


export default router;