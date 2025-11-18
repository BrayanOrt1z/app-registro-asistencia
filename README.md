# Sistema C.A.R. - Control de Asistencia y Registro

Sistema web para gestión integral de asistencia de empleados en entornos multi-empresa. Permite registro de entradas/salidas, cálculo automático de horas laborales, horas extras y recargos nocturnos según normativa laboral colombiana.

## 🎯 Características Principales

### Implementadas
- ✅ **Autenticación JWT** - Sistema seguro de login con tokens
- ✅ **Control de Roles** - Administradores, supervisores y empleados con permisos diferenciados
- ✅ **Gestión Multi-empresa** - Soporte para múltiples empresas en un mismo edificio
- ✅ **Registro de Asistencia** - Marcación de entrada/salida con validaciones
- ✅ **Cálculo Automático** - Horas trabajadas, extras y recargos nocturnos
- ✅ **Relaciones Complejas** - Base de datos normalizada con foreign keys y auto-referencias

### En Desarrollo
- 🚧 Reportes de asistencia por período
- 🚧 Dashboard de métricas para supervisores
- 🚧 Exportación a Excel
- 🚧 Notificaciones automáticas

## 🛠️ Tech Stack

**Backend:**
- Node.js v18+
- Express.js
- MySQL 8.0
- JWT para autenticación
- bcrypt para hash de contraseñas

**Frontend:**
- HTML5, CSS3, JavaScript vanilla
- Diseño responsive

## 📊 Modelo de Datos

El sistema maneja 5 entidades principales:
- **Empresas** - Compañías que operan en el edificio
- **Usuarios** - Empleados con roles específicos
- **Supervisores** - Jerarquía de supervisión (auto-referencial)
- **Registros** - Entradas y salidas diarias
- **Sesiones** - Control de tokens activos

## 🚀 Instalación

```bash
# Clonar repositorio
git clone [tu-repo-url]
cd sistema-car

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de BD

# Ejecutar migraciones
npm run migrate

# Iniciar servidor
npm run dev
```

## 📝 Variables de Entorno

```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=sistema_car
JWT_SECRET=tu_secreto_jwt
```

## 🔐 API Endpoints (Ejemplo)

```
POST   /api/auth/login          - Autenticación
POST   /api/auth/register       - Registro de usuarios
GET    /api/users               - Lista de empleados (Admin)
POST   /api/attendance/checkin  - Marcar entrada
POST   /api/attendance/checkout - Marcar salida
GET    /api/reports/:userId     - Reporte individual
```

## 🎓 Aprendizajes Clave

Este proyecto me permitió aprender y aplicar:
- Diseño de bases de datos relacionales complejas
- Autenticación y autorización con JWT
- Middleware de Express para control de acceso
- Manejo de relaciones auto-referenciales (supervisores)
- Cálculo de horas según legislación laboral colombiana
- Validaciones de negocio en el backend

## 📈 Próximos Pasos

- [ ] Implementar testing con Jest
- [ ] Añadir documentación OpenAPI/Swagger
- [ ] Migrar frontend a React
- [ ] Deploy en Railway/Render
- [ ] CI/CD con GitHub Actions

## 👨‍💻 Autor

Desarrollado por Brayan - [LinkedIn](tu-linkedin) | [GitHub](tu-github)

---

**Estado del Proyecto:** En desarrollo activo  
**Última actualización:** Noviembre 2025
