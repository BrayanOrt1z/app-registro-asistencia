# 🎯 Sistema C.A.R. - Control de Asistencia y Registros

Sistema web profesional para gestión integral de asistencia de empleados en entornos multi-empresa. Soporta registro dual (QR automático + Manual asistido) con firma digital, autenticación JWT, y gestión de roles por empresa.

> **Desarrollado como MVP funcional** demostrando arquitectura escalable, seguridad robusta, y diseño de base de datos compleja.

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **JWT con httpOnly cookies** - Tokens seguros que previenen XSS
- **Bcrypt para contraseñas** - Hash con salt rounds configurables
- **Sistema de roles granular** - Admin, Supervisor, Empleado, Portero, Admin-QR
- **Middleware de autorización** - Control de acceso por endpoint
- **Logout con invalidación de sesión** - Limpieza de cookies segura

### 👥 Gestión de Empleados (Admin)
- **CRUD completo de empleados** - Crear, listar, actualizar, desactivar
- **Soft delete** - Empleados se desactivan sin perder historial
- **Validación de duplicados** - Usuario, email, código de empleado únicos
- **Gestión multi-empresa** - Asignar empleados a diferentes empresas
- **Jerarquías de supervisión** - Empleados con supervisores asignados
- **Dropdowns dinámicos** - Supervisores filtrados por empresa

### 📋 Auto-gestión de Perfil (Empleados)
- **Ver perfil propio** - Información personal y laboral
- **Actualizar datos limitados** - Email, usuario
- **Cambio de contraseña seguro** - Requiere contraseña actual
- **Campos protegidos** - Rol, empresa, nombre, apellido, código no modificables por empleado

### 📥 Registro de Asistencia Dual

**Método 1: QR Automático**
- Generación de tokens QR temporales (1 min)
- Validación de tokens únicos y fecha
- Detección automática de tipo de movimiento (entrada/salida)
- Registro sin intervención humana

**Método 2: Manual Asistido (Portero)**
- Búsqueda de empleado por portero
- Captura de firma digital
- Registro manual con actor identificado
- Trazabilidad completa (quién registró a quién)

### 🏢 Gestión Multi-empresa
- Soporte para múltiples empresas en mismo sistema
- Empleados asociados a empresa específica
- Supervisores filtrados por empresa
- Catálogos de empresas y roles

### 🗄️ Arquitectura de Base de Datos
- **Diseño normalizado** - Relaciones con foreign keys
- **Auto-referencias** - Jerarquías de supervisión
- **IDs intencionales** - Trazabilidad de actores en registros
- **Campos de auditoría** - Timestamps, activo/inactivo, método de registro

---

## 🛠️ Stack Tecnológico

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Base de Datos:** MySQL 8.0
- **Autenticación:** JSON Web Tokens (JWT)
- **Seguridad:** bcryptjs para hashing
- **Arquitectura:** MVC (Model-View-Controller)
- **Validaciones:** Express middleware personalizado

### Frontend (En Desarrollo)
- HTML5, CSS3 (Tailwind CSS)
- JavaScript ES6+ (Vanilla)
- Fetch API para consumo de backend
- Diseño responsive

---

## 📊 Estructura de la Base de Datos
```
empleados (usuarios del sistema)
├── empleado_id (PK)
├── nombre, apellido, correo
├── usuario, contrasenia (bcrypt hash)
├── cod_empleado (unique)
├── rol_id (FK → roles)
├── empresa_id (FK → empresas)
├── supervisor_id (FK → empleados) [auto-referencial]
├── metodo_registro (QR | MANUAL)
└── activo (soft delete)

registros_asistencia
├── registro_id (PK)
├── empleado_registrado_id (FK → empleados) [quién marcó]
├── registrado_por_id (FK → empleados) [quién lo registró]
├── tipo_movimiento (ENTRADA | SALIDA)
├── fecha_hora (timestamp)
├── firma_digital (base64, opcional)
└── metodo_registro (QR | MANUAL)

empresas
├── empresa_id (PK)
├── nombre_empresa
├── nit
└── activo

roles
├── rol_id (PK)
└── nombre_rol (admin | supervisor | empleado | portero | admin-qr)

sesiones
├── sesion_id (PK)
├── usuario_id (FK → empleados)
├── token (JWT)
├── fecha_creacion
└── fecha_expiracion
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js v18 o superior
- MySQL 8.0
- Git

### Pasos de Instalación
```bash
# 1. Clonar repositorio
git clone https://github.com/BrayanOrt1z/app-registro-asistencia.git
cd sistema-car

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Crear base de datos
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# 5. Iniciar servidor
npm start
# o para desarrollo con nodemon:
npm run dev
```

### Variables de Entorno (.env)
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=sistema_car

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Cookies
COOKIE_MAX_AGE=86400000
```

---

## 🔐 Documentación de API

### 📌 Autenticación

#### `POST /api/auth/login`
**Descripción:** Autenticación de usuarios (admin y empleados)

**Request Body:**
```json
{
  "user": "carlos_admin",
  "password": "12345"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "empleado_id": 1,
      "nombre": "Carlos",
      "rol": "admin",
      "empresa": "METROSINU S.A."
    }
  }
}
```

#### `POST /api/auth/logout`
**Descripción:** Cierre de sesión (invalida token)

**Response (200):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

### 📌 Asistencia

#### `GET /api/attendance/qr-token`
**Descripción:** Generar token temporal para QR (válido 1 min)

**Headers:** `Cookie: token=<jwt>`

**Response (200):**
```json
{
  "success": true,
  "message": "Token QR generado",
  "data": {
    "qrToken": "abc123def456...",
    "expiresAt": "2025-12-02T15:35:00Z"
  }
}
```

#### `POST /api/attendance/register`
**Descripción:** Registro automático con QR

**Request Body:**
```json
{
  "qrToken": "abc123def456..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Asistencia registrada: ENTRADA",
  "data": {
    "registro_id": 123,
    "tipo_movimiento": "ENTRADA",
    "fecha_hora": "2025-12-02T08:30:00Z"
  }
}
```

#### `POST /api/attendance/register-assisted`
**Descripción:** Registro manual con firma digital (Portero)

**Headers:** `Cookie: token=<jwt>` (rol: portero)

**Request Body:**
```json
{
  "employeeId": 5,
  "digitalSignature": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Asistencia registrada: SALIDA con firma digital",
  "data": {
    "registro_id": 124,
    "empleado_registrado_id": 5,
    "registrado_por_id": 4,
    "tipo_movimiento": "SALIDA"
  }
}
```

---

### 📌 Gestión de Empleados (Admin Only)

#### `GET /api/employees`
**Descripción:** Listar todos los empleados

**Headers:** `Cookie: token=<jwt>` (rol: admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Lista de empleados obtenida exitosamente",
  "data": [
    {
      "empleado_id": 5,
      "nombre": "Juan",
      "apellido": "Gómez",
      "correo": "juan@empresa.com",
      "usuario": "juan.empleado",
      "cod_empleado": "EMP-001",
      "activo": true,
      "nombre_rol": "empleado",
      "nombre_empresa": "METROSINU S.A.",
      "supervisor_nombre": "Ana Martínez"
    }
  ]
}
```

#### `GET /api/employees/:id`
**Descripción:** Obtener empleado por ID

**Response (200):**
```json
{
  "success": true,
  "message": "Empleado obtenido exitosamente",
  "data": {
    "empleado_id": 5,
    "nombre": "Juan",
    "rol": "empleado",
    "empresa": "METROSINU S.A.",
    "supervisor": "Ana Martínez"
  }
}
```

#### `POST /api/employees`
**Descripción:** Crear nuevo empleado

**Request Body:**
```json
{
  "name": "Pedro",
  "lastName": "López",
  "email": "pedro@empresa.com",
  "user": "pedro.lopez",
  "password": "temporal123",
  "employeeCode": "EMP-002",
  "roleName": "empleado",
  "companyName": "METROSINU S.A.",
  "supervisorId": 4,
  "active": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 6
  }
}
```

#### `PUT /api/employees/:id`
**Descripción:** Actualizar empleado (sin contraseña)

**Request Body:**
```json
{
  "name": "Pedro Carlos",
  "roleName": "supervisor"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Empleado actualizado correctamente"
}
```

#### `DELETE /api/employees/:id`
**Descripción:** Desactivar empleado (soft delete)

**Response (200):**
```json
{
  "success": true,
  "message": "Empleado desactivado correctamente"
}
```

---

### 📌 Catálogos (Admin)

#### `GET /api/employees/supervisors?companyId=1`
**Descripción:** Obtener supervisores de una empresa específica

**Response (200):**
```json
{
  "success": true,
  "message": "Lista de supervisores obtenida exitosamente",
  "data": [
    {
      "empleado_id": 4,
      "cod_empleado": "SUP-001",
      "nombre_completo": "Ana Martínez"
    }
  ]
}
```

#### `GET /api/roles`
**Descripción:** Listar todos los roles disponibles

#### `GET /api/companies`
**Descripción:** Listar todas las empresas activas

---

### 📌 Perfil (Self-Service)

#### `GET /api/profile`
**Descripción:** Ver perfil del empleado autenticado

**Headers:** `Cookie: token=<jwt>`

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil obtenido",
  "data": {
    "empleado_id": 5,
    "nombre": "Juan",
    "apellido": "Gómez",
    "correo": "juan@empresa.com",
    "usuario": "juan.empleado",
    "rol": "empleado",
    "empresa": "METROSINU S.A."
  }
}
```

#### `PUT /api/profile`
**Descripción:** Actualizar perfil propio (campos limitados)

**Request Body:**
```json
{
  "name": "Juan Carlos",
  "email": "juancarlos@gmail.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": { /* datos actualizados */ }
}
```

#### `PUT /api/profile/password`
**Descripción:** Cambiar contraseña propia

**Request Body:**
```json
{
  "currentPassword": "temporal123",
  "newPassword": "miPasswordSeguro123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

## 🎓 Decisiones Técnicas y Aprendizajes

### 🔒 Seguridad
- **JWT en httpOnly cookies** en lugar de localStorage para prevenir XSS
- **Bcrypt con 10 salt rounds** para hash seguro de contraseñas
- **Middleware de roles** para autorización granular por endpoint
- **Validación de contraseña actual** en cambio de contraseña (previene cambios no autorizados si sesión queda abierta)
- **Soft delete** en lugar de eliminación física (mantiene integridad referencial)

### 🏗️ Arquitectura
- **Separación de responsabilidades:** Admin CRUD vs Self-Service Profile
- **Sin dependencias circulares:** Models solo importan pool, nunca controllers
- **Try-catch en todos los models:** Previene crashes del servidor
- **Queries con columnas explícitas:** No usar `SELECT *` (seguridad y performance)
- **Respuestas estandarizadas:** Utility para success/error consistente

### 📊 Base de Datos
- **Auto-referencia en empleados:** Jerarquía de supervisión (supervisor_id → empleado_id)
- **IDs intencionales en registros:** `empleado_registrado_id` vs `registrado_por_id` para trazabilidad completa
- **Validación en nivel BD:** UNIQUE constraints, FOREIGN KEYS, NOT NULL donde corresponde
- **Diseño normalizado:** Evita duplicación de datos

### 🔄 Lógica de Negocio
- **Detección automática de movimiento:** El sistema determina si es ENTRADA o SALIDA según último registro
- **Tokens QR temporales:** Válidos solo 1 minuto (previene reuso)
- **Firma digital opcional:** Solo en registro asistido, almacenada como base64
- **Método de registro trazable:** Cada registro indica QR o MANUAL

---

## 🚧 Roadmap - Fases Futuras

### Fase II: Cálculos y Nómina (Planeada)
- [ ] Consulta de registros por empleado y rango de fechas
- [ ] Cálculo automático de horas trabajadas por día
- [ ] Identificación de horas extras (>8h diarias, >48h semanales)
- [ ] Cálculo de recargos nocturnos (Según legislación colombiana)
- [ ] Validación de jornadas máximas legales

### Fase III: Reportes y Analytics (Planeada)
- [ ] Dashboard de métricas para supervisores
- [ ] Reportes de asistencia por período
- [ ] Exportación a Excel/PDF
- [ ] Gráficos de puntualidad y ausentismo
- [ ] Notificaciones automáticas de inconsistencias

### Mejoras Técnicas (Backlog)
- [ ] Tests unitarios con Jest
- [ ] Tests de integración con Supertest
- [ ] Documentación OpenAPI/Swagger
- [ ] Rate limiting con express-rate-limit
- [ ] Validación de inputs con Joi
- [ ] Logging estructurado con Winston
- [ ] Deploy en Railway/Render
- [ ] CI/CD con GitHub Actions

---

## 🤝 Contribuciones

Este es un proyecto personal de portfolio, pero sugerencias y feedback son bienvenidos.

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.

---

## 👨‍💻 Autor

**Brayan** - Electronic Engineer transitioning to Backend Development

- 📧 Email: brayanortizg7@gmail.com
- 🐙 GitHub: https://github.com/BrayanOrt1z
- 📍 Montería, Colombia

---

## 🎯 Contexto del Proyecto

Este sistema fue desarrollado como MVP funcional para demostrar competencias en:
- Diseño de arquitecturas backend escalables
- Implementación de autenticación y autorización robustas
- Modelado de bases de datos relacionales complejas
- Desarrollo de APIs RESTful profesionales
- Aplicación de mejores prácticas de seguridad

**Estado:** MVP Funcional - Backend completo, Frontend en desarrollo  
**Última actualización:** Diciembre 2025
