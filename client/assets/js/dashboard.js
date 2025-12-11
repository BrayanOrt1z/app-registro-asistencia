// Elementos para las vistas del dashboard
const loadingScreen = document.getElementById('loadingScreen');
const qrDisplayView = document.getElementById('qrDisplayView');
const dashboardView = document.getElementById('dashboardView');

// Elementos para datos del usuario
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');

// Elementos para las tarjetas
const cardScanQR = document.getElementById('cardScanQR');
const cardAssistedRegistration = document.getElementById('cardAssistedRegistration');
const cardManageEmployees = document.getElementById('cardManageEmployees');

// Elementos para botones del header
const profileBtn =document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Elementos para alertas
const alertModal = document.getElementById('alertModal');
const alertText = document.getElementById('alertText');
const closeAlert = document.getElementById('closeAlert');

// Elementos para modales
const scanModal = document.getElementById('scanModal');
const assistedModal = document.getElementById('assistedModal');

// Elementos para botones
const btnScanQR = document.getElementById('btnScanQR');
const btnOpenAssistedModal = document.getElementById('btnOpenAssistedModal');
const closeScanModal = document.getElementById('closeScanModal');
const closeAssistedModal = document.getElementById('closeAssistedModal');
const qrReaderDiv = document.getElementById('qrReader');

// Elementos para el QR display
const qrCanvas = document.getElementById('qrCanvas');
const countdown = document.getElementById('countdown');
const logoutQR = document.getElementById('logoutQR');

// Elementos para registro asistido
const filterCompany = document.getElementById('companySelect');
const employeeSelect = document.getElementById('employeeSelect');
const signaturaPadCanvas = document.getElementById('signaturePad');
const clearSignatureBtn = document.getElementById('clearSignature');
const submitAssistedBtn = document.getElementById('submitAssisted');
const cancelAssistedBtn = document.getElementById('cancelAssisted');

// Variables globales
let currentUser = null;
let qrInterval = null;
let html5QrCode = null;
let signaturePad = null;

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

async function init (){
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            credentials: 'include'
        })

        if (!response.ok) {
            return window.location.href = '/pages/login.html';
        }

        const responseData = await response.json();
        const user = responseData.data;

        currentUser = user;
        showViewByRole(currentUser)
    } catch (error) {
        showAlert('Error al obtener el perfil', 'error');
        return window.location.href = '/pages/login.html';
    }
}

function showViewByRole(user) {
    loadingScreen.style.display = 'none';

    if (user.rol === 'admin-qr') {
        dashboardView.style.display = 'none';
        qrDisplayView.style.display = 'block';

        startQRGeneration();
    } else {
        qrDisplayView.style.display = 'none';
        dashboardView.style.display = 'block';

        setupDashboard(user);
    }
}

function setupDashboard(user) {
    userName.textContent = `${user.nombre} ${user.apellido}`;
    userRole.textContent = formatRole(user.rol) || user.rol;

    showCardsByRole(user.rol);
}

function showCardsByRole(role) {
    cardScanQR.style.display = 'none';
    cardAssistedRegistration.style.display = 'none';
    cardManageEmployees.style.display = 'none';

    if (role === 'empleado') {
        cardScanQR.style.display = 'block';
    } else if (role === 'portero') {
        cardScanQR.style.display = 'block';
        cardAssistedRegistration.style.display = 'block';
    } else if (role === 'admin') {
        cardScanQR.style.display = 'block';
        cardManageEmployees.style.display = 'block';
    }

}

function startQRGeneration() {
    generateQRCode();
}

function getQRSize() {
    const containerWidth = qrCanvas.parentElement.clientWidth;
    const qrSize = Math.min(containerWidth - 40, 300);

    return Math.max(qrSize, 200);
}

async function generateQRCode() {
    try {
        const response = await fetch ('/api/attendance/qr', {
            method: 'GET',
            credentials: 'include'
        })

        const responseData = await response.json();
        const token = responseData.data.qrToken;
        const qrSize = getQRSize();

        QRCode.toCanvas(qrCanvas, token, {
            width: qrSize,
            margin: 2
        })

        startCountdown(20);
    } catch (error) {
        showAlert('Error al generar el QR', 'error');
    }
}

function startCountdown(seconds) {
    if (qrInterval !== null) {
        clearInterval(qrInterval);
        qrInterval = null;
    }

    qrInterval = setInterval(() => {
        seconds--;
        countdown.textContent = seconds;

        if (seconds === 0) {
            clearInterval(qrInterval);
            qrInterval = null;
            generateQRCode();
        }
    }, 1000)
}

function openScanModal() {
    scanModal.classList.add('active');
    startScanner();
}

function closeScanModalFn() {
    scanModal.classList.remove('active');
    stopScanner();
}

function startScanner() {
    html5QrCode = new Html5Qrcode('qrReader');
    
    // Detectar si es móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    const config = {
        fps: isMobile ? 20 : 10,
        qrbox: isMobile ? 
            // En móvil: proporcionar el 80% del área
            function(viewfinderWidth, viewfinderHeight) {
                let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                let qrboxSize = Math.floor(minEdge * 0.8); // 80% del área
                return {
                    width: qrboxSize,
                    height: qrboxSize
                };
            }
            : 
            // En desktop: tamaño fijo
            { width: 250, height: 250 }
    };
    
    html5QrCode.start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        onScanError
    ).catch(err => {
        console.error('Error al iniciar escáner:', err);
        showAlert('No se pudo activar la cámara', 'error');
    });
}

function stopScanner() {
    if (html5QrCode) {
        try {
            html5QrCode.stop();
        } catch (error) {
            console.error('Error al detener el scanner:', error);
        }
        html5QrCode = null;
    }
}

function onScanSuccess(decodedText) {
    stopScanner();
    closeScanModalFn();
    registerAttendance(decodedText);
}

function onScanError(error) {
}

async function registerAttendance(token) {
    try {
        const response = await fetch('/api/attendance/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({qrToken: token})
        });

        const responseData = await response.json();

        if (response.ok) {
            showAlert(`${formatMovementType(responseData.data.tipo)} registrada exitosamente`, 'success');
        } else {
            showAlert(responseData.message, 'error');
        }
        
    } catch (error) {
        showAlert('Error al registrar la asistencia', 'error');
    }
    
}

async function openAssistedModal() {
    assistedModal.classList.add('active');
    await loadCompanies();
    initSignaturePad();
}

function closeAssistedModalFn() {
    assistedModal.classList.remove('active');
    clearSignatureFn();
    employeeSelect.value = '';
}

async function loadCompanies() {
    try {
        const response = await fetch('/api/employees/lookups/companies', {
            method: 'GET',
            credentials: 'include'
        }); 

        const responseData = await response.json();

        filterCompany.innerHTML = '<option value="">Seleccionar empresa...</option>';

        responseData.data.forEach(company => {
            const option = document.createElement('option');
            option.value = company.empresa_id;
            option.textContent = company.nombre_empresa;
            filterCompany.appendChild(option);
        });

        filterCompany.disabled = false;
    } catch (error) {
        showAlert('Error al cargar las empresas', 'error');
    }
}

async function loadEmployeesSelect(companyId) {
    try {
        const response = await fetch(`/api/employees/by-company?companyId=${companyId}`, {
            credentials: 'include'
        });

        const responseData = await response.json();

        employeeSelect.innerHTML = '<option value="">Seleccionar empleado...</option>';

        responseData.data.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.empleado_id;
            option.textContent = `${employee.nombre} ${employee.apellido}`;
            employeeSelect.appendChild(option);
        });

        employeeSelect.disabled = false;
    } catch (error) {
        showAlert('Error al cargar los empleados', 'error');
    }
}

function initSignaturePad() {
    signaturePad = new SignaturePad(signaturaPadCanvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
    });
}

function clearSignatureFn() {
    if (signaturePad) {
        signaturePad.clear();
    }
}

async function handleAssistedRegistration() {
    const selectedEmployeeId = employeeSelect.value;

    if (!selectedEmployeeId) {
        showAlert('Por favor, selecciona un empleado', 'error');
        return;
    }

    if (signaturePad.isEmpty()) {
        showAlert('Se requiere la firma del empleado', 'error');
        return;
    }

    const signature = signaturePad.toDataURL();

    try {
        const response = await fetch('/api/attendance/assisted-register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                employeeId: parseInt(selectedEmployeeId),
                digitalSignature: signature
            })
        })

        const responseData = await response.json();

        if (response.ok) {
            showAlert(`Asistencia registrada: ${formatMovementType(responseData.data.tipo)}`, 'success');
            closeAssistedModalFn();
        } else {
            showAlert(responseData.message, 'error');
        }
    } catch (error) {
        showAlert('Error al registrar la asistencia', 'error');
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/pages/login.html';
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        window.location.href = '/pages/login.html';
    }
}

window.addEventListener('resize', function() {
    if (currentUser && currentUser.rol === 'admin-qr') {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            generateQRCode();
        }, 200);
    }
});


btnScanQR.addEventListener('click', openScanModal);
closeScanModal.addEventListener('click', closeScanModalFn);
logoutBtn.addEventListener('click', handleLogout);
logoutQR.addEventListener('click', handleLogout);
profileBtn.addEventListener('click', () => window.location.href = '/pages/profile.html');
btnOpenAssistedModal.addEventListener('click', openAssistedModal);
closeAssistedModal.addEventListener('click', closeAssistedModalFn);
cancelAssistedBtn.addEventListener('click', closeAssistedModalFn);

filterCompany.addEventListener('change', () => {
    const companyId = filterCompany.value;

    if (companyId) {
        loadEmployeesSelect(companyId);
    } else {
        employeeSelect.innerHTML = '<option value="">Primero selecciona una empleado...</option>';
        employeeSelect.disabled = true;
    }
})

clearSignatureBtn.addEventListener('click', clearSignatureFn);
submitAssistedBtn.addEventListener('click', handleAssistedRegistration);
document.addEventListener('DOMContentLoaded', init);