// Formulario de perfil
const profileForm = document.getElementById('profileForm');

// Campos READ-ONLY (no editables)
const nameInput = document.getElementById('nombre');
const lastNameInput = document.getElementById('apellido');
const codeInput = document.getElementById('codigo');
const roleInput = document.getElementById('rol');
const companyInput = document.getElementById('empresa');
const supervisorInput = document.getElementById('supervisor');

// Campos EDITABLES
const userInput = document.getElementById('usuario');
const emailInput = document.getElementById('email');

// Botones de perfil
const cancelProfileBtn = document.getElementById('cancelProfile');
const saveProfileBtn = document.getElementById('saveProfile');

// Formulario de contraseña
const passwordForm = document.getElementById('passwordForm');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Botones de contraseña
const cancelPasswordBtn = document.getElementById('cancelPassword');
const savePasswordBtn = document.getElementById('savePassword');

// Alertas
const alertModal = document.getElementById('alertModal');
const alertText = document.getElementById('alertText');
const closeAlert = document.getElementById('closeAlert');

let originalUserData = null;

function showAlert(message, type = 'error') {
    alertText.textContent = message;
    alertModal.className = `alert-modal ${type} active`;

    closeAlert.onclick = () => {
        alertModal.classList.remove('active');
    }

    alertModal.onclick = (e) => {
        if (e.target === alertModal) {
            alertModal.classList.remove('active');
        }
    }

    setTimeout(() => {
        alertModal.classList.remove('active');
    }, 5000)
}

async function init() {
    try {
        const response = await fetch('/api/profile/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            return window.location.href = '/pages/login.html';
        }

        const responseData = await response.json();

        const user = responseData.data;

        loadProfileData(user);
    } catch (error) {
        showAlert('Error al obtener el perfil', 'error');
        window.location.href = '/pages/login.html';
    }
}

function loadProfileData(user) {
    nameInput.value = user.nombre;
    lastNameInput.value = user.apellido;
    codeInput.value = user.cod_empleado;
    roleInput.value = formatRole(user.rol) ||  user.rol;
    companyInput.value = user.empresa;
    supervisorInput.value = user.supervisor || 'Sin supervisor';
    userInput.value = user.usuario;
    emailInput.value = user.correo;

    originalUserData = {
        user: user.usuario,
        email: user.correo
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();

    const user = userInput.value.trim();
    const email = emailInput.value.trim();

    if (!user || !email) {
        return showAlert('Por favor, complete todos los campos.', 'error');
    }

    if (user === originalUserData.user && email === originalUserData.email) {
        return showAlert('No hay cambios para guardar.', 'info');
    }

    try {
        const response = await fetch('/api/profile/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ user, email })
        })

        if (response.ok) {
            showAlert('Perfil actualizado exitosamente.', 'success');
            originalUserData = {
                user: user,
                email: email
            }
        } else {
            showAlert('Error al actualizar el perfil.', 'error');
        }
    } catch (error) {
        showAlert('Error al actualizar el perfil.', 'error');
    }
}

function handleCancelProfile() {
    userInput.value = originalUserData.user;
    emailInput.value = originalUserData.email;
}

async function handlePasswordSubmit(e) {
    e.preventDefault();

    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
        return showAlert('Por favor, complete todos los campos.', 'error');
    }

    if (newPassword !== confirmPassword) {
        return showAlert('Las contrasenas no coinciden.', 'error');
    }

    if (newPassword.length < 6) {
        return showAlert('La contrasena debe tener al menos 6 caracteres.', 'error');
    }

    try {
        const response = await fetch('/api/profile/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (response.ok) {
            showAlert('Contrasena actualizada exitosamente.', 'success');
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        } else{
            showAlert('Error al actualizar la contrasena.', 'error');
        }
    } catch (error) {
        showAlert('Error al actualizar la contrasena.', 'error');
    }
}

function handleCancelPassword() {
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
}

profileForm.addEventListener('submit', handleProfileSubmit);
cancelProfileBtn.addEventListener('click', handleCancelProfile);

passwordForm.addEventListener('submit', handlePasswordSubmit);
cancelPasswordBtn.addEventListener('click', handleCancelPassword);

document.addEventListener('DOMContentLoaded', init);