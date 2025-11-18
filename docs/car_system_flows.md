# 📄 Documentación de Flujos del Sistema C.A.R.

**Sistema de Control de Asistencia y Reportes**  
**Fecha:** Octubre 2025  
**Versión:** 1.0

---

## 🎯 Propósito de este Documento

Este documento describe cómo funciona cada proceso principal del sistema, qué validaciones se deben realizar y qué reglas de negocio se deben cumplir para evitar fraude y mantener la integridad de los datos.

---

## 📊 Arquitectura General del Sistema

```
┌─────────────────┐
│    Cliente      │ (Navegador: HTML, CSS, JavaScript)
│   (Frontend)    │ - Muestra interfaz al usuario
│                 │ - Captura datos (formularios, QR, firma)
└────────┬────────┘
         │ HTTP/HTTPS (Peticiones REST API)
         │ Envía: JSON con datos
         │ Recibe: JSON con respuestas
┌────────▼────────┐
│    Servidor     │ (Node.js + Express)
│   (Backend)     │ - Valida datos
│                 │ - Aplica reglas de negocio
│                 │ - Gestiona autenticación (JWT)
└────────┬────────┘
         │ SQL (Consultas a la base de datos)
         │
┌────────▼────────┐
│     MySQL       │ (Base de Datos)
│   (Storage)     │ - Almacena datos permanentemente
│                 │ - Garantiza integridad referencial
└─────────────────┘
```

---

## 📋 Flujos Principales del Sistema

---

## 🔐 FLUJO 1: Login (Autenticación)

### **Descripción:**
El usuario ingresa sus credenciales para acceder al sistema. El backend valida y genera un token de sesión.

### **Pasos del Flujo:**

```
1. Usuario abre la aplicación
   ↓
2. Ve formulario de login (usuario y contraseña)
   ↓
3. Ingresa credenciales y presiona "Iniciar Sesión"
   ↓
4. Frontend envía petición a: POST /api/auth/login
   Datos: { usuario: "jhon_doe", contrasenia: "12345" }
   ↓
5. Backend valida:
   - ¿Existe el usuario en la tabla empleados?
   - ¿La contraseña coincide? (comparando hash con bcrypt)
   - ¿El empleado está activo? (activo = true)
   ↓
6. Si es válido:
   - Backend genera un JWT (JSON Web Token)
   - Token contiene: { empleado_id, rol, nombre }
   ↓
7. Backend responde:
   { 
     success: true, 
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     usuario: {
       id: 1,
       nombre: "Jhon Doe",
       rol: "EMPLEADO"
     }
   }
   ↓
8. Frontend guarda el token en localStorage
   ↓
9. Frontend redirige al dashboard
```

### **Datos necesarios:**
- **Entrada:** `usuario` (string), `contrasenia` (string)
- **Salida:** `token` (JWT), `usuario` (objeto con id, nombre, rol)

### **Validaciones en Backend:**
- ✅ Usuario existe en la base de datos
- ✅ Contraseña es correcta (bcrypt.compare)
- ✅ Empleado está activo (activo = true)

### **Errores posibles:**
- `400` - Campos faltantes
- `401` - Credenciales incorrectas
- `403` - Empleado desactivado

### **Preguntas de Diseño:**
1. ¿Cuánto tiempo dura el token antes de expirar?
2. ¿Qué pasa si el usuario intenta 5 veces con contraseña incorrecta?
3. ¿Se puede estar logueado en múltiples dispositivos?

---

## 📱 FLUJO 2: Registro QR (Empleado se registra solo)

### **Descripción:**
El empleado escanea un código QR dinámico que se muestra en un kiosco/pantalla de la empresa para registrar su entrada o salida.

### **Pasos del Flujo:**

```
1. Empleado llega a la empresa
   ↓
2. Ve una pantalla/kiosco con un código QR
   (El QR cambia cada 30 segundos para evitar fraude)
   ↓
3. Abre la app en su teléfono (ya está logueado)
   ↓
4. Presiona "Escanear QR"
   ↓
5. Escanea el código QR con la cámara
   ↓
6. Frontend decodifica el QR y obtiene:
   - token_qr (único, temporal)
   - timestamp (cuándo se generó)
   ↓
7. Frontend pregunta: "¿Registrar ENTRADA o SALIDA?"
   ↓
8. Empleado selecciona (ej: ENTRADA)
   ↓
9. Frontend envía petición a: POST /api/registros/qr
   Datos: {
     token_qr: "abc123...",
     tipo_movimiento: "ENTRADA"
   }
   Headers: {
     Authorization: "Bearer <token_jwt>"
   }
   ↓
10. Backend valida:
    - ¿Token JWT válido? (middleware verifyToken)
    - ¿Token QR es válido y no expiró? (máx 30 seg)
    - ¿Empleado tiene metodo_registro = 'QR'?
    - ¿No hay registro duplicado reciente? (últimas 2 horas)
    - Si tipo = SALIDA: ¿Ya tiene entrada previa hoy?
    ↓
11. Backend inserta en registros_asistencia:
    {
      empleado_registrado_id: <del token JWT>,
      registrado_por_id: <mismo empleado>,
      tipo_movimiento: "ENTRADA",
      metodo_registro: "QR",
      fecha_hora: NOW(),
      firma_digital: NULL
    }
    ↓
12. Backend responde:
    { 
      success: true, 
      mensaje: "Entrada registrada a las 08:30 AM" 
    }
    ↓
13. Frontend muestra mensaje de confirmación
```

### **Datos necesarios:**
- **Entrada:** `token_qr` (string temporal), `tipo_movimiento` (ENTRADA/SALIDA)
- **Salida:** Confirmación del registro con hora

### **Validaciones en Backend:**
- ✅ Token JWT válido (usuario autenticado)
- ✅ Token QR válido y no expirado (< 30 segundos)
- ✅ Empleado tiene permiso para usar QR (`metodo_registro = 'QR'`)
- ✅ No hay registro duplicado en las últimas 2 horas
- ✅ Si es SALIDA, debe tener ENTRADA previa ese día

### **Validación Anti-Fraude:**
```javascript
// El QR solo funciona desde la ubicación de la empresa
// Se puede validar con:
// - IP permitida
// - Geolocalización (si la app lo permite)
// - El QR se genera en el servidor y expira rápido
```

### **Errores posibles:**
- `401` - No autenticado
- `403` - Empleado no tiene permiso para usar QR
- `400` - QR expirado o inválido
- `409` - Ya tiene un registro reciente

### **Preguntas de Diseño:**
1. ¿Cómo se genera el QR dinámico en el servidor?
2. ¿Qué pasa si intenta escanear el QR desde su casa?
3. ¿Cuánto tiempo debe pasar entre ENTRADA y SALIDA para que sea válido?

---

## 🖊️ FLUJO 3: Registro Manual (Portero registra a empleado)

### **Descripción:**
Para empleados sin smartphone, el Portero realiza el registro usando una tablet. El empleado debe firmar digitalmente como evidencia.

### **Pasos del Flujo:**

```
1. Empleado sin smartphone llega a la empresa
   ↓
2. Se acerca al Portero en la entrada
   ↓
3. Portero abre la app (ya logueado con rol = PORTERO)
   ↓
4. Va a la vista "Registro Asistido"
   ↓
5. Ve una lista de empleados con metodo_registro = 'MANUAL'
   ↓
6. Busca y selecciona al empleado (ej: "Juan Pérez")
   ↓
7. Selecciona tipo: ENTRADA o SALIDA
   ↓
8. Aparece un canvas (lienzo) para capturar firma
   ↓
9. Empleado firma en la tablet del Portero
   ↓
10. Frontend convierte la firma a Base64:
    "data:image/png;base64,iVBORw0KGg..."
    ↓
11. Frontend envía petición a: POST /api/registros/manual
    Datos: {
      empleado_registrado_id: 5,
      tipo_movimiento: "ENTRADA",
      firma_digital: "data:image/png;base64,..."
    }
    Headers: {
      Authorization: "Bearer <token_jwt_del_portero>"
    }
    ↓
12. Backend valida:
    - ¿Token JWT válido?
    - ¿Usuario autenticado es PORTERO?
    - ¿Empleado a registrar tiene metodo_registro = 'MANUAL'?
    - ⚠️ CRÍTICO: ¿Portero NO está registrando su propia entrada?
      (empleado_registrado_id != portero_id)
    - ¿Hay firma digital?
    - ¿No hay registro duplicado reciente?
    ↓
13. Backend inserta en registros_asistencia:
    {
      empleado_registrado_id: 5,
      registrado_por_id: <id del portero>,
      tipo_movimiento: "ENTRADA",
      metodo_registro: "MANUAL",
      fecha_hora: NOW(),
      firma_digital: "data:image/png;base64,..."
    }
    ↓
14. Backend responde:
    { 
      success: true, 
      mensaje: "Entrada de Juan Pérez registrada" 
    }
    ↓
15. Frontend muestra confirmación y limpia el canvas
```

### **Datos necesarios:**
- **Entrada:** `empleado_registrado_id` (int), `tipo_movimiento` (enum), `firma_digital` (base64)
- **Salida:** Confirmación del registro

### **Validaciones en Backend:**
- ✅ Portero autenticado (JWT válido, rol = PORTERO)
- ✅ Empleado objetivo tiene `metodo_registro = 'MANUAL'`
- ✅ **Portero NO puede registrarse a sí mismo** (anti-fraude)
- ✅ Firma digital está presente
- ✅ No hay registro duplicado reciente

### **Validación Anti-Fraude CRÍTICA:**
```javascript
// En el backend (controller)
if (portero_id === empleado_registrado_id) {
    return res.status(403).json({ 
        error: 'No puedes usar el registro asistido para tu propia entrada/salida' 
    });
}
```

### **Errores posibles:**
- `401` - No autenticado
- `403` - No es Portero o intenta auto-registrarse
- `400` - Falta firma digital o empleado no es MANUAL
- `409` - Registro duplicado

### **Preguntas de Diseño:**
1. ¿Qué pasa si el Portero intenta registrarse a sí mismo? (Se bloquea)
2. ¿Qué pasa si falla la captura de firma? (No se permite el registro)
3. ¿La firma se puede editar después? (No, es inmutable)

---

## 📝 FLUJO 4: Solicitud de Ajuste (Empleado olvidó registrarse)

### **Descripción:**
Un empleado olvidó marcar su entrada o salida. Crea una solicitud para que su supervisor la apruebe.

### **Pasos del Flujo:**

```
1. Empleado se da cuenta que olvidó marcar (ej: ayer a las 8 AM)
   ↓
2. Abre la app (ya logueado)
   ↓
3. Va a la sección "Solicitar Ajuste"
   ↓
4. Llena el formulario:
   - Fecha y hora que olvidó: "2025-10-28 08:00"
   - Tipo: ENTRADA o SALIDA
   - Justificación: "Olvidé mi teléfono en casa"
   ↓
5. Presiona "Enviar Solicitud"
   ↓
6. Frontend envía petición a: POST /api/solicitudes/crear
   Datos: {
     hora_solicitada: "2025-10-28 08:00:00",
     tipo_movimiento: "ENTRADA",
     justificacion: "Olvidé mi teléfono en casa"
   }
   Headers: {
     Authorization: "Bearer <token_jwt>"
   }
   ↓
7. Backend valida:
   - ¿Token JWT válido?
   - ¿Usuario es EMPLEADO? (no supervisor)
   - ¿Fecha NO es futura?
   - ¿Fecha no es muy antigua? (máx 7 días atrás)
   - ¿Ya existe solicitud para esa fecha/hora exacta?
   - ¿Justificación tiene al menos 10 caracteres?
   ↓
8. Backend inserta en solicitudes_ajuste:
   {
     empleado_id: <del token JWT>,
     hora_solicitada: "2025-10-28 08:00:00",
     tipo_movimiento: "ENTRADA",
     justificacion: "Olvidé mi teléfono en casa",
     estado: "PENDIENTE" (default),
     aprobado_por_id: NULL,
     fecha_solicitud: NOW(),
     fecha_respuesta: NULL
   }
   ↓
9. Backend responde:
   { 
     success: true, 
     mensaje: "Solicitud enviada a tu supervisor" 
   }
   ↓
10. Frontend muestra confirmación
```

### **Datos necesarios:**
- **Entrada:** `hora_solicitada` (datetime), `tipo_movimiento` (enum), `justificacion` (text)
- **Salida:** Confirmación de solicitud creada

### **Validaciones en Backend:**
- ✅ Empleado autenticado
- ✅ Rol = EMPLEADO (no supervisores ni admins)
- ✅ Fecha no es futura
- ✅ Fecha máximo 7 días en el pasado
- ✅ No existe solicitud duplicada
- ✅ Justificación mínimo 10 caracteres

### **Errores posibles:**
- `401` - No autenticado
- `403` - No es empleado
- `400` - Fecha inválida o justificación muy corta
- `409` - Ya existe solicitud para esa fecha/hora

### **Preguntas de Diseño:**
1. ¿Cuántos días atrás puede solicitar? (Recomendación: máx 7 días)
2. ¿Puede tener múltiples solicitudes pendientes? (Sí)
3. ¿Puede cancelar una solicitud pendiente? (Funcionalidad a implementar)

---

## ✅ FLUJO 5: Aprobación de Solicitud (Supervisor revisa)

### **Descripción:**
El supervisor revisa las solicitudes pendientes de sus empleados y decide aprobar o rechazar.

### **Pasos del Flujo:**

```
1. Supervisor abre la app (ya logueado con rol = SUPERVISOR)
   ↓
2. Va a la sección "Solicitudes Pendientes"
   ↓
3. Backend carga: GET /api/solicitudes/pendientes
   Headers: { Authorization: "Bearer <token_jwt>" }
   ↓
4. Backend valida:
   - ¿Token JWT válido?
   - ¿Usuario es SUPERVISOR o ADMIN?
   ↓
5. Backend consulta:
   SELECT * FROM solicitudes_ajuste sa
   JOIN empleados e ON sa.empleado_id = e.empleado_id
   WHERE sa.estado = 'PENDIENTE'
   AND e.supervisor_id = <id_del_supervisor>
   ↓
6. Backend responde con lista:
   [
     {
       solicitud_id: 1,
       empleado_nombre: "Juan Pérez",
       hora_solicitada: "2025-10-28 08:00",
       tipo_movimiento: "ENTRADA",
       justificacion: "Olvidé mi teléfono",
       fecha_solicitud: "2025-10-29 10:30"
     },
     ...
   ]
   ↓
7. Frontend muestra tabla con solicitudes
   ↓
8. Supervisor revisa justificación, fecha, hora
   ↓
9. Decide: Presiona botón "Aprobar" o "Rechazar"
   ↓
10. Frontend envía petición a:
    PUT /api/solicitudes/:id/aprobar
    o
    PUT /api/solicitudes/:id/rechazar
    ↓
11. Backend valida:
    - ¿Token JWT válido?
    - ¿Usuario es SUPERVISOR?
    - ¿La solicitud existe?
    - ¿Estado actual es PENDIENTE?
    - ¿El empleado pertenece a este supervisor?
      (empleado.supervisor_id == supervisor_id)
    ↓
12. Si APRUEBA:
    a) Backend inserta en registros_asistencia:
       {
         empleado_registrado_id: solicitud.empleado_id,
         registrado_por_id: supervisor_id,
         tipo_movimiento: solicitud.tipo_movimiento,
         metodo_registro: "MANUAL",
         fecha_hora: solicitud.hora_solicitada,
         firma_digital: NULL
       }
    
    b) Backend actualiza solicitudes_ajuste:
       UPDATE solicitudes_ajuste SET
         estado = 'APROBADO',
         aprobado_por_id = supervisor_id,
         fecha_respuesta = NOW()
       WHERE solicitud_id = :id
    ↓
13. Si RECHAZA:
    Backend actualiza solicitudes_ajuste:
    UPDATE solicitudes_ajuste SET
      estado = 'RECHAZADO',
      aprobado_por_id = supervisor_id,
      fecha_respuesta = NOW()
    WHERE solicitud_id = :id
    ↓
14. Backend responde:
    { 
      success: true, 
      mensaje: "Solicitud aprobada/rechazada" 
    }
    ↓
15. Frontend actualiza la lista (quita la solicitud procesada)
```

### **Datos necesarios:**
- **Entrada:** `solicitud_id` (int)
- **Salida:** Confirmación de aprobación/rechazo

### **Validaciones en Backend:**
- ✅ Supervisor autenticado
- ✅ Rol = SUPERVISOR o ADMIN
- ✅ Solicitud existe y estado = PENDIENTE
- ✅ Empleado pertenece al supervisor (`empleado.supervisor_id = supervisor_id`)
- ✅ No se puede aprobar/rechazar dos veces

### **Lógica de creación del registro (si aprueba):**
```javascript
// Valores del registro creado al aprobar
{
    empleado_registrado_id: solicitud.empleado_id,  // Quién fue registrado
    registrado_por_id: supervisor_id,               // Quién aprobó
    tipo_movimiento: solicitud.tipo_movimiento,     // ENTRADA o SALIDA
    metodo_registro: 'MANUAL',                      // Ajustes son manuales
    fecha_hora: solicitud.hora_solicitada,          // La hora que solicitó
    firma_digital: NULL                             // No hay firma en ajustes
}
```

### **Errores posibles:**
- `401` - No autenticado
- `403` - No es supervisor o no es su empleado
- `404` - Solicitud no existe
- `409` - Solicitud ya fue procesada

### **Preguntas de Diseño:**
1. ¿Puede un supervisor rechazar y luego cambiar a aprobar? (No, es final)
2. ¿Se notifica al empleado cuando se aprueba/rechaza? (Funcionalidad a implementar)
3. ¿Qué pasa si hay un error al crear el registro? (Usar transacciones SQL)

---

## 🛡️ Reglas de Negocio y Validaciones Anti-Fraude

### **Tabla de Reglas Críticas:**

| # | Regla | Dónde se valida | Razón | Prioridad |
|---|-------|-----------------|-------|-----------|
| 1 | Portero NO puede registrar su propia asistencia con método manual | Backend (controller) | Evita autoregistro fraudulento | 🔴 CRÍTICA |
| 2 | Empleado con `metodo_registro='QR'` no puede usar registro manual | Backend (controller) | Fuerza uso del método asignado | 🟡 ALTA |
| 3 | No registrar SALIDA sin ENTRADA previa ese día | Backend (controller) | Consistencia de datos | 🟡 ALTA |
| 4 | No solicitar ajustes de más de 7 días | Backend (controller) | Evita ajustes antiguos sin control | 🟡 ALTA |
| 5 | Solo supervisores aprueban solicitudes | Backend (middleware) | Control de autorización | 🔴 CRÍTICA |
| 6 | Supervisor solo aprueba solicitudes de sus empleados | Backend (controller) | Jerarquía organizacional | 🔴 CRÍTICA |
| 7 | QR válido solo por 30 segundos | Backend (validación) | Evita captura y reuso del QR | 🔴 CRÍTICA |
| 8 | No registros duplicados en menos de 2 horas | Backend (controller) | Evita errores de doble registro | 🟡 ALTA |
| 9 | JWT expira después de 8 horas | Backend (config) | Seguridad de sesión | 🟢 MEDIA |
| 10 | Contraseñas hasheadas con bcrypt (salt rounds >= 10) | Backend (auth) | Seguridad de credenciales | 🔴 CRÍTICA |

### **Validaciones por Capa:**

#### **Frontend (Experiencia de Usuario):**
- Validar formatos de entrada (campos requeridos)
- Mostrar mensajes de error claros
- Deshabilitar botones durante peticiones

#### **Backend (Seguridad y Lógica):**
- Validar TODOS los datos recibidos (nunca confiar en el cliente)
- Usar middlewares para autenticación/autorización
- Aplicar reglas de negocio complejas
- Usar transacciones SQL para operaciones críticas

#### **Base de Datos (Integridad):**
- Foreign keys para relaciones
- ENUM para valores fijos
- NOT NULL para campos obligatorios
- Índices para búsquedas frecuentes

---

## 🔐 Seguridad: Flujo de Autenticación con JWT

### **¿Cómo funciona JWT?**

```
1. Usuario hace login con credenciales
   ↓
2. Backend valida y crea un JWT:
   token = jwt.sign(
     { empleado_id: 1, rol: 'EMPLEADO' },  // Payload (datos)
     'SECRET_KEY',                          // Clave secreta
     { expiresIn: '8h' }                    // Expiración
   )
   ↓
3. Backend devuelve el token al cliente
   ↓
4. Cliente guarda el token (localStorage)
   ↓
5. En cada petición posterior, cliente envía:
   Headers: { Authorization: "Bearer <token>" }
   ↓
6. Backend verifica el token (middleware):
   - ¿Firma válida?
   - ¿No expiró?
   - ¿Payload correcto?
   ↓
7. Si válido: adjunta datos al request (req.user)
   ↓
8. Controller accede a: req.user.empleado_id, req.user.rol
```

### **Estructura del JWT:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.    ← Header (algoritmo)
eyJlbXBsZWFkb19pZCI6MSwicm9sIjoiRU1Q...  ← Payload (datos)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_...    ← Signature (firma)
```

**Importante:** El payload NO está encriptado, solo firmado. No incluir información sensible.

---

## 📊 Endpoints de API (Resumen)

### **Autenticación:**
```
POST   /api/auth/login          - Iniciar sesión
POST   /api/auth/register       - Crear cuenta (solo admin)
```

### **Registros de Asistencia:**
```
POST   /api/registros/qr        - Registro con QR
POST   /api/registros/manual    - Registro asistido por Portero
GET    /api/registros/:empleado_id - Ver registros de un empleado
GET    /api/registros/hoy       - Ver registros del día actual
```

### **Solicitudes de Ajuste:**
```
POST   /api/solicitudes/crear           - Empleado crea solicitud
GET    /api/solicitudes/pendientes      - Supervisor ve pendientes
PUT    /api/solicitudes/:id/aprobar     - Aprobar solicitud
PUT    /api/solicitudes/:id/rechazar    - Rechazar solicitud
GET    /api/solicitudes/mis-solicitudes - Empleado ve sus solicitudes
```

### **Empleados (Admin):**
```
GET    /api/empleados               - Listar todos
GET    /api/empleados/:id           - Ver uno específico
POST   /api/empleados               - Crear empleado
PUT    /api/empleados/:id           - Actualizar empleado
DELETE /api/empleados/:id           - Desactivar empleado
```

### **Reportes:**
```
GET    /api/reportes/mensual/:empleado_id  - Reporte mensual
GET    /api/reportes/equipo                - Supervisor ve su equipo
```

---

## 🎯 Próximos Pasos de Implementación

### **Orden Recomendado:**

1. ✅ **Base de Datos** (completado)
2. ⏭️ **Datos de Prueba** (insertar empleados y registros de ejemplo)
3. ⏭️ **Autenticación** (login, JWT, middlewares)
4. ⏭️ **Registro QR** (generación de QR, validación)
5. ⏭️ **Registro Manual** (con firma digital)
6. ⏭️ **Solicitudes** (crear, aprobar, rechazar)
7. ⏭️ **Frontend Dinámico** (dashboard por roles)
8. ⏭️ **Reportes** (consultas agregadas, exportación)

---

## 📝 Notas y Preguntas Pendientes

### **Mis Preguntas:**
_(Agrega aquí tus dudas mientras lees este documento)_

1. 
2. 
3. 

### **Cambios que quiero hacer:**
_(Anota aquí ideas de mejoras o cambios al flujo)_

1. 
2. 
3. 

### **Términos que debo investigar más:**
_(Lista conceptos que aún no entiendes completamente)_

1. JWT - ¿Cómo funciona exactamente?
2. Bcrypt - ¿Por qué es seguro?
3. Base64 - ¿Cómo se codifica una imagen?
4. Middleware - ¿Cómo se ejecutan en cadena?
5. Transacciones SQL - ¿Para qué sirven?

---

## 📚 Glosario

- **JWT (JSON Web Token):** Token de autenticación que contiene información del usuario de forma segura.
- **Endpoint:** URL específica en el servidor donde se puede enviar una petición.
- **Middleware:** Función que se ejecuta antes del controlador para validar o modificar la petición.
- **Hash:** Transformación irreversible de datos (ej: contraseña) para almacenarlos de forma segura.
- **Base64:** Codificación que convierte datos binarios (imágenes) en texto.
- **ENUM:** Tipo de dato que solo acepta valores predefinidos.
- **Foreign Key:** Relación entre tablas que garantiza integridad referencial.
- **Status Code:** Código numérico HTTP que indica el resultado de una petición (200, 400, 401, etc.).

---

**Fin del Documento**  
**Última actualización:** 2025-10-29