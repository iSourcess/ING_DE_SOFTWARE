// Configuración
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Clase para manejar la autenticación
class AuthService {
    static async register(userData) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error);
            }
            
            return data;
        } catch (error) {
            throw new Error(error.message || 'Error en el registro');
        }
    }
    
    static async login(credentials) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error);
            }
            
            // Guardar token y datos del usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            return data;
        } catch (error) {
            throw new Error(error.message || 'Error en el inicio de sesión');
        }
    }
    
    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
    
    static isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }
}

// Clase para manejar la validación
class Validator {
    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@academicos\.udg\.mx$/;
        return emailRegex.test(email);
    }
    
    static validatePassword(password) {
        return password.length >= 8;
    }
    
    static showError(element, message) {
        element.style.display = 'block';
        element.textContent = message;
    }
    
    static hideError(element) {
        element.style.display = 'none';
    }
}

// Event handlers
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    form.classList.add('loading');
    
    const userData = {
        name: document.getElementById('registerName').value,
        lastname: document.getElementById('registerLastName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
    };
    
    try {
        await AuthService.register(userData);
        alert('Registro exitoso! Por favor, inicia sesión.');
        toggleForms();
    } catch (error) {
        alert(error.message);
    } finally {
        form.classList.remove('loading');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    form.classList.add('loading');
    
    const credentials = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
    };
    
    try {
        const data = await AuthService.login(credentials);
        alert(`Bienvenido ${data.user.name}!`);
        window.location.href = '/dashboard'; // Redirigir al dashboard
    } catch (error) {
        alert(error.message);
    } finally {
        form.classList.remove('loading');
    }
}

// Validación en tiempo real
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.querySelector('#loginForm form');
    const loginEmail = document.getElementById('loginEmail');
    const loginEmailError = document.getElementById('loginEmailError');
    
    loginEmail.addEventListener('input', () => {
        if (!Validator.validateEmail(loginEmail.value)) {
            Validator.showError(loginEmailError, 'El correo debe tener el formato nombre.apellido@academicos.udg.mx');
        } else {
            Validator.hideError(loginEmailError);
        }
    });
    
    loginForm.addEventListener('submit', handleLogin);
    
    // Register form
    const registerForm = document.querySelector('#registerForm form');
    const registerEmail = document.getElementById('registerEmail');
    const registerEmailError = document.getElementById('registerEmailError');
    const registerPassword = document.getElementById('registerPassword');
    const registerPasswordError = document.getElementById('registerPasswordError');
    
    registerEmail.addEventListener('input', () => {
        if (!Validator.validateEmail(registerEmail.value)) {
            Validator.showError(registerEmailError, 'El correo debe tener el formato nombre.apellido@academicos.udg.mx');
        } else {
            Validator.hideError(registerEmailError);
        }
    });
    
    registerPassword.addEventListener('input', () => {
        if (!Validator.validatePassword(registerPassword.value)) {
            Validator.showError(registerPasswordError, 'La contraseña debe tener al menos 8 caracteres');
        } else {
            Validator.hideError(registerPasswordError);
        }
    });
    
    registerForm.addEventListener('submit', handleRegister);
});

// Verificar autenticación al cargar la página
if (AuthService.isAuthenticated() && window.location.pathname === '/') {
    window.location.href = '/dashboard';
}