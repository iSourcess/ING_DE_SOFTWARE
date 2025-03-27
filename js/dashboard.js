// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // Initialize theme toggle functionality from common.js
    document.addEventListener('DOMContentLoaded', () => {
        initializeThemeToggle();
    });

    // Submenu Toggle
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const submenu = item.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                submenu.classList.toggle('open');
                const chevron = item.querySelector('.submenu-toggle i');
                chevron.classList.toggle('fa-chevron-right');
                chevron.classList.toggle('fa-chevron-down');
            }
        });
    });

    // File Explorer Enhanced Functionality
    const explorerContent = document.getElementById('explorer-content');
    const folderItems = document.querySelectorAll('.folder-item');
    const breadcrumb = document.querySelector('.breadcrumb');
    const explorerSearch = document.querySelector('.explorer-search input');
    const sortButton = document.querySelector('.explorer-actions .action-btn');

    // Improved file and folder management
    class FileExplorer {
        constructor() {
            this.items = [];
            this.contextMenu = null;
            this.currentPath = ['Inicio'];
            this.rootItems = []; // Store the initial root items
            this.sortOptions = [
                { name: 'Nombre (A-Z)', method: this.sortByName },
                { name: 'Nombre (Z-A)', method: this.sortByNameReverse },
                { name: 'Fecha de creación (más reciente)', method: this.sortByNewest },
                { name: 'Fecha de creación (más antigua)', method: this.sortByOldest },
                { name: 'Tamaño (mayor a menor)', method: this.sortBySizeDescending },
                { name: 'Cantidad de archivos', method: this.sortByFileCount }
            ];
        }

        // Sorting methods
        sortByName(a, b) {
            return a.name.localeCompare(b.name);
        }

        sortByNameReverse(a, b) {
            return b.name.localeCompare(a.name);
        }

        sortByNewest(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }

        sortByOldest(a, b) {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }

        sortBySizeDescending(a, b) {
            return b.size - a.size;
        }

        sortByFileCount(a, b) {
            return b.fileCount - a.fileCount;
        }

        // Render items
        renderItems(items) {
            explorerContent.innerHTML = '';
            items.forEach(item => {
                const itemElement = this.createItemElement(item);
                explorerContent.appendChild(itemElement);
            });
        }

        createItemElement(item) {
            const itemElement = document.createElement('div');
            itemElement.classList.add(item.type === 'folder' ? 'folder-item' : 'file-item');
            
            const iconClass = item.type === 'folder' 
                ? 'fas fa-folder' 
                : this.getFileIcon(item.extension);
            
            itemElement.innerHTML = `
                <div class="${item.type}-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="${item.type}-details">
                    <div class="${item.type}-name">${item.name}</div>
                    <div class="file-meta">
                        ${item.type === 'folder' 
                            ? `${item.fileCount} elementos` 
                            : `${item.extension.toUpperCase()} • ${(item.size / 1024).toFixed(1)} KB`}
                    </div>
                </div>
            `;

            // Remove previous action buttons and add context menu
            itemElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, item);
            });

            itemElement.addEventListener('click', () => this.handleItemClick(item));
            return itemElement;
        }

        showContextMenu(event, item) {
            // Remove any existing context menu
            if (this.contextMenu) {
                this.contextMenu.remove();
            }

            // Create context menu
            this.contextMenu = document.createElement('div');
            this.contextMenu.classList.add('context-menu');
            
            // Context menu items based on item type
            const menuItems = [
                { 
                    label: 'Vista previa', 
                    icon: 'fas fa-eye', 
                    action: () => this.previewItem(item) 
                },
                { 
                    label: 'Renombrar', 
                    icon: 'fas fa-edit', 
                    action: () => this.renameItem(item) 
                },
                { 
                    label: 'Eliminar', 
                    icon: 'fas fa-trash', 
                    action: () => this.deleteItem(item) 
                }
            ];

            // Render menu items
            this.contextMenu.innerHTML = menuItems.map(menuItem => `
                <div class="context-menu-item">
                    <i class="${menuItem.icon} context-menu-icon"></i>
                    ${menuItem.label}
                </div>
            `).join('');

            // Position the context menu
            this.contextMenu.style.position = 'fixed';
            this.contextMenu.style.top = `${event.clientY}px`;
            this.contextMenu.style.left = `${event.clientX}px`;

            // Add event listeners to menu items
            const menuItemElements = this.contextMenu.querySelectorAll('.context-menu-item');
            menuItemElements.forEach((el, index) => {
                el.addEventListener('click', () => {
                    menuItems[index].action();
                    this.removeContextMenu();
                });
            });

            // Append to body
            document.body.appendChild(this.contextMenu);

            // Remove context menu when clicking outside
            const removeContextMenu = (e) => {
                if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                    this.removeContextMenu();
                    document.removeEventListener('click', removeContextMenu);
                }
            };
            document.addEventListener('click', removeContextMenu);
        }

        removeContextMenu() {
            if (this.contextMenu) {
                this.contextMenu.remove();
                this.contextMenu = null;
            }
        }

        getFileIcon(extension) {
            switch(extension.toLowerCase()) {
                case 'pdf': return 'fas fa-file-pdf';
                case 'docx':
                case 'doc': return 'fas fa-file-word';
                case 'xlsx':
                case 'xls': return 'fas fa-file-excel';
                case 'pptx':
                case 'ppt': return 'fas fa-file-powerpoint';
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'gif': return 'fas fa-file-image';
                default: return 'fas fa-file-alt';
            }
        }

        handleItemClick(item) {
            if (item.type === 'folder') {
                this.navigateToFolder(item);
            } else {
                this.openFile(item);
            }
        }

        navigateToFolder(folder) {
            this.currentPath.push(folder.name);
            this.updateBreadcrumb();
            
            // Simulated folder contents (would be fetched from backend in real scenario)
            const simulatedFolderContents = [
                { 
                    name: 'Documento ejemplo.pdf', 
                    type: 'file', 
                    extension: 'pdf', 
                    size: 2400, 
                    createdAt: new Date('2023-01-15') 
                },
                { 
                    name: 'Presentación.pptx', 
                    type: 'file', 
                    extension: 'pptx', 
                    size: 5200, 
                    createdAt: new Date('2023-02-20') 
                }
            ];

            this.renderItems(simulatedFolderContents);
        }

        updateBreadcrumb() {
            breadcrumb.innerHTML = this.currentPath.map((pathItem, index) => `
                <span${index === this.currentPath.length - 1 ? ' class="current"' : ''} 
                      data-index="${index}"
                      class="breadcrumb-item">
                    ${pathItem}
                </span>
                ${index < this.currentPath.length - 1 ? '<span class="separator">/</span>' : ''}
            `).join('');

            // Add click event to breadcrumb items for navigation
            const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
            breadcrumbItems.forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    this.navigateToBreadcrumbIndex(index);
                });
            });
        }

        navigateToBreadcrumbIndex(index) {
            // Trim the current path to the selected index
            this.currentPath = this.currentPath.slice(0, index + 1);
            this.updateBreadcrumb();

            // Render items based on the navigation level
            if (index === 0) {
                // Return to root
                this.renderItems(this.rootItems);
            } else {
                // Simulate navigating to a specific folder
                const simulatedFolderContents = [
                    { 
                        name: 'Documento ejemplo.pdf', 
                        type: 'file', 
                        extension: 'pdf', 
                        size: 2400, 
                        createdAt: new Date('2023-01-15') 
                    }
                ];
                this.renderItems(simulatedFolderContents);
            }
        }

        openFile(file) {
            // Implement file preview logic
            console.log('Opening file:', file);
        }

        previewItem(item) {
            const filePreview = document.getElementById('filePreview');
            const previewTitle = document.getElementById('previewTitle');
            const previewInfo = document.getElementById('previewInfo');
            const previewImg = document.getElementById('previewImg');
            const closePreview = document.getElementById('closePreview');

            previewTitle.textContent = item.name;
            previewInfo.textContent = `${item.extension.toUpperCase()} • ${(item.size / 1024).toFixed(1)} KB • Subido el ${item.createdAt.toLocaleDateString()}`;
            
            // Show preview based on file type
            if (['jpg', 'jpeg', 'png', 'gif'].includes(item.extension.toLowerCase())) {
                // For images, show the image preview
                previewImg.src = `path/to/images/${item.name}`; // Replace with actual path
                previewImg.style.display = 'block';
            } else {
                // For other file types, hide the image preview
                previewImg.style.display = 'none';
            }
            
            // Show the preview modal
            filePreview.style.opacity = '1';
            filePreview.style.pointerEvents = 'auto';
            
            // Close preview when close button is clicked
            closePreview.addEventListener('click', () => {
                filePreview.style.opacity = '0';
                filePreview.style.pointerEvents = 'none';
            });
        }
        
        deleteItem(item) {
            if (confirm(`¿Estás seguro de que deseas eliminar "${item.name}"?`)) {
                // In a real implementation, this would send a delete request to the backend
                console.log(`Deleting ${item.type}: ${item.name}`);
                
                // Remove the item from the current display
                this.items = this.items.filter(i => i.name !== item.name);
                this.renderItems(this.items);
            }
        }
        
        renameItem(item) {
            const newName = prompt(`Renombrar ${item.type === 'folder' ? 'carpeta' : 'archivo'}:`, item.name);
            if (newName && newName.trim() !== '') {
                // In a real implementation, this would send a rename request to the backend
                console.log(`Renaming ${item.type} from "${item.name}" to "${newName}"`);
                
                // Update the item name in the current display
                const itemToUpdate = this.items.find(i => i.name === item.name);
                if (itemToUpdate) {
                    itemToUpdate.name = newName;
                    this.renderItems(this.items);
                }
            }
        }

        searchItems(query) {
            const filteredItems = this.items.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            this.renderItems(filteredItems);
        }

        showSortOptions() {
            const sortMenu = document.createElement('div');
            sortMenu.classList.add('context-menu');
            sortMenu.innerHTML = this.sortOptions.map(option => 
                `<div class="context-menu-item">${option.name}</div>`
            ).join('');
            
            document.body.appendChild(sortMenu);
            
            // Position the menu near the sort button
            const buttonRect = sortButton.getBoundingClientRect();
            sortMenu.style.top = `${buttonRect.bottom + window.scrollY}px`;
            sortMenu.style.left = `${buttonRect.left + window.scrollX}px`;
            
            // Add event listeners to menu items
            const menuItems = sortMenu.querySelectorAll('.context-menu-item');
            menuItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.items.sort(this.sortOptions[index].method.bind(this));
                    this.renderItems(this.items);
                    sortMenu.remove();
                });
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!sortMenu.contains(e.target) && e.target !== sortButton) {
                    sortMenu.remove();
                }
            }, { once: true });
        }
    }

    // Initialize file explorer
    const fileExplorer = new FileExplorer();
    
    // Initial data (would be fetched from backend in real scenario)
    fileExplorer.items = [
        { 
            name: 'Documentos', 
            type: 'folder', 
            fileCount: 5, 
            createdAt: new Date('2023-01-10') 
        },
        { 
            name: 'Imágenes', 
            type: 'folder', 
            fileCount: 12, 
            createdAt: new Date('2023-02-15') 
        },
        { 
            name: 'Informe.pdf', 
            type: 'file', 
            extension: 'pdf', 
            size: 1024, 
            createdAt: new Date('2023-03-20') 
        }
    ];
    
    // Store root items for navigation
    fileExplorer.rootItems = [...fileExplorer.items];
    
    // Render initial items
    fileExplorer.renderItems(fileExplorer.items);
    
    // Update breadcrumb
    fileExplorer.updateBreadcrumb();
    
    // Set up event listeners
    if (explorerSearch) {
        explorerSearch.addEventListener('input', (e) => {
            fileExplorer.searchItems(e.target.value);
        });
    }
    
    if (sortButton) {
        sortButton.addEventListener('click', () => {
            fileExplorer.showSortOptions();
        });
    }

    // Create Folder Dialog
    const createFolderBtn = document.getElementById('createFolderBtn');
    const createFolderDialog = document.getElementById('createFolderDialog');
    const closeFolderDialog = document.getElementById('closeFolderDialog');
    const cancelFolder = document.getElementById('cancelFolder');
    const confirmFolder = document.getElementById('confirmFolder');
    const folderNameInput = document.getElementById('folderName');

    createFolderBtn.addEventListener('click', () => {
        createFolderDialog.style.display = 'flex';
    });

    [closeFolderDialog, cancelFolder].forEach(el => {
        el.addEventListener('click', () => {
            createFolderDialog.style.display = 'none';
            folderNameInput.value = '';
        });
    });

    confirmFolder.addEventListener('click', () => {
        const folderName = folderNameInput.value.trim();
        if (folderName) {
            const newFolder = {
                name: folderName,
                type: 'folder',
                fileCount: 0,
                createdAt: new Date()
            };
            fileExplorer.items.push(newFolder);
            fileExplorer.renderItems(fileExplorer.items);
            createFolderDialog.style.display = 'none';
            folderNameInput.value = '';
        }
    });

    // File Upload Functionality
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadProgress = document.getElementById('uploadProgress');

    uploadBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.addEventListener('change', handleFileUpload);
        fileInput.click();
    });

    function handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            uploadProgress.style.display = 'block';
            
            // Simulate upload progress
            let progress = 0;
            const progressBar = uploadProgress.querySelector('.progress-fill');
            const progressText = uploadProgress.querySelector('.upload-percentage');
            
            const uploadInterval = setInterval(() => {
                progress += 10;
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(uploadInterval);
                    setTimeout(() => {
                        uploadProgress.style.display = 'none';
                        addUploadedFilesToExplorer(files);
                    }, 500);
                }
            }, 200);
        }
    }

    function addUploadedFilesToExplorer(files) {
        for (let file of files) {
            const ext = file.name.split('.').pop().toLowerCase();
            const newFile = {
                name: file.name,
                type: 'file',
                extension: ext,
                size: file.size,
                createdAt: new Date()
            };
            fileExplorer.items.push(newFile);
        }
        fileExplorer.renderItems(fileExplorer.items);
    }

    // Notification Functionality
    const notificationToggle = document.getElementById('notification-toggle');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationList = document.getElementById('notification-list');
    const markAllRead = document.querySelector('.mark-all-read');

    notificationToggle.addEventListener('click', () => {
        notificationPanel.classList.toggle('open');
    });

    // Mock notification data
    const notifications = [
        { title: 'Nueva tarea asignada', description: 'Revisión de artículo de investigación', time: 'Hace 10 min' },
        { title: 'Reunión programada', description: 'Reunión de departamento a las 2 PM', time: 'Hace 30 min' },
        { title: 'Archivo compartido', description: 'Dr. María García compartió un documento', time: 'Hace 1 hora' }
    ];

    function loadNotifications() {
        notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item">
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-description">${notification.description}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                <button class="mark-read">Marcar como leído</button>
            </div>
        `).join('');

        const markReadButtons = document.querySelectorAll('.mark-read');
        markReadButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.notification-item').remove();
                updateNotificationCount();
            });
        });
    }

    markAllRead.addEventListener('click', () => {
        notificationList.innerHTML = '';
        updateNotificationCount();
    });

    function updateNotificationCount() {
        const notificationCount = document.getElementById('notification-count');
        const remainingNotifications = notificationList.children.length;
        notificationCount.textContent = remainingNotifications;
    }

    // Initial load of notifications
    loadNotifications();
});