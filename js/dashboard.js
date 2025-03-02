class DashboardManager {
    constructor() {
        // DOM Elements
        this.elements = {
            menuToggle: document.getElementById('menuToggle'),
            sidebar: document.getElementById('sidebar'),
            dropdownMenu: document.getElementById('dropdownMenu'),
            overlay: document.getElementById('overlay'),
            mainContent: document.querySelector('.main-content'),
            themeToggle: document.getElementById('themeToggle'),
            themeIcon: document.getElementById('themeIcon'),
            submenuToggles: document.querySelectorAll('.toggle-submenu'),
            menuItems: document.querySelectorAll('.menu-item'),
            searchInput: document.getElementById('searchInput'),
            searchButton: document.getElementById('searchButton')
        };

        // State
        this.state = {
            isMenuOpen: false,
            isSidebarOpen: false,
            activeSubmenus: new Set()
        };

        // Bind methods
        this.handleMenuToggle = this.handleMenuToggle.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        this.handleEdgeDoubleClick = this.handleEdgeDoubleClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.handleSubmenuToggle = this.handleSubmenuToggle.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleStorageChange = this.handleStorageChange.bind(this);
    }

    init() {
        try {
            this.validateElements();
            this.initializeTheme();
            this.attachEventListeners();
            this.initializeSubmenuHandlers();
            this.setupWindowResizeHandler();
            this.initializeSearchFunctionality();
            
            // Añadir detector de cambios en localStorage para sincronización entre pestañas
            window.addEventListener('storage', this.handleStorageChange);
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
        }
    }

    validateElements() {
        // Validate required DOM elements
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element && !['submenuToggles', 'menuItems'].includes(key)) {
                throw new Error(`Required element "${key}" not found in the DOM`);
            }
        }
    }

    initializeTheme() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.applyTheme(isDarkMode);
    }

    applyTheme(isDarkMode) {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        document.body.classList.toggle('dark-theme', isDarkMode);
        if (this.elements.themeIcon) {
            this.elements.themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    handleStorageChange(event) {
        if (event.key === 'darkMode') {
            const isDarkMode = event.newValue === 'true';
            this.applyTheme(isDarkMode);
        }
    }

    setupWindowResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(this.handleWindowResize, 250);
        });
    }

    handleWindowResize() {
        const isMobile = window.innerWidth < 768;
        if (isMobile && this.state.isSidebarOpen) {
            this.closeSidebar();
        }
    }

    attachEventListeners() {
        // Menu and sidebar event listeners
        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', this.handleMenuToggle);
        }
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', this.handleOverlayClick);
        }
        document.addEventListener('dblclick', this.handleEdgeDoubleClick);
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', this.handleThemeToggle);
        }

        // Sidebar hover functionality
        if (this.elements.sidebar) {
            this.elements.sidebar.addEventListener('mouseenter', () => {
                if (!this.state.isSidebarOpen && window.innerWidth >= 768) {
                    this.elements.sidebar.style.left = '0';
                }
            });

            this.elements.sidebar.addEventListener('mouseleave', () => {
                if (!this.state.isSidebarOpen && window.innerWidth >= 768) {
                    this.elements.sidebar.style.left = `calc(-1 * (var(--sidebar-width) - 10px))`;
                }
            });
        }
    }

    initializeSubmenuHandlers() {
        if (this.elements.submenuToggles) {
            this.elements.submenuToggles.forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleSubmenuToggle(toggle);
                });
            });
        }

        if (this.elements.menuItems) {
            this.elements.menuItems.forEach(item => {
                const link = item.querySelector('a');
                if (link) {
                    link.addEventListener('click', () => {
                        if (window.innerWidth < 768 && this.state.isMenuOpen) {
                            this.closeMenu();
                        }
                    });
                }
            });
        }
    }

    initializeSearchFunctionality() {
        if (this.elements.searchButton) {
            this.elements.searchButton.addEventListener('click', this.handleSearch);
        }
        
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
    }

    handleSearch() {
        const searchTerm = this.elements.searchInput.value.trim();
        
        if (!searchTerm) return;
        
        // Redirect to the search results page with the term as a query parameter
        window.location.href = `/busqueda?q=${encodeURIComponent(searchTerm)}`;
    }

    handleSubmenuToggle(toggle) {
        // Toggle the active class on the chevron icon
        toggle.classList.toggle('active');
        
        // Find and toggle the submenu
        const menuItem = toggle.closest('.menu-item');
        const submenu = menuItem.nextElementSibling;
        
        if (submenu && submenu.classList.contains('submenu')) {
            const isOpen = submenu.classList.contains('active');
            
            // Close all other submenus in the same level
            const siblingSubmenus = menuItem.parentElement.querySelectorAll('.submenu');
            siblingSubmenus.forEach(menu => {
                menu.classList.remove('active');
                menu.style.maxHeight = null;
                const icon = menu.previousElementSibling.querySelector('.toggle-submenu');
                if (icon) icon.classList.remove('active');
            });
            
            // Toggle the clicked submenu
            if (!isOpen) {
                submenu.classList.add('active');
                submenu.style.maxHeight = submenu.scrollHeight + "px";
            }
        }
    }

    handleMenuToggle() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        if (this.elements.dropdownMenu) {
            this.elements.dropdownMenu.classList.toggle('active');
        }
        
        if (this.state.isSidebarOpen) {
            this.closeSidebar();
        }
        
        this.toggleOverlay();
    }

    handleOverlayClick() {
        if (this.state.isMenuOpen) {
            this.closeMenu();
        }
        if (this.state.isSidebarOpen) {
            this.closeSidebar();
        }
        this.hideOverlay();
    }

    handleEdgeDoubleClick(event) {
        const EDGE_THRESHOLD = 20;
        
        if (event.clientX < EDGE_THRESHOLD) {
            this.state.isSidebarOpen = !this.state.isSidebarOpen;
            if (this.elements.sidebar) {
                this.elements.sidebar.classList.toggle('active');
            }
            if (this.elements.mainContent) {
                this.elements.mainContent.classList.toggle('shifted');
            }
            
            if (this.state.isMenuOpen) {
                this.closeMenu();
            }
            
            this.toggleOverlay();
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Escape') {
            if (this.state.isMenuOpen) {
                this.closeMenu();
            }
            if (this.state.isSidebarOpen) {
                this.closeSidebar();
            }
            this.hideOverlay();
        }
    }

    handleThemeToggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const isDarkMode = currentTheme !== 'dark';
        this.applyTheme(isDarkMode);
        localStorage.setItem('darkMode', isDarkMode.toString());
    }

    closeMenu() {
        if (this.elements.dropdownMenu) {
            this.elements.dropdownMenu.classList.remove('active');
        }
        this.state.isMenuOpen = false;
    }

    closeSidebar() {
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.remove('active');
        }
        if (this.elements.mainContent) {
            this.elements.mainContent.classList.remove('shifted');
        }
        this.state.isSidebarOpen = false;
    }

    toggleOverlay() {
        if (this.elements.overlay) {
            this.elements.overlay.classList.toggle('active');
        }
    }

    hideOverlay() {
        if (this.elements.overlay) {
            this.elements.overlay.classList.remove('active');
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardManager();
    dashboard.init();
});