-- =====================================================
-- SCRIPT DE INSTALACIÓN COMPLETA
-- Sistema C.A.R. - Control de Asistencia y Reportes
-- =====================================================
-- Fecha: Octubre 2025
-- Descripción: Script para crear la base de datos completa
--              con estructura y datos de prueba
-- =====================================================

-- Eliminar base de datos si existe (PRECAUCIÓN en producción)
DROP DATABASE IF EXISTS asistencia_db;

-- Crear base de datos
CREATE DATABASE asistencia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asistencia_db;

-- =====================================================
-- 1. TABLAS MAESTRAS
-- =====================================================

-- Tabla de roles del sistema
CREATE TABLE roles (
    rol_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(20) NOT NULL,
    UNIQUE KEY uk_nombre_rol (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catálogo de roles del sistema';

-- Tabla de empresas
CREATE TABLE empresas (
    empresa_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(100) NOT NULL,
    nit VARCHAR(20) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_nit (nit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Empresas que comparten el edificio';

-- =====================================================
-- 2. TABLA EMPLEADOS
-- =====================================================

CREATE TABLE empleados (
    empleado_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NULL,
    usuario VARCHAR(30) UNIQUE NOT NULL,
    contrasenia VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
    cod_empleado VARCHAR(20) UNIQUE NOT NULL,
    rol_id INT UNSIGNED NOT NULL,
    empresa_id INT UNSIGNED NOT NULL,
    supervisor_id INT UNSIGNED NULL COMMENT 'Empleado que supervisa (jerarquía)',
    metodo_registro ENUM('QR', 'MANUAL') DEFAULT 'QR' COMMENT 'Método permitido de registro',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Empleado activo/inactivo',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_usuario (usuario),
    INDEX idx_empresa_rol (empresa_id, rol_id),
    INDEX idx_supervisor (supervisor_id),
    
    -- Foreign Keys
    CONSTRAINT fk_empleado_rol 
        FOREIGN KEY (rol_id) REFERENCES roles(rol_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    CONSTRAINT fk_empleado_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    CONSTRAINT fk_empleado_supervisor
        FOREIGN KEY (supervisor_id) REFERENCES empleados(empleado_id)
        ON DELETE SET NULL ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Empleados del sistema';

-- =====================================================
-- 3. TABLA REGISTROS DE ASISTENCIA
-- =====================================================

CREATE TABLE registros_asistencia (
    registro_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo_movimiento ENUM('ENTRADA', 'SALIDA') NOT NULL,
    metodo_registro ENUM('QR', 'MANUAL') NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    empleado_registrado_id INT UNSIGNED NOT NULL COMMENT 'Quién fue registrado',
    registrado_por_id INT UNSIGNED NOT NULL COMMENT 'Quién realizó el registro',
    firma_digital MEDIUMTEXT NULL COMMENT 'Firma en Base64 (solo registros manuales)',
    
    -- Índices
    INDEX idx_empleado_fecha (empleado_registrado_id, fecha_hora),
    INDEX idx_fecha_hora (fecha_hora),
    
    -- Foreign Keys
    CONSTRAINT fk_registro_empleado 
        FOREIGN KEY (empleado_registrado_id) REFERENCES empleados(empleado_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    CONSTRAINT fk_registro_portero
        FOREIGN KEY (registrado_por_id) REFERENCES empleados(empleado_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Registros de entrada y salida';

-- =====================================================
-- 4. TABLA SOLICITUDES DE AJUSTE
-- =====================================================

CREATE TABLE solicitudes_ajuste (
    solicitud_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT UNSIGNED NOT NULL COMMENT 'Quién solicita',
    tipo_movimiento ENUM('ENTRADA', 'SALIDA') NOT NULL,
    hora_solicitada DATETIME NOT NULL COMMENT 'Hora que olvidó registrar',
    justificacion TEXT NOT NULL,
    estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
    aprobado_por_id INT UNSIGNED NULL COMMENT 'Supervisor que aprobó/rechazó',
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME NULL,
    
    -- Índices
    INDEX idx_empleado_estado (empleado_id, estado),
    INDEX idx_estado (estado),
    INDEX idx_aprobador (aprobado_por_id),
    
    -- Foreign Keys
    CONSTRAINT fk_solicitud_empleado
        FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    CONSTRAINT fk_solicitud_supervisor
        FOREIGN KEY (aprobado_por_id) REFERENCES empleados(empleado_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Solicitudes de ajuste de horario';

-- =====================================================
-- 5. DATOS INICIALES - ROLES
-- =====================================================

INSERT INTO roles (nombre_rol) VALUES
('admin'),
('portero'),
('empleado'),
('supervisor');
('admin-qr');

-- =====================================================
-- 6. DATOS INICIALES - EMPRESAS
-- =====================================================

INSERT INTO empresas (nombre_empresa, nit) VALUES
('METROSINU S.A.', '812007584-7'),
('MONTERIA EXPRESS S.A.', '830514696-3');

-- =====================================================
-- 7. DATOS DE PRUEBA - EMPLEADOS
-- =====================================================

-- Hash de contraseña "12345" para todos los usuarios de prueba
-- Generado con bcrypt, salt rounds = 10
SET @password_hash = '$2b$10$jxU/PpcWVG5DTnY.oRSYjOx5az4S9dkQgUDEPI2yUsaYHZGA1ftXK';

-- -----------------------------------------------------
-- NIVEL 1: Administradores (sin supervisor)
-- -----------------------------------------------------

INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES 
('Carlos', 'Rodríguez', 'carlos.rodriguez@metrosinu.com', 'carlos_admin', @password_hash, 'MTRO-001', 1, 1, NULL, 'QR', TRUE),
('María', 'González', 'maria.gonzalez@monteriaexpress.com', 'maria_admin', @password_hash, 'MNTE-001', 1, 2, NULL, 'QR', TRUE);

-- -----------------------------------------------------
-- NIVEL 2: Supervisores (supervisados por admins)
-- -----------------------------------------------------

INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES 
('Ana', 'Martínez', 'ana.martinez@metrosinu.com', 'ana_supervisor', @password_hash, 'MTRO-002', 4, 1, 1, 'QR', TRUE),
('Sofía', 'López', 'sofia.lopez@monteriaexpress.com', 'sofia_supervisor', @password_hash, 'MNTE-002', 4, 2, 2, 'QR', TRUE);

-- -----------------------------------------------------
-- NIVEL 3: Empleados y Porteros (supervisados por supervisores)
-- -----------------------------------------------------

-- Empleados de METROSINU S.A. (supervisados por Ana, ID=3)
INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES 
('Juan', 'Pérez', 'juan.perez@metrosinu.com', 'juan_empleado', @password_hash, 'MTRO-003', 3, 1, 3, 'QR', TRUE),
('Pedro', 'Ramírez', 'pedro.ramirez@metrosinu.com', 'pedro_empleado', @password_hash, 'MTRO-004', 3, 1, 3, 'MANUAL', TRUE),
('Luis', 'Gómez', 'luis.gomez@metrosinu.com', 'luis_portero', @password_hash, 'MTRO-005', 2, 1, 3, 'QR', TRUE);

-- Empleados de MONTERIA EXPRESS S.A. (supervisados por Sofía, ID=4)
INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES 
('Diego', 'Torres', 'diego.torres@monteriaexpress.com', 'diego_empleado', @password_hash, 'MNTE-003', 3, 2, 4, 'QR', TRUE),
('Laura', 'Vargas', 'laura.vargas@monteriaexpress.com', 'laura_empleado', @password_hash, 'MNTE-004', 3, 2, 4, 'MANUAL', TRUE),
('Roberto', 'Silva', 'roberto.silva@monteriaexpress.com', 'roberto_portero', @password_hash, 'MNTE-005', 2, 2, 4, 'QR', TRUE);

-- =====================================================
-- 8. VERIFICACIÓN DE INSTALACIÓN
-- =====================================================

SELECT '======================================' AS '';
SELECT 'INSTALACIÓN COMPLETADA EXITOSAMENTE' AS STATUS;
SELECT '======================================' AS '';

-- Resumen de datos insertados
SELECT 'RESUMEN DE INSTALACIÓN:' AS '';
SELECT CONCAT('Total de Roles: ', COUNT(*)) AS info FROM roles;
SELECT CONCAT('Total de Empresas: ', COUNT(*)) AS info FROM empresas;
SELECT CONCAT('Total de Empleados: ', COUNT(*)) AS info FROM empleados;

-- Distribución por empresa y rol
SELECT '' AS '';
SELECT 'DISTRIBUCIÓN DE EMPLEADOS:' AS '';
SELECT 
    emp.nombre_empresa AS Empresa,
    r.nombre_rol AS Rol,
    COUNT(*) AS Cantidad
FROM empleados e
JOIN empresas emp ON e.empresa_id = emp.empresa_id
JOIN roles r ON e.rol_id = r.rol_id
GROUP BY emp.nombre_empresa, r.nombre_rol
ORDER BY emp.nombre_empresa, r.nombre_rol;

-- Credenciales de acceso
SELECT '' AS '';
SELECT 'CREDENCIALES DE PRUEBA:' AS '';
SELECT 'Todos los usuarios tienen contraseña: 12345' AS info;
SELECT '' AS '';
SELECT 
    usuario AS Usuario,
    r.nombre_rol AS Rol,
    emp.nombre_empresa AS Empresa
FROM empleados e
JOIN roles r ON e.rol_id = r.rol_id
JOIN empresas emp ON e.empresa_id = emp.empresa_id
ORDER BY e.empresa_id, r.rol_id;

SELECT '' AS '';
SELECT '======================================' AS '';
SELECT 'Sistema listo para usar' AS '';
SELECT '======================================' AS '';