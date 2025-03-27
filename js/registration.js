import { auth, db } from '../src/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const strengthText = document.getElementById('strengthText');
    const strengthMeter = document.getElementById('strengthMeter');
    const formProgress = document.getElementById('formProgress');

    // Actualizar barra de progreso
    function updateProgressBar() {
        const inputs = [nombreInput, apellidosInput, emailInput, passwordInput, confirmPasswordInput];
        const filledInputs = inputs.filter(input => input.value.trim() !== '').length;
        const progressPercentage = (filledInputs / inputs.length) * 100;
        
        formProgress.style.width = `${progressPercentage}%`;
    }

    // Calcular fuerza de contraseña
    function calculatePasswordStrength(password) {
        let strength = 0;
        const strengthCriteria = [
            password.length >= 8,           // Longitud
            /[A-Z]/.test(password),         // Mayúsculas
            /[a-z]/.test(password),         // Minúsculas
            /\d/.test(password),            // Números
            /[!@#$%^&*(),.?":{}|<>]/.test(password) // Caracteres especiales
        ];

        strength = strengthCriteria.filter(Boolean).length;

        // Actualizar visualización de fuerza
        strengthMeter.style.width = `${strength * 20}%`;
        
        switch(strength) {
            case 0:
            case 1:
                strengthText.textContent = 'Muy débil';
                strengthMeter.style.backgroundColor = 'red';
                break;
            case 2:
            case 3:
                strengthText.textContent = 'Débil';
                strengthMeter.style.backgroundColor = 'orange';
                break;
            case 4:
                strengthText.textContent = 'Moderada';
                strengthMeter.style.backgroundColor = 'yellow';
                break;
            case 5:
                strengthText.textContent = 'Fuerte';
                strengthMeter.style.backgroundColor = 'green';
                break;
        }

        return strength >= 3;
    }

    // Validar correo institucional
    function validateEmail(email) {
        const regex = /^[a-zA-Z]+\.[a-zA-Z]+@academicos\.udg\.mx$/;
        return regex.test(email);
    }

    // Validaciones en tiempo real
    [nombreInput, apellidosInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('input', function() {
            // Actualizar barra de progreso
            updateProgressBar();

            // Ocultar errores previos
            const errorElement = document.getElementById(`${input.id}Error`);
            if (errorElement) errorElement.style.display = 'none';

            // Validaciones específicas
            if (input === emailInput) {
                const isValidEmail = validateEmail(input.value);
                document.getElementById('emailError').style.display = isValidEmail ? 'none' : 'block';
            }

            if (input === passwordInput) {
                calculatePasswordStrength(input.value);
                const isStrongPassword = calculatePasswordStrength(input.value);
                document.getElementById('passwordError').style.display = isStrongPassword ? 'none' : 'block';
            }

            if (input === confirmPasswordInput) {
                const passwordsMatch = passwordInput.value === confirmPasswordInput.value;
                document.getElementById('confirmPasswordError').style.display = passwordsMatch ? 'none' : 'block';
            }

            // Habilitar/deshabilitar botón de submit
            checkFormValidity();
        });
    });

    // Verificar validez del formulario
    function checkFormValidity() {
        const isNombreValid = nombreInput.value.trim() !== '';
        const isApellidosValid = apellidosInput.value.trim() !== '';
        const isEmailValid = validateEmail(emailInput.value);
        const isPasswordStrong = calculatePasswordStrength(passwordInput.value);
        const doPasswordsMatch = passwordInput.value === confirmPasswordInput.value;

        submitBtn.disabled = !(isNombreValid && isApellidosValid && isEmailValid && isPasswordStrong && doPasswordsMatch);
    }

    // Inicializar barra de progreso
    updateProgressBar();

    // Manejar el envío del formulario
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            try {
                const email = emailInput.value;
                const password = passwordInput.value;
                const nombre = nombreInput.value;
                const apellidos = apellidosInput.value;

                // Crear usuario en Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Guardar información adicional en Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    nombre: nombre,
                    apellidos: apellidos,
                    email: email,
                    createdAt: new Date(),
                    role: 'student' // Puedes añadir un rol por defecto
                }, { merge: true }); // Usar merge para evitar sobreescribir datos

                // Mostrar mensaje de éxito
                alert('Registro exitoso');
                
                // Redirigir al inicio de sesión
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error en el registro:', error);
                
                let errorMessage = 'Error en el registro';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'El correo ya está registrado';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Correo electrónico inválido';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'La contraseña es muy débil';
                        break;
                    default:
                        errorMessage = error.message;
                }

                alert(errorMessage);
            }
        });
    }
});