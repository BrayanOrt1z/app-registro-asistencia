// =====================================================
// CONFIGURACIÓN - NAVEGACIÓN ENTRE PESTAÑAS
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // =====================================================
    // 1. NAVEGACIÓN ENTRE PESTAÑAS
    // =====================================================
    
    const configTabs = document.querySelectorAll('.config-tab');
    const configSections = document.querySelectorAll('.config-section');
    
    configTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Remover clase active de todas las pestañas
            configTabs.forEach(t => t.classList.remove('active'));
            
            // Agregar clase active a la pestaña clickeada
            this.classList.add('active');
            
            // Ocultar todas las secciones
            configSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Mostrar la sección correspondiente
            const sectionToShow = document.getElementById(`${targetSection}-section`);
            if (sectionToShow) {
                sectionToShow.classList.add('active');
            }
        });
    });
    
    // =====================================================
    // 2. BOTONES DE NAVEGACIÓN (Header)
    // =====================================================
    
    const backBtn = document.getElementById('backBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            // Regresar al dashboard o página anterior
            window.history.back();
            // O redirigir específicamente:
            // window.location.href = 'dashboard.html';
        });
    }
    
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function() {
            // Ir al dashboard
            window.location.href = 'dashboard.html';
        });
    }
    
    // =====================================================
    // 3. MODAL DE EMPLEADO (Abrir/Cerrar)
    // =====================================================
    
    const employeeModal = document.getElementById('employeeModal');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', function() {
            employeeModal.classList.add('show');
            employeeModal.setAttribute('aria-hidden', 'false');
            document.getElementById('modalTitle').textContent = 'Agregar Empleado';
            // Limpiar formulario
            document.getElementById('employeeForm').reset();
        });
    }
    
    // Cerrar modal con X
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Cerrar modal con botón Cancelar
    if (modalCancel) {
        modalCancel.addEventListener('click', closeModal);
    }
    
    // Cerrar modal al hacer click fuera
    if (employeeModal) {
        employeeModal.addEventListener('click', function(e) {
            if (e.target === employeeModal) {
                closeModal();
            }
        });
    }
    
    function closeModal() {
        employeeModal.classList.remove('show');
        employeeModal.setAttribute('aria-hidden', 'true');
    }
    
    // =====================================================
    // 4. GUARDAR EMPLEADO (Modal Confirm)
    // =====================================================
    
    const modalConfirm = document.getElementById('modalConfirm');
    
    if (modalConfirm) {
        modalConfirm.addEventListener('click', function() {
            // Obtener valores del formulario
            const nombre = document.getElementById('modalNombre').value;
            const apellido = document.getElementById('modalApellido').value;
            const correo = document.getElementById('modalCorreo').value;
            const usuario = document.getElementById('modalUsuario').value;
            const password = document.getElementById('modalPassword').value;
            const codigo = document.getElementById('modalCodigo').value;
            const rolId = document.getElementById('modalRol').value;
            
            // Validación básica
            if (!nombre || !apellido || !usuario || !password || !codigo || !rolId) {
                alert('Por favor completa todos los campos obligatorios');
                return;
            }
            
            // Aquí harías la petición al backend
            console.log('Datos del empleado:', {
                nombre,
                apellido,
                correo,
                usuario,
                password,
                cod_empleado: codigo,
                rol_id: rolId
            });
            
            // Ejemplo de petición (descomentar cuando tengas el backend):
            /*
            fetch('/api/empleados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    correo,
                    usuario,
                    contrasenia: password,
                    cod_empleado: codigo,
                    rol_id: rolId
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Empleado creado:', data);
                closeModal();
                // Recargar lista de empleados
                loadEmployees();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al crear empleado');
            });
            */
            
            alert('Empleado guardado (simulado)');
            closeModal();
        });
    }
    
    // =====================================================
    // 5. BÚSQUEDA DE EMPLEADOS
    // =====================================================
    
    const searchInput = document.querySelector('.search-bar input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#employeesTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // =====================================================
    // 6. BOTONES DE ACCIÓN (Editar/Eliminar)
    // =====================================================
    
    // Delegación de eventos para botones dinámicos
    document.addEventListener('click', function(e) {
        // Botón Editar
        if (e.target.closest('.icon-btn:not(.danger)')) {
            const btn = e.target.closest('.icon-btn');
            if (btn.querySelector('.fa-edit')) {
                const row = btn.closest('tr');
                if (row) {
                    // Obtener datos de la fila (ejemplo)
                    const codigo = row.querySelector('.code-badge')?.textContent;
                    console.log('Editar empleado con código:', codigo);
                    
                    // Abrir modal con datos del empleado
                    employeeModal.classList.add('show');
                    document.getElementById('modalTitle').textContent = 'Editar Empleado';
                    
                    // Aquí cargarías los datos del empleado en el formulario
                    // fetch(`/api/empleados/${codigo}`)...
                }
            }
        }
        
        // Botón Eliminar
        if (e.target.closest('.icon-btn.danger')) {
            const btn = e.target.closest('.icon-btn.danger');
            if (btn.querySelector('.fa-trash')) {
                const row = btn.closest('tr');
                if (row) {
                    const codigo = row.querySelector('.code-badge')?.textContent;
                    
                    if (confirm(`¿Estás seguro de eliminar al empleado con código ${codigo}?`)) {
                        console.log('Eliminar empleado:', codigo);
                        
                        // Aquí harías la petición DELETE al backend
                        // fetch(`/api/empleados/${codigo}`, { method: 'DELETE' })...
                        
                        // Simulación: remover la fila
                        row.remove();
                        alert('Empleado eliminado (simulado)');
                    }
                }
            }
        }
    });
    
    // =====================================================
    // 7. GUARDAR CAMBIOS DE PERFIL
    // =====================================================
    
    const saveProfileBtns = document.querySelectorAll('.btn-primary');
    
    saveProfileBtns.forEach(btn => {
        if (btn.textContent.includes('Guardar Cambios')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const section = this.closest('.config-section');
                const sectionId = section.id;
                
                if (sectionId === 'perfil-section') {
                    // Obtener datos del perfil
                    const nombre = document.getElementById('nombre').value;
                    const apellido = document.getElementById('apellido').value;
                    const correo = document.getElementById('correo').value;
                    const usuario = document.getElementById('usuario').value;
                    
                    console.log('Actualizar perfil:', { nombre, apellido, correo, usuario });
                    
                    // Aquí harías la petición al backend
                    /*
                    fetch('/api/perfil', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre, apellido, correo, usuario })
                    })...
                    */
                    
                    alert('Perfil actualizado (simulado)');
                }
            });
        }
    });
    
    // =====================================================
    // 8. CAMBIAR CONTRASEÑA
    // =====================================================
    
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (currentPassword && newPassword && confirmPassword) {
        // Validación en tiempo real
        confirmPassword.addEventListener('input', function() {
            if (this.value !== newPassword.value) {
                this.style.borderColor = 'var(--error)';
            } else {
                this.style.borderColor = 'var(--success)';
            }
        });
    }
    
    console.log('✅ Sistema de configuraciones cargado correctamente');
});