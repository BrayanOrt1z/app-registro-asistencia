'use strict';

let currentSection = 'control';
let currentAction  = '';

// Cambia esta lista por la que traigas de tu backend:
const EMPLOYEES = [
    { code: 'JD', name: 'Juan Pérez' },
    { code: 'MG', name: 'María García' },
    { code: 'CL', name: 'Carlos López' },
];

// ===========================
// Inicialización
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupEventListeners();
    initializeManualDateTime();
    fillEmployeeSelect(); // llena el <select id="employeeSelect">
}

// ===========================
// Fecha/Hora en header y panel
// ===========================
function updateDateTime() {
    const now = new Date();

    // Fecha para el panel principal (más corta)
    const dateMain = now.toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) currentDateEl.textContent = dateMain;

    // Fecha larga para header (si existe)
    const dateHeader = now.toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const currentDateHeaderEl = document.getElementById('currentDateHeader');
    if (currentDateHeaderEl) currentDateHeaderEl.textContent = dateHeader;

    // Hora actual
    const timeStr = now.toLocaleTimeString('es-ES', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const currentTimeEl = document.getElementById('currentTime');
    if (currentTimeEl) currentTimeEl.textContent = timeStr;

    // Hora visible dentro del modal (usar hora actual)
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    if (currentTimeDisplay) currentTimeDisplay.textContent = timeStr;
}

// ===========================
// Listeners UI
// ===========================
function setupEventListeners() {
  // Navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.getAttribute('data-section')));
    });

    // Botones acción
    document.getElementById('entryBtn')?.addEventListener('click', () => openModal('entry'));
    document.getElementById('exitBtn')?.addEventListener('click',  () => openModal('exit'));

    // Modal
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('modalCancel')?.addEventListener('click', closeModal);
    document.getElementById('modalConfirm')?.addEventListener('click', confirmTimeRegistration);

    // Cambios de opción de tiempo
    document.querySelectorAll('input[name="timeOption"]').forEach(opt => {
        opt.addEventListener('change', handleTimeOptionChange);
    });

    // Hacer clickeable toda la caja de opción
    document.querySelectorAll('.option-box').forEach(box => {
        box.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
            const radio = box.querySelector('input[type="radio"]');
            if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
            updateOptionBoxes();
            }
        }
        });
    });

    // Cerrar modal al hacer clic fuera
    document.getElementById('timeModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'timeModal') closeModal();
    });

    // Botón cargar más (demo)
    const loadMoreBtn = document.querySelector('.load-more-btn');
    loadMoreBtn?.addEventListener('click', loadMoreRecords);

    // Header (demo)
    document.getElementById('configBtn')?.addEventListener('click', () => {
        window.location.href = '../../pages/settings.html';
    });
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('¿Está seguro que desea cerrar sesión?')) alert('Cerrando sesión...');
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('timeModal')?.classList.contains('show')) {
        closeModal();
        }
    });

    // Confirmar con Enter (dentro del modal)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' &&
            document.getElementById('timeModal')?.classList.contains('show')) {
        e.preventDefault();
        confirmTimeRegistration();
        }
    });
}

// ===========================
// Secciones
// ===========================
function switchSection(section) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(`${section}-section`)?.classList.add('active');

    currentSection = section;
}

// ===========================
// Modal: abrir/cerrar/reset
// ===========================
function openModal(action) {
    currentAction = action;

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = action === 'entry' ? 'Registrar Entrada' : 'Registrar Salida';

    resetModalForm(); // importante: usa el radio correcto

    document.getElementById('timeModal')?.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Enfocar select de empleado
    document.getElementById('employeeSelect')?.focus();
}

function closeModal() {
    document.getElementById('timeModal')?.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function resetModalForm() {
  // ID correcto del radio: useCurrentTime
    const radioCurrent = document.getElementById('useCurrentTime');
    const radioManual  = document.getElementById('manualTime');
    if (radioCurrent) radioCurrent.checked = true;
    if (radioManual)  radioManual.checked  = false;

    // Ocultar inputs manuales y limpiar
    const manualWrap = document.getElementById('manualInput');
    if (manualWrap) manualWrap.style.display = 'none';

    const manualDate = document.getElementById('manualDate');
    const manualTime = document.getElementById('manualTimeInput');
    if (manualDate) manualDate.value = '';
    if (manualTime) manualTime.value = '';

    // Reset del select de empleado
    const sel = document.getElementById('employeeSelect');
    if (sel && sel.options.length) sel.selectedIndex = 0;

    updateOptionBoxes();
}

// ===========================
// Opciones de tiempo
// ===========================
function handleTimeOptionChange() {
    const selected = document.querySelector('input[name="timeOption"]:checked')?.value;
    const manualWrap = document.getElementById('manualInput');

    if (selected === 'manual') {
        if (manualWrap) manualWrap.style.display = 'block';
        initializeManualDateTime();
    } else {
        if (manualWrap) manualWrap.style.display = 'none';
    }
    updateOptionBoxes();
}

function updateOptionBoxes() {
    document.querySelectorAll('.option-box').forEach(box => {
        const radio = box.querySelector('input[type="radio"]');
        box.classList.toggle('active', !!radio?.checked);
    });
}

function initializeManualDateTime() {
    const now = new Date();
    const manualDate = document.getElementById('manualDate');
    const manualTime = document.getElementById('manualTimeInput');

    if (manualDate && !manualDate.value) {
        manualDate.value = now.toISOString().split('T')[0];
    }
    if (manualTime && !manualTime.value) {
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        manualTime.value = `${hh}:${mm}`;
    }
}

// ===========================
// Select de empleado
// ===========================
function fillEmployeeSelect() {
    const sel = document.getElementById('employeeSelect');
    if (!sel) return;

    sel.innerHTML = [
        '<option value="" disabled selected>Selecciona un empleado</option>',
        ...EMPLOYEES.map(e => `<option value="${e.code}" data-name="${e.name}">${e.name}</option>`)
    ].join('');
}

// ===========================
// Confirmar registro
// ===========================
function confirmTimeRegistration() {
  // 1) Validar empleado
    const sel = document.getElementById('employeeSelect');
    if (!sel || !sel.value) {
        alert('Por favor, selecciona un empleado.');
        sel?.focus();
        return;
    }
    const employeeCode = sel.value;
    const employeeName = sel.selectedOptions[0].dataset.name;

    // 2) Obtener hora según opción
    const selectedOption = document.querySelector('input[name="timeOption"]:checked')?.value;
    let registrationTime;

    if (selectedOption === 'current') {
        registrationTime = new Date();
    } else {
        const manualDate = document.getElementById('manualDate')?.value;
        const manualTime = document.getElementById('manualTimeInput')?.value;
        if (!manualDate || !manualTime) {
        alert('Completa la fecha y hora manual.');
        return;
        }
        registrationTime = new Date(`${manualDate}T${manualTime}`);
    }

    // 3) Mensaje/acción (aquí integrarías con tu backend y/o actualizarías la tabla)
    const actionText = currentAction === 'entry' ? 'Entrada' : 'Salida';
    const timeString = registrationTime.toLocaleString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    console.log(`[OK] ${actionText} | ${employeeCode} - ${employeeName} | ${timeString}`);
    alert(`${actionText} registrada para ${employeeName}:\n${timeString}`);

    closeModal();
}

// ===========================
// Demo "cargar más" en móvil
// ===========================
function loadMoreRecords() {
    const mobileRecords = document.getElementById('mobileRecords');
    const loadMoreBtn   = document.querySelector('.load-more-btn');
    if (!mobileRecords || !loadMoreBtn) return;

    const newRecord = createMobileRecord({
        name: 'Carlos López',
        initials: 'CL',
        date: '2024-01-14',
        entry: '08:30',
        exit: '18:15',
        regular: '8:00',
        overtime: '1:45',
        status: 'completed'
    });

    mobileRecords.insertBefore(newRecord, loadMoreBtn);

    setTimeout(() => { loadMoreBtn.style.display = 'none'; }, 2000);
}

function createMobileRecord(data) {
    const card = document.createElement('div');
    card.className = 'record-card';
    card.innerHTML = `
        <div class="record-header">
        <div class="employee-info">
            <div class="employee-avatar">${data.initials}</div>
            <div class="employee-details">
            <h4>${data.name}</h4>
            <span class="record-date">${data.date}</span>
            </div>
        </div>
        <span class="status ${data.status}">Completado</span>
        </div>
        <div class="record-times">
        <div class="time-entry">
            <label>Entrada:</label>
            <span class="time-badge">${data.entry}</span>
        </div>
        <div class="time-entry">
            <label>Salida:</label>
            <span class="time-badge">${data.exit}</span>
        </div>
        </div>
        <div class="record-hours">
        <div class="hours-item">
            <span class="hours-regular">${data.regular}</span>
            <label>Regulares</label>
        </div>
        <div class="hours-item">
            <span class="hours-overtime">${data.overtime}</span>
            <label>Extras</label>
        </div>
        </div>
    `;
    return card;
}



