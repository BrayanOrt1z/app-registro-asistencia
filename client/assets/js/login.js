document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const userInput = document.getElementById('user');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const alertModal = document.getElementById('alertModal');
    const alertText = document.getElementById('alertText');
    const closeAlert = document.getElementById('closeAlert');

    checkExistingSession();

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

    function setLoading(isLoading) {
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
            loginBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            loginBtn.disabled = false;
        }
    }

    async function checkExistingSession() {
        try {
            const response = await fetch ('/api/profile/', {
                credentials: 'include'
            });

            if (response.ok) {
                window.location.replace('/pages/dashboard.html');
            }
        } catch (error) {}
    }

    async function handleLogin(event) {
        event.preventDefault();

        const user = userInput.value.trim();
        const password = passwordInput.value.trim();

        if (!user || !password) {
            return showAlert('Por favor, complete todos los campos.', 'error');
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ user, password})
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Inicio de sesión exitoso.', 'success');
                setTimeout(() => {
                    window.location.href = ('/pages/dashboard.html');
                } , 1000);
            } else {
                showAlert(data.message || 'Error en el inicio de sesión.', 'error');
            }
        } catch (error) {
            showAlert('Error de red. Por favor, intente nuevamente.', 'error');
        } finally {
            setLoading(false);
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});