// Elementos DOM
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const filterDate = document.getElementById('filter-date');
const filterYear = document.getElementById('filter-year');
const currentCategory = document.getElementById('current-category');
const clearCategory = document.getElementById('clear-category');
const fileListContainer = document.querySelector('.file-list-container');
const noResults = document.getElementById('no-results');
const fileViewer = document.getElementById('file-viewer');
const pdfFrame = document.getElementById('pdf-frame');
const viewerTitle = document.getElementById('viewer-title');
const toggleSidebar = document.getElementById('toggle-sidebar');
const closeSidebar = document.getElementById('close-sidebar');
const sidebar = document.querySelector('.sidebar');
const themeToggle = document.getElementById('theme-toggle');
const projectName = document.getElementById('project-name');

// Datos de ejemplo (simulando PDFs con categorías y años)
const pdfFiles = [
    {
        id: 1,
        title: "Programa de estudio - Matemáticas avanzadas",
        subtitle: "Semestre 2025-I",
        content: "Programa académico detallado del curso de matemáticas avanzadas, incluyendo temario, bibliografía y cronograma de actividades.",
        date: "2025-01-15",
        year: "2025",
        category: "docencia-programas",
        categoryName: "Docencia - Programas académicos",
        url: "docs/programa_matematicas_2025.pdf"
    },
    // Resto de los datos...
    // (Se conservan todos los elementos del array original)
];

// Variables globales
let currentFilter = {
    search: '',
    category: 'all',
    year: 'all',
    sort: 'newest'
};

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    renderPDFs(pdfFiles);
    initializeEventListeners();
    populateYearFilter();
    
    // Establecer nombre del proyecto (reemplazar con el nombre real del proyecto)
    projectName.textContent = "Repositorio Académico";
    
    // Verificar preferencia de tema
    initializeTheme();
    
    // Escuchar cambios en el localStorage (para sincronización entre pestañas)
    window.addEventListener('storage', handleStorageChange);
});

// Inicializar event listeners
function initializeEventListeners() {
    // Búsqueda y filtros
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    filterDate.addEventListener('change', handleSortChange);
    filterYear.addEventListener('change', handleYearChange);
    clearCategory.addEventListener('click', clearCategoryFilter);
    
    // Menú y submenús
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', toggleSubmenu);
    });
    
    // Enlaces de categoría
    const categoryLinks = document.querySelectorAll('[data-category]');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            applyCategory(category);
        });
    });
    
    // Botones de vista y descarga (delegación de eventos)
    fileListContainer.addEventListener('click', (e) => {
        if (e.target.closest('.view-button')) {
            const card = e.target.closest('.file-card');
            const fileId = parseInt(card.dataset.id);
            openViewer(fileId);
        } else if (e.target.closest('.download-button')) {
            const card = e.target.closest('.file-card');
            const fileId = parseInt(card.dataset.id);
            downloadFile(fileId);
        }
    });
    
    // Visor de PDF
    document.getElementById('close-viewer').addEventListener('click', closeViewer);
    document.getElementById('download-viewing').addEventListener('click', () => {
        const currentUrl = pdfFrame.src;
        window.open(currentUrl, '_blank');
    });
    
    // Toggle sidebar en móvil
    toggleSidebar.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
    
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
    
    // Toggle tema oscuro/claro
    themeToggle.addEventListener('click', toggleTheme);
}

// Función para inicializar el tema
function initializeTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    applyTheme(isDarkMode);
}

// Función para aplicar el tema
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Manejar cambios en el almacenamiento (para sincronización entre pestañas)
function handleStorageChange(event) {
    if (event.key === 'darkMode') {
        const isDarkMode = event.newValue === 'true';
        applyTheme(isDarkMode);
    }
}

// Función para renderizar PDFs
function renderPDFs(files) {
    fileListContainer.innerHTML = '';
    
    if (files.length === 0) {
        noResults.classList.remove('hidden');
        return;
    } else {
        noResults.classList.add('hidden');
    }
    
    files.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        fileCard.dataset.id = file.id;
        
        const formattedDate = formatDate(file.date);
        
        fileCard.innerHTML = `
            <h2 class="file-title">${file.title}</h2>
            <h3 class="file-subtitle">${file.subtitle}</h3>
            <div class="file-date">Fecha: ${formattedDate}</div>
            <div class="file-category">Categoría: ${file.categoryName}</div>
            <div class="file-content">${file.content}</div>
            <div class="file-actions">
                <button class="view-button"><i class="fas fa-eye"></i> Ver</button>
                <button class="download-button"><i class="fas fa-download"></i> Descargar</button>
            </div>
        `;
        
        fileListContainer.appendChild(fileCard);
    });
}

// Función de búsqueda
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    currentFilter.search = searchTerm;
    applyFilters();
}

// Función para cambiar ordenamiento
function handleSortChange() {
    currentFilter.sort = filterDate.value;
    applyFilters();
}

// Función para filtrar por año
function handleYearChange() {
    currentFilter.year = filterYear.value;
    applyFilters();
}

// Función para aplicar filtros de categoría
function applyCategory(category) {
    currentFilter.category = category;
    
    // Actualizar UI para mostrar la categoría seleccionada
    const categoryLinks = document.querySelectorAll('[data-category]');
    const selectedLink = Array.from(categoryLinks).find(link => link.getAttribute('data-category') === category);
    
    if (selectedLink) {
        currentCategory.querySelector('span').textContent = selectedLink.textContent;
        clearCategory.classList.remove('hidden');
    }
    
    // Cerrar sidebar en móvil
    if (window.innerWidth <= 992) {
        sidebar.classList.remove('active');
    }
    
    applyFilters();
}

// Función para limpiar filtro de categoría
function clearCategoryFilter() {
    currentFilter.category = 'all';
    currentCategory.querySelector('span').textContent = 'Todas las categorías';
    clearCategory.classList.add('hidden');
    applyFilters();
}

// Aplicar todos los filtros
function applyFilters() {
    let filteredFiles = [...pdfFiles];
    
    // Filtrar por término de búsqueda
    if (currentFilter.search) {
        filteredFiles = filteredFiles.filter(file => 
            file.title.toLowerCase().includes(currentFilter.search) || 
            file.subtitle.toLowerCase().includes(currentFilter.search) || 
            file.content.toLowerCase().includes(currentFilter.search)
        );
    }
    
    // Filtrar por categoría
    if (currentFilter.category !== 'all') {
        filteredFiles = filteredFiles.filter(file => 
            file.category === currentFilter.category
        );
    }
    
    // Filtrar por año
    if (currentFilter.year !== 'all') {
        filteredFiles = filteredFiles.filter(file => 
            file.year === currentFilter.year
        );
    }
    
    // Ordenar resultados
    switch (currentFilter.sort) {
        case 'newest':
            filteredFiles.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredFiles.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'name-asc':
            filteredFiles.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            filteredFiles.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    renderPDFs(filteredFiles);
}

// Función para abrir visor de PDF
function openViewer(fileId) {
    const file = pdfFiles.find(file => file.id === fileId);
    if (!file) return;
    
    viewerTitle.textContent = file.title;
    pdfFrame.src = file.url;
    fileViewer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

// Función para cerrar visor de PDF
function closeViewer() {
    fileViewer.classList.add('hidden');
    pdfFrame.src = '';
    document.body.style.overflow = ''; // Restaurar scroll
}

// Función para descargar archivo
function downloadFile(fileId) {
    const file = pdfFiles.find(file => file.id === fileId);
    if (!file) return;
    
    // En un entorno real, se redireccionaría a la URL con atributos para descarga
    window.open(file.url, '_blank');
}

// Función para formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Toggle menú/submenú
function toggleSubmenu(e) {
    const menuItem = e.currentTarget;
    const parentLi = menuItem.parentElement;
    
    const isOpen = parentLi.classList.contains('open');
    
    // Cerrar todos los submenús abiertos
    document.querySelectorAll('.main-menu > li.open').forEach(item => {
        if (item !== parentLi) {
            item.classList.remove('open');
        }
    });
    
    // Abrir/cerrar el submenú actual
    parentLi.classList.toggle('open', !isOpen);
}

// Función para cambiar tema
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkMode', isDarkMode.toString());
    
    if (isDarkMode) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Función para poblar el filtro de años dinámicamente
function populateYearFilter() {
    const years = [...new Set(pdfFiles.map(file => file.year))].sort((a, b) => b - a);
    
    // Mantener la opción "Todos"
    filterYear.innerHTML = '<option value="all">Todos</option>';
    
    // Agregar opciones de años
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        filterYear.appendChild(option);
    });
}