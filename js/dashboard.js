// static/js/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const overlay = document.getElementById('overlay');
    const mainContent = document.querySelector('.main-content');
    let isMenuOpen = false;
    let isSidebarOpen = false;

    // Toggle menú hamburguesa
    menuToggle.addEventListener('click', function() {
        isMenuOpen = !isMenuOpen;
        dropdownMenu.classList.toggle('active');
        
        // Si el sidebar está abierto, cerrarlo
        if (isSidebarOpen) {
            sidebar.classList.remove('active');
            mainContent.classList.remove('shifted');
            isSidebarOpen = false;
        }
        
        // Toggle overlay
        overlay.classList.toggle('active');
    });

    // Click en el overlay
    overlay.addEventListener('click', function() {
        if (isMenuOpen) {
            dropdownMenu.classList.remove('active');
            isMenuOpen = false;
        }
        if (isSidebarOpen) {
            sidebar.classList.remove('active');
            mainContent.classList.remove('shifted');
            isSidebarOpen = false;
        }
        overlay.classList.remove('active');
    });

    // Doble click en el borde izquierdo para abrir/cerrar sidebar
    document.addEventListener('dblclick', function(e) {
        if (e.clientX < 20) { // 20px desde el borde izquierdo
            isSidebarOpen = !isSidebarOpen;
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('shifted');
            
            // Si el menú está abierto, cerrarlo
            if (isMenuOpen) {
                dropdownMenu.classList.remove('active');
                isMenuOpen = false;
            }
            
            overlay.classList.toggle('active');
        }
    });

    // Cerrar menús con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (isMenuOpen) {
                dropdownMenu.classList.remove('active');
                isMenuOpen = false;
            }
            if (isSidebarOpen) {
                sidebar.classList.remove('active');
                mainContent.classList.remove('shifted');
                isSidebarOpen = false;
            }
            overlay.classList.remove('active');
        }
    });
});