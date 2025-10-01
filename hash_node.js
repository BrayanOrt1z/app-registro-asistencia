import bcrypt from 'bcrypt';

const miContraseña = 'contraseñaprueba123';

const hashContraseña = await bcrypt.hash(miContraseña, 10);

console.log('Contraseña original:', miContraseña);
console.log('Contraseña hasheada:', hashContraseña);