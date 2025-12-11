// Funciones de utilidad para formatear datos

/**
 * Formatea el nombre del rol para mostrarlo al usuario
 * @param {string} rol - Rol desde la base de datos
 * @returns {string} - Rol formateado
 */
function formatRole(role) {
    const roleMap = {
        'admin': 'Administrador',
        'admin-qr': 'Administrador QR',
        'portero': 'Portero',
        'empleado': 'Empleado',
        'supervisor': 'Supervisor'
    };
    
    return roleMap[role] || role;
}

/**
 * Formatea el tipo de movimiento para mostrarlo al usuario
 * @param {string} tipo - Tipo de movimiento (ENTRADA/SALIDA)
 * @returns {string} - Tipo formateado
 */
function formatMovementType(typeMovement) {
    if (!typeMovement) return '';
    
    // Capitalizar primera letra, resto minúsculas
    return typeMovement.charAt(0).toUpperCase() + typeMovement.slice(1).toLowerCase();
}

