/**
 * Profile page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    // Initialize profile editing
    initializeProfileEditing();
    
    // Initialize profile image upload
    initializeImageUpload();
    
    // Initialize activity chart
    initializeActivityChart();
    
    // Load recent activity
    loadRecentActivity();
}

function initializeProfileEditing() {
    const editInfoBtn = document.getElementById('edit-info');
    const saveInfoBtn = document.getElementById('save-info');
    const cancelEditBtn = document.getElementById('cancel-edit-info');
    const infoForm = document.getElementById('info-form');
    
    if (editInfoBtn && saveInfoBtn && cancelEditBtn && infoForm) {
        // Store original form values
        let originalValues = {};
        
        // Edit button click
        editInfoBtn.addEventListener('click', function() {
            // Store original values
            const inputs = infoForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                originalValues[input.id] = input.value;
                input.disabled = false;
            });
            
            // Show save and cancel buttons, hide edit button
            saveInfoBtn.style.display = 'block';
            cancelEditBtn.style.display = 'block';
            editInfoBtn.style.display = 'none';
        });
        
        // Cancel button click
        cancelEditBtn.addEventListener('click', function() {
            // Restore original values
            const inputs = infoForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.value = originalValues[input.id];
                input.disabled = true;
            });
            
            // Hide save and cancel buttons, show edit button
            saveInfoBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';
            editInfoBtn.style.display = 'block';
        });
        
        // Save button click
        saveInfoBtn.addEventListener('click', function() {
            // Update profile info
            updateProfileInfo();
            
            // Disable inputs
            const inputs = infoForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.disabled = true;
            });
            
            // Hide save and cancel buttons, show edit button
            saveInfoBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';
            editInfoBtn.style.display = 'block';
            
            // Show success notification
            showNotification('Perfil actualizado correctamente', 'success');
        });
    }
}

function updateProfileInfo() {
    // Get form values
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const departamento = document.getElementById('departamento').value;
    const posicion = document.getElementById('posicion').value;
    
    // Update profile info
    const profileName = document.querySelector('.profile-name');
    const profilePosition = document.querySelector('.profile-position');
    const profileDepartment = document.querySelector('.profile-department');
    
    if (profileName && profilePosition && profileDepartment) {
        profileName.textContent = `Dr. ${nombre} ${apellido}`;
        profilePosition.textContent = posicion;
        profileDepartment.textContent = departamento;
    }
    
    // Update user menu
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = `Dr. ${nombre} ${apellido}`;
    }
}

function initializeImageUpload() {
    const uploadBtn = document.getElementById('upload-image-btn');
    const profileImage = document.querySelector('.profile-image');
    
    if (uploadBtn && profileImage) {
        uploadBtn.addEventListener('click', function() {
            // In a real app, this would open a file picker
            // For demo purposes, we'll just change the image
            const randomId = Math.floor(Math.random() * 100);
            profileImage.src = `https://randomuser.me/api/portraits/men/${randomId}.jpg`;
            
            // Update user menu avatar
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.src = profileImage.src;
            }
            
            showNotification('Imagen de perfil actualizada', 'success');
        });
    }
}

function initializeActivityChart() {
    const ctx = document.getElementById('activityChart');
    
    if (ctx) {
        // Sample data
        const data = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [
                {
                    label: 'Documentos',
                    data: [5, 3, 7, 4, 6, 8, 5, 3, 9, 6, 4, 7],
                    backgroundColor: 'rgba(74, 111, 220, 0.2)',
                    borderColor: 'rgba(74, 111, 220, 1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Publicaciones',
                    data: [2, 1, 0, 1, 3, 1, 0, 2, 1, 2, 1, 2],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        };
        
        // Create chart
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Actividad anual'
                    }
                }
            }
        });
    }
}

function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    
    if (activityList) {
        // Sample activities
        const activities = [
            {
                icon: 'fa-file-alt',
                title: 'Subiste un nuevo documento',
                description: 'Programa de estudio - Matemáticas avanzadas',
                time: '2 horas'
            },
            {
                icon: 'fa-comment',
                title: 'Comentaste en un documento',
                description: 'Investigación sobre Machine Learning',
                time: '1 día'
            },
            {
                icon: 'fa-share-alt',
                title: 'Compartiste un documento',
                description: 'Conferencia: Inteligencia Artificial y Ética',
                time: '2 días'
            },
            {
                icon: 'fa-edit',
                title: 'Editaste un documento',
                description: 'Datos de investigación 2023',
                time: '3 días'
            },
            {
                icon: 'fa-folder-plus',
                title: 'Creaste una nueva carpeta',
                description: 'Artículos',
                time: '1 semana'
            }
        ];
        
        // Add activities to list
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">Hace ${activity.time}</div>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
    }
}