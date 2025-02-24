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
            menuItems: document.querySelectorAll('.menu-item')
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
    }

    init() {
        try {
            this.validateElements();
            this.initializeTheme();
            this.attachEventListeners();
            this.initializeSubmenuHandlers();
            this.setupWindowResizeHandler();
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
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.elements.themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
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
        this.elements.menuToggle.addEventListener('click', this.handleMenuToggle);
        this.elements.overlay.addEventListener('click', this.handleOverlayClick);
        document.addEventListener('dblclick', this.handleEdgeDoubleClick);
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', this.handleThemeToggle);

        // Sidebar hover functionality
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

    initializeSubmenuHandlers() {
        this.elements.submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleSubmenuToggle(toggle);
            });
        });

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
        this.elements.dropdownMenu.classList.toggle('active');
        
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
            this.elements.sidebar.classList.toggle('active');
            this.elements.mainContent.classList.toggle('shifted');
            
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
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    closeMenu() {
        this.elements.dropdownMenu.classList.remove('active');
        this.state.isMenuOpen = false;
    }

    closeSidebar() {
        this.elements.sidebar.classList.remove('active');
        this.elements.mainContent.classList.remove('shifted');
        this.state.isSidebarOpen = false;
    }

    toggleOverlay() {
        this.elements.overlay.classList.toggle('active');
    }

    hideOverlay() {
        this.elements.overlay.classList.remove('active');
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardManager();
    dashboard.init();
});