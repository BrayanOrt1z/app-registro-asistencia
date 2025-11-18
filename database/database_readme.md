# 📊 Base de Datos - Sistema C.A.R.

**Sistema de Control de Asistencia y Reportes**

---

## 📁 Estructura de Archivos

```
database/
├── install.sql              # Script de instalación completa
├── modelo_er.png            # Diagrama entidad-relación
├── README.md                # Este archivo
└── tu_archivo_desarrollo.sql # Tu historial de desarrollo (opcional)
```

---

## 🚀 Instalación Rápida

### Requisitos
- MySQL 8.0 o superior
- Usuario con permisos para crear bases de datos

### Instalación desde Terminal/CMD

```bash
# Opción 1: Con prompt de contraseña
mysql -u root -p < database/install.sql

# Opción 2: Sin prompt (especificando contraseña)
mysql -u root -ptu_password < database/install.sql
```

### Instalación desde MySQL Workbench

1. Abre MySQL Workbench
2. Conecta a tu servidor
3. File → Open SQL Script → `database/install.sql`
4. Ejecuta el script (⚡ icono de rayo o Ctrl+Shift+Enter)

---

## 📊 Estructura de la Base de Datos

### Tablas Principales

| Tabla | Descripción | Registros Iniciales |
|-------|-------------|---------------------|
| `roles` | Catálogo de roles del sistema | 4 roles |
| `empresas` | Empresas que comparten el edificio | 2 empresas |
| `empleados` | Usuarios del sistema | 10 empleados |
| `registros_asistencia` | Entradas y salidas | 0 (vacía) |
| `solicitudes_ajuste` | Solicitudes de corrección | 0 (vacía) |

---

## 🔐 Credenciales de Prueba

**Contraseña para todos los usuarios:** `12345`

### METROSINU S.A.

| Usuario | Contraseña | Rol | Método Registro |
|---------|-----------|-----|-----------------|
| `carlos_admin` | `12345` | Admin | QR |
| `ana_supervisor` | `12345` | Supervisor | QR |
| `luis_portero` | `12345` | Portero | QR |
| `juan_empleado` | `12345` | Empleado | QR |
| `pedro_empleado` | `12345` | Empleado | MANUAL |

### MONTERIA EXPRESS S.A.

| Usuario | Contraseña | Rol | Método Registro |
|---------|-----------|-----|-----------------|
| `maria_admin` | `12345` | Admin | QR |
| `sofia_supervisor` | `12345` | Supervisor | QR |
| `roberto_portero` | `12345` | Portero | QR |
| `diego_empleado` | `12345` | Empleado | QR |
| `laura_empleado` | `12345` | Empleado | MANUAL |

---

## 🏗️ Jerarquía Organizacional

### METROSINU S.A.
```
Carlos Rodríguez (Admin)
└── Ana Martínez (Supervisor)
    ├── Luis Gómez (Portero)
    ├── Juan Pérez (Empleado - QR)
    └── Pedro Ramírez (Empleado - MANUAL)
```

### MONTERIA EXPRESS S.A.
```
María González (Admin)
└── Sofía López (Supervisor)
    ├── Roberto Silva (Portero)
    ├── Diego Torres (Empleado - QR)
    └── Laura Vargas (Empleado - MANUAL)
```

---

## 📋 Relaciones entre Tablas

```
roles (1) ──────────── (N) empleados
empresas (1) ────────── (N) empleados
empleados (1) ───┬──── (N) registros_asistencia
                 │         ├── empleado_registrado_id
                 │         └── registrado_por_id
                 │
                 ├──── (N) solicitudes_ajuste
                 │         ├── empleado_id
                 │         └── aprobado_por_id
                 │
                 └──── (N) empleados (auto-referencia)
                           └── supervisor_id
```

---

## 🔍 Queries Útiles

### Ver todos los empleados con su jerarquía
```sql
SELECT 
    e.empleado_id,
    e.nombre,
    e.apellido,
    r.nombre_rol AS rol,
    emp.nombre_empresa AS empresa,
    e.metodo_registro,
    CONCAT(s.nombre, ' ', s.apellido) AS supervisor
FROM empleados e
JOIN roles r ON e.rol_id = r.rol_id
JOIN empresas emp ON e.empresa_id = emp.empresa_id
LEFT JOIN empleados s ON e.supervisor_id = s.empleado_id
ORDER BY e.empresa_id, e.rol_id;
```

### Contar empleados por empresa y rol
```sql
SELECT 
    emp.nombre_empresa,
    r.nombre_rol,
    COUNT(*) as cantidad
FROM empleados e
JOIN empresas emp ON e.empresa_id = emp.empresa_id
JOIN roles r ON e.rol_id = r.rol_id
GROUP BY emp.nombre_empresa, r.nombre_rol
ORDER BY emp.nombre_empresa, r.nombre_rol;
```

### Ver empleados de un supervisor específico
```sql
SELECT 
    e.nombre,
    e.apellido,
    r.nombre_rol
FROM empleados e
JOIN roles r ON e.rol_id = r.rol_id
WHERE e.supervisor_id = 3; -- ID de Ana Martínez
```

---

## 🔧 Mantenimiento

### Resetear la base de datos
```bash
# Vuelve a ejecutar el script completo
mysql -u root -p < database/install.sql
```

### Backup de la base de datos
```bash
# Crear backup
mysqldump -u root -p asistencia_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root -p asistencia_db < backup_20251030.sql
```

### Agregar nuevo empleado
```sql
SET @password_hash = '$2b$10$jxU/PpcWVG5DTnY.oRSYjOx5az4S9dkQgUDEPI2yUsaYHZGA1ftXK';

INSERT INTO empleados (nombre, apellido, correo, usuario, contrasenia, cod_empleado, rol_id, empresa_id, supervisor_id, metodo_registro, activo)
VALUES ('Nuevo', 'Empleado', 'nuevo@empresa.com', 'nuevo_user', @password_hash, 'COD-999', 3, 1, 3, 'QR', TRUE);
```

---

## ⚠️ Notas Importantes

1. **Contraseñas:** Todas las contraseñas de prueba están hasheadas con bcrypt (salt rounds = 10)
2. **Integridad Referencial:** Las foreign keys están configuradas con:
   - `ON DELETE RESTRICT` en la mayoría (evita borrado accidental)
   - `ON DELETE SET NULL` en supervisor_id (permite borrar supervisores)
3. **Charset:** Todas las tablas usan `utf8mb4` para soporte completo de caracteres Unicode
4. **Índices:** Las columnas frecuentemente consultadas tienen índices para mejor rendimiento

---

## 📝 Changelog

### Version 1.0 (Octubre 2025)
- Creación inicial de la base de datos
- Implementación de sistema multi-empresa
- Jerarquía de supervisores
- Métodos de registro QR y MANUAL
- Sistema de solicitudes de ajuste

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisa el diagrama ER en `database/modelo_er.png`
2. Consulta la documentación en `docs/FLUJOS_SISTEMA.md`
3. Verifica los logs de MySQL para errores específicos

---

**Fecha de creación:** Octubre 2025  
**Versión:** 1.0  
**Estado:** Producción