// src/modules/FloatingMenu.js - Menú flotante mejorado y organizado

export function renderFloatingMenu() {
  // Remove existing stack to avoid duplicates
  const existingStack = document.getElementById('fabStack');
  if (existingStack) existingStack.remove();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const stack = document.createElement('div');
  stack.id = 'fabStack';
  stack.className = 'fab-stack';
  document.body.appendChild(stack);

  // Main Social FAB (always visible) - Now the primary button
  const socialFab = document.createElement('button');
  socialFab.className = 'fab primary';
  socialFab.id = 'socialFab';
  socialFab.title = 'Redes Sociales';
  socialFab.innerHTML = '🌐';
  stack.appendChild(socialFab);

  // Social dropdown
  const socialDropdown = document.createElement('div');
  socialDropdown.id = 'socialDropdown';
  socialDropdown.className = 'social-dropdown';
  document.body.appendChild(socialDropdown);

  socialFab.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close other dropdowns
    document.querySelectorAll('.user-dropdown.show, .menu-options.show').forEach(el => {
      el.classList.remove('show');
    });
    socialDropdown.classList.toggle('show');
  });

  // Admin-only FABs (organized better)
  if (user.role === 'admin') {
    // Publish FAB
    const publishFab = document.createElement('button');
    publishFab.className = 'fab secondary';
    publishFab.id = 'publishFab';
    publishFab.title = 'Nueva Publicación';
    publishFab.innerHTML = '✏️';
    stack.appendChild(publishFab);

    publishFab.addEventListener('click', () => {
      import('./Publish.js').then(mod => {
        mod.renderPublish(document.body, (newPost) => {
          showToast("🚀 Publicación creada exitosamente", "success");
          
          // Refresh current view if needed
          setTimeout(() => {
            const currentPage = getCurrentActivePage();
            if (['home', 'news', 'projects'].includes(currentPage)) {
              location.reload();
            }
          }, 1500);
        });
      });
    });

    // Edit About FAB
    const editAboutFab = document.createElement('button');
    editAboutFab.className = 'fab secondary';
    editAboutFab.id = 'editAboutFab';
    editAboutFab.title = 'Editar Información Institucional';
    editAboutFab.innerHTML = '🏫';
    stack.appendChild(editAboutFab);

    editAboutFab.addEventListener('click', () => {
      import('./About.js').then(mod => {
        mod.openEditAboutModal();
      });
    });

    // Edit Banners FAB
    const editBannersFab = document.createElement('button');
    editBannersFab.className = 'fab secondary';
    editBannersFab.id = 'editBannersFab';
    editBannersFab.title = 'Editar Banners';
    editBannersFab.innerHTML = '🖼️';
    stack.appendChild(editBannersFab);

    editBannersFab.addEventListener('click', () => {
      openBannersEditor();
    });

    // Edit social networks FAB - now more subtle
    const editSocialFab = document.createElement('button');
    editSocialFab.className = 'fab alert';
    editSocialFab.id = 'editSocialFab';
    editSocialFab.title = 'Configurar Redes Sociales';
    editSocialFab.innerHTML = '⚙️';
    stack.appendChild(editSocialFab);

    editSocialFab.addEventListener('click', () => {
      openEditSocialsModal();
    });

    // Admin Panel FAB - Quick access to all admin functions
    const adminPanelFab = document.createElement('button');
    adminPanelFab.className = 'fab alert';
    adminPanelFab.id = 'adminPanelFab';
    adminPanelFab.title = 'Panel de Administración';
    adminPanelFab.innerHTML = '👤';
    stack.appendChild(adminPanelFab);

    adminPanelFab.addEventListener('click', () => {
      openAdminPanel();
    });
  }

  // Load and render social links
  renderSocialDropdown();
}

function renderSocialDropdown() {
  const dropdown = document.getElementById('socialDropdown');
  if (!dropdown) return;

  const socialLinks = JSON.parse(localStorage.getItem('socialLinks') || '[]');

  if (!socialLinks.length) {
    dropdown.innerHTML = `
      <div style="padding: 20px; text-align: center; color: var(--muted);">
        <div style="font-size: 32px; margin-bottom: 12px;">🌐</div>
        <h4 style="margin: 0 0 8px 0; color: var(--text);">Redes Sociales</h4>
        <p style="margin: 0; font-size: 14px;">No hay redes configuradas</p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: var(--muted);">Los administradores pueden agregar enlaces</p>
      </div>
    `;
    return;
  }

  dropdown.innerHTML = `
    <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 2px solid var(--border);">
      <div style="font-weight: 700; color: var(--text); font-size: 16px; text-align: center;">🌐 Síguenos en:</div>
    </div>
    ${socialLinks.map(link => `
      <a href="${escapeHtml(link.url)}" 
         target="_blank" 
         rel="noopener noreferrer"
         title="Visitar ${escapeHtml(link.name)}"
         style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-sm); transition: all var(--fast); text-decoration: none; color: var(--text); font-weight: 600;">
        <span style="font-size: 20px;">${getSocialIcon(link.name)}</span>
        <span>${escapeHtml(link.name)}</span>
        <span style="margin-left: auto; font-size: 12px; color: var(--muted);">↗️</span>
      </a>
    `).join('')}
    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); text-align: center;">
      <div style="font-size: 12px; color: var(--muted);">IE Valdivia © ${new Date().getFullYear()}</div>
    </div>
  `;

  // Add hover effects
  dropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.background = 'rgba(37,99,235,0.1)';
      link.style.transform = 'translateX(8px)';
    });
    link.addEventListener('mouseleave', () => {
      link.style.background = 'transparent';
      link.style.transform = 'translateX(0)';
    });
  });
}

function openAdminPanel() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== "admin") {
    showToast("❌ Solo los administradores pueden acceder al panel", "error");
    return;
  }

  // Remove existing modal
  const existingModal = document.getElementById('adminPanelModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "adminPanelModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h3 style="margin: 0; font-size: 24px; color: var(--text);">👤 Panel de Administración</h3>
        <button id="closeAdminPanel" class="btn-cancelar" style="padding: 8px 16px;">✕ Cerrar</button>
      </header>
      
      <div style="display: grid; gap: 16px;">
        <div style="background: rgba(37,99,235,0.1); padding: 16px; border-radius: var(--radius); border: 1px solid var(--border);">
          <h4 style="margin: 0 0 12px 0; color: var(--accent-light);">📝 Gestión de Contenido</h4>
          <div style="display: grid; gap: 8px;">
            <button class="btn-publicar admin-action-btn" data-action="publish">✏️ Nueva Publicación</button>
            
            <button class="btn-publicar admin-action-btn" data-action="about">🏫 Editar Información Institucional</button>
            <button class="btn-publicar admin-action-btn" data-action="changepw">🔑 Cambiar contraseña (admin)</button>
          </div>
        </div>

        <div style="background: rgba(37,99,235,0.1); padding: 16px; border-radius: var(--radius); border: 1px solid var(--border);">
          <h4 style="margin: 0 0 12px 0; color: var(--accent-light);">⚙️ Configuración</h4>
          <div style="display: grid; gap: 8px;">
            <button class="btn-publicar admin-action-btn" data-action="social">🌐 Configurar Redes Sociales</button>
            <button class="btn-publicar admin-action-btn" data-action="logo">📷 Cambiar Logo</button>
            <button class="btn-publicar admin-action-btn" data-action="stats">📊 Ver Estadísticas</button>
          </div>
        </div>

        <div style="background: rgba(220,38,38,0.1); padding: 16px; border-radius: var(--radius); border: 1px solid rgba(220,38,38,0.3);">
          <h4 style="margin: 0 0 12px 0; color: var(--danger);">🗂️ Gestión de Datos</h4>
          <div style="display: grid; gap: 8px;">
            <button class="btn-cancelar admin-action-btn" data-action="export">📤 Exportar Datos</button>
            <button class="btn-cancelar admin-action-btn" data-action="backup">💾 Crear Respaldo</button>
            <button class="btn-cancelar admin-action-btn" data-action="reset">🔄 Restablecer Contenido</button>
          </div>
        </div>
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid var(--border); text-align: center; color: var(--muted);">
        <p style="margin: 0; font-size: 14px;">Conectado como: <strong>${escapeHtml(user.username || 'Admin')}</strong></p>
        <p style="margin: 4px 0 0 0; font-size: 12px;">Panel de Administración - IE Valdivia</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('#closeAdminPanel').onclick = () => modal.remove();
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Action buttons
  modal.querySelectorAll('.admin-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      modal.remove();
      
      switch (action) {
        case 'publish':
          import('./Publish.js').then(mod => {
            mod.renderPublish(document.body, () => {
              showToast("✅ Publicación creada", "success");
              setTimeout(() => location.reload(), 1000);
            });
          });
          break;
        case 'banners':
          openBannersEditor();
          break;
        case 'about':
          import('./About.js').then(mod => {
            mod.openEditAboutModal();
          });
          break;
        case 'social':
          openEditSocialsModal();
          break;
        case 'logo':
          document.getElementById('logo-upload')?.click();
          break;
        case 'stats':
          showStats();
          break;
        case 'export':
          exportData();
          break;
        case 'backup':
          createBackup();
          break;
        case 'reset':
          resetContent();
          break;
      }
    });
  });
}

function openBannersEditor() {
  // Open the banner editor defined in src/modules/Banners.js
  import('./Banners.js').then(mod => {
    if (mod && typeof mod.openBannerModal === 'function') {
      mod.openBannerModal();
    } else {
      console.warn('openBannerModal not found in Banners.js');
      showToast("🖼️ Editor de banners no disponible", "error");
    }
  }).catch(err => {
    console.error('Error loading Banners module:', err);
    showToast("🖼️ Error al abrir el editor de banners", "error");
  });
}


function showStats() {
  const posts = JSON.parse(localStorage.getItem('posts') || '[]');
  const socialLinks = JSON.parse(localStorage.getItem('socialLinks') || '[]');
  
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <h3>📊 Estadísticas del Sitio</h3>
      <div style="display: grid; gap: 16px;">
        <div style="background: rgba(37,99,235,0.1); padding: 16px; border-radius: var(--radius); text-align: center;">
          <div style="font-size: 32px; font-weight: 700; color: var(--accent);">${posts.length}</div>
          <div>Publicaciones totales</div>
        </div>
        <div style="background: rgba(37,99,235,0.1); padding: 16px; border-radius: var(--radius); text-align: center;">
          <div style="font-size: 32px; font-weight: 700; color: var(--accent);">${posts.filter(p => p.category === 'noticias').length}</div>
          <div>Noticias</div>
        </div>
        <div style="background: rgba(37,99,235,0.1); padding: 16px; border-radius: var(--radius); text-align: center;">
          <div style="font-size: 32px; font-weight: 700; color: var(--accent);">${posts.filter(p => p.category === 'proyectos').length}</div>
          <div>Proyectos</div>
        </div>
        <div style="background: rgba(37,99,235,0.1); padding: 16px; border-radius: var(--radius); text-align: center;">
          <div style="font-size: 32px; font-weight: 700; color: var(--accent);">${socialLinks.length}</div>
          <div>Redes sociales configuradas</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <button class="btn-cancelar" onclick="this.closest('.modal').remove()">Cerrar</button>
      </div>
    </div>
  `;
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  document.body.appendChild(modal);
}

function exportData() {
  const data = {
    posts: JSON.parse(localStorage.getItem('posts') || '[]'),
    aboutContent: JSON.parse(localStorage.getItem('aboutContent') || '{}'),
    socialLinks: JSON.parse(localStorage.getItem('socialLinks') || '[]'),
    schoolLogo: localStorage.getItem('schoolLogo'),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ie-valdivia-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast("📤 Datos exportados exitosamente", "success");
}

function createBackup() {
  const backupKey = `backup_${Date.now()}`;
  const data = {
    posts: localStorage.getItem('posts'),
    aboutContent: localStorage.getItem('aboutContent'),
    socialLinks: localStorage.getItem('socialLinks'),
    schoolLogo: localStorage.getItem('schoolLogo'),
    date: new Date().toISOString()
  };
  
  localStorage.setItem(backupKey, JSON.stringify(data));
  showToast("💾 Respaldo creado exitosamente", "success");
}

function resetContent() {
  if (!confirm('⚠️ ¿Estás seguro de que quieres restablecer todo el contenido? Esta acción no se puede deshacer.')) return;
  
  if (!confirm('🚨 ÚLTIMA ADVERTENCIA: Se perderá TODO el contenido actual. ¿Continuar?')) return;
  
  // Clear all content
  localStorage.removeItem('posts');
  localStorage.removeItem('aboutContent');
  localStorage.removeItem('socialLinks');
  
  showToast("🔄 Contenido restablecido", "success");
  setTimeout(() => location.reload(), 1500);
}

function openEditSocialsModal() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== "admin") {
    showToast("❌ Solo los administradores pueden editar las redes sociales", "error");
    return;
  }

  // Remove existing modal
  const existingModal = document.getElementById('editSocialsModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "editSocialsModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h3 style="margin: 0; font-size: 24px; color: var(--text);">⚙️ Configurar Redes Sociales</h3>
        <button id="closeSocialsModal" class="btn-cancelar" style="padding: 8px 16px;">✕ Cerrar</button>
      </header>
      
      <div id="socialsList" style="margin-bottom: 24px;"></div>
      
      <div style="background: rgba(37,99,235,0.1); padding: 20px; border-radius: var(--radius); border: 1px solid var(--border);">
        <h4 style="margin-top: 0; color: var(--text);">➕ Agregar Nueva Red Social</h4>
        <div style="display: grid; gap: 16px;">
          <div>
            <label for="newSocialName">🏷️ Nombre de la red social</label>
            <input type="text" id="newSocialName" placeholder="Facebook, YouTube, Instagram, WhatsApp..." />
          </div>
          <div>
            <label for="newSocialUrl">🔗 URL completa</label>
            <input type="url" id="newSocialUrl" placeholder="https://facebook.com/tu-pagina" />
          </div>
          <div style="text-align: right;">
            <button id="addSocialBtn" class="btn-publicar">➕ Agregar Red</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('#closeSocialsModal').onclick = () => modal.remove();
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Load existing social networks
  renderSocialsList();

  // Add new social network
  modal.querySelector('#addSocialBtn').addEventListener('click', addNewSocial);
}

function renderSocialsList() {
  const listContainer = document.getElementById('socialsList');
  if (!listContainer) return;

  const socialLinks = JSON.parse(localStorage.getItem('socialLinks') || '[]');

  if (!socialLinks.length) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--muted); border: 2px dashed var(--border); border-radius: var(--radius);">
        <div style="font-size: 48px; margin-bottom: 16px;">🌐</div>
        <h4>No hay redes sociales configuradas</h4>
        <p>Agrega la primera red social usando el formulario de abajo</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = `
    <h4 style="margin-bottom: 16px; color: var(--text);">📋 Redes Sociales Actuales (${socialLinks.length})</h4>
    ${socialLinks.map((social, index) => `
      <div class="social-edit-item" style="display: flex; gap: 16px; align-items: center; padding: 16px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); margin-bottom: 12px; border: 1px solid var(--border);">
        <div style="font-size: 24px; flex-shrink: 0;">
          ${getSocialIcon(social.name)}
        </div>
        <div style="flex: 1; display: grid; gap: 8px;">
          <input type="text" value="${escapeHtml(social.name)}" 
                 placeholder="Nombre de la red..." 
                 data-index="${index}" 
                 class="social-name-input"
                 style="background: rgba(255,255,255,0.05);" />
          <input type="url" value="${escapeHtml(social.url)}" 
                 placeholder="https://..." 
                 data-index="${index}" 
                 class="social-url-input"
                 style="background: rgba(255,255,255,0.05);" />
        </div>
        <div>
          <button class="btn-cancelar" onclick="removeSocial(${index})" style="font-size: 14px; padding: 8px 16px;">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `).join('')}
  `;

  // Add event listeners for editing
  listContainer.querySelectorAll('.social-name-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      const socialLinks = JSON.parse(localStorage.getItem('socialLinks') || '[]');
      if (socialLinks[index]) {
        socialLinks[index].name = e.target.value.trim();
        localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
        renderSocialDropdown();
        renderSocialsList(); // Re-render to update icon
      }
    });
  });

  listContainer.querySelectorAll('.social-url-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      const socialLinks = JSON.parse(localStorage.getItem('socialLinks') || '[]');
      if (socialLinks[index]) {
        socialLinks[index].url = e.target.value.trim();
        localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
        renderSocialDropdown();
      }
    });
  });
}

function addNewSocial() {
  const nameInput = document.getElementById('newSocialName');
  const urlInput = document.getElementById('newSocialUrl');

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (!name || !url) {
    showToast("❌ Completa ambos campos", "error");
    return;
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    showToast("❌ URL inválida. Debe comenzar con http:// o https://", "error");
    return;
  }

  const socialLinks = JSON.parse(localStorage.getItem('socialLinks') || '[]');
  
  // Check for duplicates
  if (socialLinks.some(social => social.name.toLowerCase() === name.toLowerCase())) {
    showToast("❌ Ya existe una red social con ese nombre", "error");
    return;
  }

  socialLinks.push({ name, url });
  localStorage.setItem('socialLinks', JSON.stringify(socialLinks));

  // Clear form
  nameInput.value = '';
  urlInput.value = '';

  // Update UI
  renderSocialsList();
  renderSocialDropdown();

  showToast("✅ Red social agregada exitosamente", "success");
}

// Global function for removing social networks
window.removeSocial = function(index) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta red social?')) return;

  const socialLinks = JSON.parse(localStorage.getItem('socialLinks') || '[]');
  socialLinks.splice(index, 1);
  localStorage.setItem('socialLinks', JSON.stringify(socialLinks));

  renderSocialsList();
  renderSocialDropdown();

  showToast("🗑️ Red social eliminada", "success");
};

function getSocialIcon(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('facebook')) return '📘';
  if (lowerName.includes('instagram')) return '📷';
  if (lowerName.includes('youtube')) return '📺';
  if (lowerName.includes('twitter') || lowerName.includes('x.com')) return '🐦';
  if (lowerName.includes('linkedin')) return '💼';
  if (lowerName.includes('tiktok')) return '🎵';
  if (lowerName.includes('whatsapp')) return '💬';
  if (lowerName.includes('telegram')) return '✈️';
  if (lowerName.includes('discord')) return '🎮';
  if (lowerName.includes('github')) return '💻';
  if (lowerName.includes('email') || lowerName.includes('correo')) return '📧';
  if (lowerName.includes('web') || lowerName.includes('sitio')) return '🌍';
  
  return '🔗'; // Default icon
}

function getCurrentActivePage() {
  const activeBtn = document.querySelector('.nav-btn.active');
  return activeBtn ? activeBtn.getAttribute('data-page') : 'home';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  
  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, var(--danger), #b91c1c)';
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}
// Delegated handler for admin control buttons
(function attachAdminActions(){
  document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest('.admin-action-btn');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'publish') {
      import('./Publish.js').then(mod => { if (mod.openPublishModal) mod.openPublishModal(); });
    } else if (action === 'about') {
      import('./About.js').then(mod => { if (mod.openEditAboutModal) mod.openEditAboutModal(); });
    } else if (action === 'social') {
      // handled elsewhere
    } else if (action === 'changepw') {
      import('./ChangePassword.js').then(mod => { if (mod.openChangePasswordModal) mod.openChangePasswordModal(); });
    }
  });
})();
