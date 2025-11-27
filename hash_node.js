import bcrypt from 'bcrypt';

// Contraseña John Doe
//const miContraseña = 'contraseñaprueba123';

// Contraseña Generador QR
//const miContraseña = '12345';

// Contraseña Portero Prueba
const miContraseña = 'portero123';

const hashContraseña = await bcrypt.hash(miContraseña, 10);

console.log('Contraseña original:', miContraseña);
console.log('Contraseña hasheada:', hashContraseña);