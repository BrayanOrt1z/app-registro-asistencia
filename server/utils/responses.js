/**
 * Utilidades para respuestas HTTP estandarizadas
 */

/**
 * Envía una respuesta exitosa
 * @param {Object} res - Objeto response de Express
 * @param {String} message - Mensaje descriptivo del éxito
 * @param {Object|Array} data - Datos a retornar (opcional)
 * @param {Number} statusCode - Código HTTP (default 200)
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message
    };

// Solo se agrega data si no es null
    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error
 * @param {Object} res - Objeto response de Express
 * @param {String} message - Mensaje descriptivo del error
 * @param {Number} statusCode - Código HTTP (default 500)
 * @param {Object} details - Detalles adicionales del error (opcional)
 */
const sendError = (res, message, statusCode = 500, details = null) => {
    const response = {
        success: false,
        message
    };

    // En desarrollo, incluir detalles del error
    if (details && process.env.NODE_ENV === 'development') {
        response.details = details;
    }

    return res.status(statusCode).json(response);
};

export default {
    sendSuccess,
    sendError
};