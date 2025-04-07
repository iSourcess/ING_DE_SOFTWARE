import { auth, db } from '../src/firebase/config';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginFormElement');
    const registrationForm = document.getElementById('registrationForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const strengthText = document.getElementById('strengthText');
    const strengthMeter = document.getElementById('strengthMeter');
    const formProgress = document.getElementById('formProgress');

    // Validar formato de correo institucional
    function validateEmail(email) {
        const regex = /^[a-zA-Z]+\.[a-zA-Z]+@academicos\.udg\.mx$/;
        return regex.test(email);
    }

    // Función para manejar inicio de sesión con Google
    function handleGoogleSignIn() {
        const provider = new GoogleAuthProvider();

        // Restringir a dominios de UDG
        provider.setCustomParameters({
            'hd': 'academicos.udg.mx'
        });

        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                const email = user.email;

                // Verificar si el correo es institucional
                if (!validateEmail(email)) {
                    alert('Solo se permiten correos institucionales de UDG');
                    auth.signOut();
                    return;
                }

                // Guardar información adicional si no existe
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        nombre: user.displayName.split(' ')[0],
                        apellidos: user.displayName.split(' ').slice(1).join(' '),
                        email: email,
                        createdAt: new Date(),
                        profilePicture: user.photoURL
                    });
                }

                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                console.error('Error en autenticación con Google:', error);

                let errorMessage = 'Error en la autenticación';
                switch (error.code) {
                    case 'auth/account-exists-with-different-credential':
                        errorMessage = 'Ya existe una cuenta con este correo';
                        break;
                    case 'auth/popup-blocked':
                        errorMessage = 'Popup bloqueado. Permite popups para iniciar sesión';
                        break;
                    case 'auth/popup-closed-by-user':
                        errorMessage = 'Inicio de sesión cancelado';
                        break;
                }

                alert(errorMessage);
            });
    }

    // Agregar botón de Google si no existe
    function addGoogleButton() {
        const loginFormContainer = document.getElementById('loginForm');

        // Verificar si ya existe un botón de Google
        if (document.querySelector('.google-btn')) return;

        const googleBtn = document.createElement('button');
        googleBtn.type = 'button';
        googleBtn.className = 'google-btn';
        googleBtn.innerHTML = `
            <span class="google-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                </svg>
            </span>
            <span class="btn-text">Iniciar con Google</span>
        `;

        googleBtn.addEventListener('click', handleGoogleSignIn);

        // Crear separador
        const separator = document.createElement('div');
        separator.className = 'separator';
        separator.innerHTML = '<span>o</span>';

        // Insertar antes del formulario
        loginFormContainer.insertBefore(separator, loginForm);
        loginFormContainer.insertBefore(googleBtn, loginForm);
    }

    // Manejo del envío del formulario
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            try {
                const email = emailInput.value;
                const password = passwordInput.value;

                // Validar el formato del correo
                if (!validateEmail(email)) {
                    throw new Error('El correo debe ser institucional (@academicos.udg.mx)');
                }

                // Intentar iniciar sesión
                const userCredential = await signInWithEmailAndPassword(auth, email, password);

                // Redirigir al dashboard después del inicio de sesión exitoso
                window.location.href = 'dashboard.html';
            } catch (error) {
                let errorMessage = 'Error en el inicio de sesión';

                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Correo electrónico inválido';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'Esta cuenta ha sido deshabilitada';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'No existe una cuenta con este correo';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Contraseña incorrecta';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Demasiados intentos fallidos. Por favor, intente más tarde';
                        break;
                }

                alert(errorMessage);
            }
        });

        // Agregar botón de Google
        addGoogleButton();
    }

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

    // Validaciones en tiempo real
    if (registrationForm) {
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

        // Manejar el envío del formulario de registro
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


    function handleCredentialResponse(response) {
        try {
            const jwt = response.credential;

            // 👤 Decodifica el token para obtener la info del usuario
            const user = parseJwt(jwt);
            console.log("👤 Usuario autenticado:", user);

            // Mostrar mensaje de bienvenida
            alert(`Bienvenido ${user.name} (${user.email})`);

            // Almacenar la información de sesión
            localStorage.setItem('googleToken', jwt);
            localStorage.setItem('googleUser', JSON.stringify(user));

            // OPCIONAL: Redirigir al usuario a una página de inicio después del login
            // window.location.href = 'dashboard.html';

            // 🛡️ OPCIONAL: enviar el token a tu backend para validación
            /*
            fetch('/api/login/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: jwt })
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return res.json();
            })
            .then(data => {
                // Procesar respuesta del servidor
                console.log("Respuesta del servidor:", data);
            })
            .catch(error => {
                console.error("Error al comunicarse con el servidor:", error);
            });
            */
        } catch (error) {
            console.error("Error al procesar la autenticación:", error);
            alert("Hubo un problema al iniciar sesión con Google");
        }
    }

    // Función auxiliar para decodificar el JWT (sin validarlo)
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(base64);
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            throw new Error("Token inválido");
        }
    }



});