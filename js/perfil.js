// Elementos DOM
const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
const overlay = document.getElementById('overlay');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const changeAvatarBtn = document.querySelector('.change-avatar-btn');
const profileButtons = document.querySelectorAll('.perfil-buttons .btn');
const contactForm = document.querySelector('.contact-form');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeEventListeners();
    
    // Detector de cambios en localStorage para sincronización entre pestañas
    window.addEventListener('storage', handleStorageChange);
});

// Inicializar event listeners
function initializeEventListeners() {
    // Toggle menú hamburguesa
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleDropdownMenu);
    }
    
    // Cerrar menú al hacer clic en overlay
    if (overlay) {
        overlay.addEventListener('click', closeDropdownMenu);
    }
    
    // Toggle tema oscuro/claro
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Eventos para el botón de cambiar avatar
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', handleAvatarChange);
    }
    
    // Eventos para los botones del perfil
    if (profileButtons) {
        profileButtons.forEach(button => {
            button.addEventListener('click', handleProfileButtonClick);
        });
    }
    
    // Evento para el formulario de contacto
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

// Función para inicializar el tema
function initializeTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    applyTheme(isDarkMode);
}

// Aplicar el tema oscuro o claro
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    } else {
        document.body.classList.remove('dark-theme');
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
        }
    }
}

// Manejar cambios en el almacenamiento (para sincronización entre pestañas)
function handleStorageChange(event) {
    if (event.key === 'darkMode') {
        const isDarkMode = event.newValue === 'true';
        applyTheme(isDarkMode);
    }
}

// Función para cambiar tema
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkMode', isDarkMode.toString());
    
    if (themeIcon) {
        themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Funciones para el menú desplegable
function toggleDropdownMenu() {
    dropdownMenu.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeDropdownMenu() {
    dropdownMenu.classList.remove('active');
    overlay.classList.remove('active');
}

// Función para manejar el cambio de avatar
function handleAvatarChange() {
    // Crear un input de archivo oculto
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    // Manejar la selección de archivo
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Actualizar la imagen de avatar
                const avatarImages = document.querySelectorAll('.avatar, .avatar-large');
                avatarImages.forEach(img => {
                    img.src = e.target.result;
                });
                
                // Aquí se podría añadir código para enviar la imagen al servidor
                showNotification('Imagen de perfil actualizada');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Simular clic en el input de archivo
    fileInput.click();
}

// Función para manejar clics en botones del perfil
function handleProfileButtonClick(event) {
    const button = event.currentTarget;
    const buttonText = button.textContent.trim();
    
    if (buttonText.includes('Editar Perfil')) {
        // Lógica para editar perfil
        showNotification('Editando perfil...');
    } else if (buttonText.includes('Cambiar Contraseña')) {
        // Lógica para cambiar contraseña
        showNotification('Cambiando contraseña...');
    } else if (buttonText.includes('Preferencias de Notificación')) {
        // Lógica para preferencias de notificación
        showNotification('Configurando notificaciones...');
    }
}

// Función para manejar el envío del formulario de contacto
function handleContactFormSubmit(event) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const name = formData.get('contact-name');
    const email = formData.get('contact-email');
    const subject = formData.get('contact-subject');
    const message = formData.get('contact-message');
    
    // Aquí se podría añadir código para enviar los datos al servidor
    console.log('Formulario enviado:', { name, email, subject, message });
    
    // Mostrar notificación
    showNotification('Mensaje enviado correctamente');
    
    // Resetear formulario
    event.target.reset();
}

// Función para mostrar notificaciones al usuario
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Estilos para la notificación
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // Eliminar del DOM después de la animación
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}