// Tabla y datos
const employeesTableBody = document.getElementById('employeesTableBody');

// Filtros
const filterCompany = document.getElementById('filterCompany');
const filterRole = document.getElementById('filterRole');
const filterStatus = document.getElementById('filterStatus');
const searchInput = document.getElementById('searchInput');

// Botones
const btnAddEmployee = document.getElementById('btnCreateEmployee');
const saveButtonText = document.getElementById('saveButtonText');

// Modal
const employeeModal = document.getElementById('employeeModal');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelForm'); 

// Formulario
const employeeForm = document.getElementById('employeeForm');
const employeeIdInput = document.getElementById('employeeId');
const nameInput = document.getElementById('nombre'); 
const lastNameInput = document.getElementById('apellido'); 
const codeInput = document.getElementById('codigo'); 
const emailInput = document.getElementById('email'); 
const userInput = document.getElementById('usuario'); 
const passwordInput = document.getElementById('password'); 
const companySelect = document.getElementById('empresa_id'); 
const roleSelect = document.getElementById('rol_id');
const supervisorSelect = document.getElementById('supervisor_id'); 
const activeCheckbox = document.getElementById('activo'); 

// Botones del formulario
const btnSaveEmployee = document.getElementById('saveEmployee'); 

// Alertas
const alertModal = document.getElementById('alertModal');
const alertText = document.getElementById('alertText');
const closeAlert = document.getElementById('closeAlert');

// Modal de confirmación
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmMessage'); 
const btnConfirmAction = document.getElementById('confirmAction'); 
const btnCancelAction = document.getElementById('cancelConfirm');
const closeConfirmModalBtn = document.getElementById('closeConfirmModal');

// Variables globales
let employeesData = [];
let filteredEmployees = [];
let editingEmployeeId = null;
let deleteEmployeeId = null;

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

        if (user.rol !== 'admin') {
            showAlert('No tienes permiso para acceder a esta página.', 'error');
            setTimeout(() => {
                window.location.href = '/pages/dashboard.html';
            }, 2000);
            return;
        }
        

        await Promise.all([
            loadCompanies(),
            loadRoles(),
            loadEmployees()
        ]);
    } catch (error) {
        window.location.href = '/pages/login.html';
    }
}

async function loadCompanies() {
    try {
        const response = await fetch('/api/employees/lookups/companies', {
            method: 'GET',
            credentials: 'include'
        }); 

        const responseData = await response.json();

        filterCompany.innerHTML = '<option value="">Todas las empresas</option>';
        companySelect.innerHTML = '<option value="">Seleccionar empresa...</option>'

        responseData.data.forEach(company => {
            const option = document.createElement('option');
            option.value = company.empresa_id;
            option.textContent = company.nombre_empresa;
            filterCompany.appendChild(option);

            const option1 = option.cloneNode(true);
            companySelect.appendChild(option1);
        });

        filterCompany.disabled = false;
    } catch (error) {
        showAlert('Error al cargar las empresas', 'error');
    }
}

async function loadRoles() {
    try {
        const response = await fetch('/api/employees/lookups/roles', {
            method: 'GET',
            credentials: 'include'
        })

        const responseData = await response.json();

        filterRole.innerHTML = '<option value="">Todos los roles</option>';
        roleSelect.innerHTML = '<option value="">Seleccionar rol...</option>';

        responseData.data.forEach(role => {
            const option = document.createElement('option');
            option.value = role.rol_id;
            option.textContent = formatRole(role.nombre_rol) || role.nombre_rol;
            filterRole.appendChild(option);

            const option1 = option.cloneNode(true);
            roleSelect.appendChild(option1);
        })
    } catch (error) {
        showAlert('Error al cargar los roles', 'error');
    }
}

async function loadSupervisors(companyId) {
    try {
        if (!companyId) {
            supervisorSelect.innerHTML = '<option value="">Primero selecciona una empresa</option>';
            supervisorSelect.disabled = true;
        }

        const response = await fetch(`/api/employees/lookups/supervisors?companyId=${companyId}`, {
            method: 'GET',
            credentials: 'include'
        })

        const responseData = await response.json();

        supervisorSelect.innerHTML = '<option value="">Sin supervisor</option>';

        responseData.data.forEach(supervisor => {
            const option = document.createElement('option');
            option.value = supervisor.empleado_id;
            option.textContent = supervisor.nombre_completo;
            supervisorSelect.appendChild(option);
        })

        supervisorSelect.disabled = false;
    } catch (error) {
        showAlert('Error al cargar los supervisores', 'error');
    }
}

async function loadEmployees() {
    try {
        const response = await fetch('/api/employees/', {credentials: 'include'});

        const responseData = await response.json();
        employeesData = responseData.data || [];
        filteredEmployees = [...employeesData];

        renderTable();
    } catch (error) {
        showAlert('Error al cargar los empleados', 'error');
    }
}

function renderTable() {
    if (filteredEmployees.length === 0) {
        employeesTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">
                    No se encontraron empleados
                </td>
            </tr>`;
        return;
    }

    employeesTableBody.innerHTML = filteredEmployees.map(employee => `
        <tr>
            <td>${employee.cod_empleado}</td>
            <td>${employee.nombre} ${employee.apellido}</td>
            <td>${employee.correo}</td>
            <td>${formatRole(employee.nombre_rol)}</td>
            <td>${employee.nombre_empresa}</td>
            <td>
                <span class="status-badge ${employee.activo ? 'active' : 'inactive'}">
                    ${employee.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="actions">
                <button class="btn-edit" onclick="openEditModal(${employee.empleado_id})" title="Editar">
                    ✏️
                </button>
                <button class="btn-delete" onclick="confirmDelete(${employee.empleado_id})" title="Eliminar">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const companyFilter = filterCompany.value;
    const roleFilter = filterRole.value;
    const statusFilter = filterStatus.value;

    filteredEmployees = employeesData.filter(employee => {
        // Filtro de búsqueda
        if (searchTerm) {
            const matchesSearch = 
                employee.nombre?.toLowerCase().includes(searchTerm) ||
                employee.apellido?.toLowerCase().includes(searchTerm) ||
                employee.cod_empleado?.toLowerCase().includes(searchTerm) ||
                employee.correo?.toLowerCase().includes(searchTerm);
            
            if (!matchesSearch) {
                return false;
            }
        }

        // Filtro por empresa
        if (companyFilter && companyFilter !== '') {
            console.log(`Comparando empresa: ${employee.empresa_id} (${typeof employee.empresa_id}) == ${companyFilter} (${typeof companyFilter})`);
            if (employee.empresa_id != companyFilter) {
                return false;
            }
        }

        // Filtro por rol
        if (roleFilter && roleFilter !== '') {
            console.log(`Comparando rol: ${employee.rol_id} (${typeof employee.rol_id}) == ${roleFilter} (${typeof roleFilter})`);
            if (employee.rol_id != roleFilter) {
                return false;
            }
        }

        // Filtro por estado
        if (statusFilter && statusFilter !== '') {
            if (statusFilter === '1' && !employee.activo) {
                return false;
            }
            if (statusFilter === '0' && employee.activo) {
                return false;
            }
        }

        return true;
    });

    renderTable();
}

function clearFilters() {
    searchInput.value = '';
    filterCompany.value = '';
    filterRole.value = '';
    filterStatus.value = '';
    applyFilters();
}

function openCreateModal() {
    editingEmployeeId = null;
    modalTitle.textContent = 'Nuevo Empleado';

    if (saveButtonText) {
        saveButtonText.textContent = 'Crear Empleado'
    }

    employeeForm.reset();
    employeeIdInput.value = '';
    passwordInput.required = true;
    passwordInput.parentElement.style.display = 'block';
    activeCheckbox.checked = true;
    supervisorSelect.innerHTML = '<option value="">Primero selecciona una empresa</option>';
    supervisorSelect.disabled = true;
    employeeModal.classList.add('active');
}

async function openEditModal(employeeId) {
    try {
        const response = await fetch(`/api/employees/${employeeId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            showAlert('Error al obtener datos del empleado', 'error');
            return;
        }

        const responseData = await response.json();
        const employee = responseData.data;

        if (saveButtonText) {
            saveButtonText.textContent = 'Actualizar Empleado'
        }

        editingEmployeeId = employeeId;
        modalTitle.textContent = 'Editar Empleado';
        
        employeeIdInput.value = employee.empleado_id;
        nameInput.value = employee.nombre;
        lastNameInput.value = employee.apellido;
        codeInput.value = employee.cod_empleado;
        emailInput.value = employee.correo;
        userInput.value = employee.usuario;
        companySelect.value = employee.empresa_id;
        roleSelect.value = employee.rol_id;
        activeCheckbox.checked = employee.activo;
        
        // Cargar supervisores de la empresa y seleccionar el actual
        await loadSupervisors(employee.empresa_id);
        supervisorSelect.value = employee.empleado_id || '';
        
        // Ocultar campo de contraseña en edición
        passwordInput.required = false;
        passwordInput.value = '';
        passwordInput.parentElement.style.display = 'none';
        
        employeeModal.classList.add('active');
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar datos del empleado', 'error');
    }
}

function closeEmployeeModal() {
    employeeModal.classList.remove('active');
    employeeForm.reset();
    editingEmployeeId = null;
}

async function handleSaveEmployee(e) {
    e.preventDefault();

    const employeeData = {
        name: nameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        user: userInput.value.trim(),
        employeeCode: codeInput.value.trim(),
        roleId: parseInt(roleSelect.value),
        companyId: parseInt(companySelect.value),
        supervisorId: supervisorSelect.value ? parseInt(supervisorSelect.value) : null, 
        active: activeCheckbox.checked
    };

    // Si es creación, incluir contraseña
    if (!editingEmployeeId) {
        employeeData.password = passwordInput.value.trim();
    }

    try {
        const url = editingEmployeeId 
            ? `/api/employees/${editingEmployeeId}` 
            : '/api/employees/';
        
        const method = editingEmployeeId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(employeeData)
        });

        const data = await response.json();

        if (response.ok) {
            showAlert(
                editingEmployeeId ? 'Empleado actualizado exitosamente' : 'Empleado creado exitosamente',
                'success'
            );
            closeEmployeeModal();
            await loadEmployees();
        } else {
            showAlert(data.message || 'Error al guardar empleado', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar empleado', 'error');
    }
}

function confirmDelete(employeeId) {
    deleteEmployeeId = employeeId;
    const employee = employeesData.find(e => e.empleado_id === employeeId);
    
    if (employee) {
        confirmText.textContent = `¿Estás seguro de que deseas eliminar a ${employee.nombre} ${employee.apellido}?`;
        confirmModal.classList.add('active');
    }
}

async function handleDelete() {
    if (!deleteEmployeeId) return;

    try {
        const response = await fetch(`/api/employees/${deleteEmployeeId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const responseData = await response.json();

        if (response.ok) {
            showAlert('Empleado eliminado exitosamente', 'success');
            closeConfirmModal();
            await loadEmployees();
        } else {
            showAlert(responseData.message || 'Error al eliminar empleado', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar empleado', 'error');
    }
}

function closeConfirmModal() {
    confirmModal.classList.remove('active');
    deleteEmployeeId = null;
}

// Event Listeners
// Hacer funciones globales para onclick del HTML
window.openEditModal = openEditModal;
window.confirmDelete = confirmDelete;

// Filtros
searchInput.addEventListener('input', applyFilters);
filterCompany.addEventListener('change', applyFilters);
filterRole.addEventListener('change', applyFilters);
filterStatus.addEventListener('change', applyFilters);

// Botón agregar
btnAddEmployee.addEventListener('click', openCreateModal);

// Modal principal
closeModal.addEventListener('click', closeEmployeeModal);
cancelModal.addEventListener('click', closeEmployeeModal);

// Formulario
employeeForm.addEventListener('submit', handleSaveEmployee);

// Cargar supervisores al cambiar empresa
companySelect.addEventListener('change', function() {
    const companyId = companySelect.value;
    if (companyId) {
        loadSupervisors(companyId);
    } else {
        supervisorSelect.innerHTML = '<option value="">Primero selecciona una empresa</option>';
        supervisorSelect.disabled = true;
    }
});

// Modal de confirmación

closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
btnConfirmAction.addEventListener('click', handleDelete);
btnCancelAction.addEventListener('click', closeConfirmModal);

// Inicializar
document.addEventListener('DOMContentLoaded', init);