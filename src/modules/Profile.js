// src/modules/Profile.js
export function renderProfile(container, user) {
  const isLoggedIn = user && user.username;

  if (!isLoggedIn) {
    // Not logged in - show guest profile
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 96px; margin-bottom: 24px;">🎓</div>
        <h1 style="font-size: 36px; font-weight: 800; margin: 0 0 16px 0; color: var(--text);">
          Perfil de Usuario
        </h1>
        <p style="color: var(--muted); font-size: 18px; margin: 0 0 32px 0; max-width: 500px; margin: 0 auto 32px auto;">
          Accede a tu cuenta para personalizar tu experiencia y acceder a funciones exclusivas
        </p>
        
        <div style="background: linear-gradient(135deg, var(--card), var(--panel)); border-radius: var(--radius); padding: 32px; border: 1px solid var(--border); max-width: 400px; margin: 0 auto; box-shadow: var(--shadow);">
          <h3 style="margin-top: 0; color: var(--text);">🔑 Iniciar Sesión</h3>
          <p style="color: var(--muted); margin-bottom: 24px;">
            Inicia sesión para acceder a todas las funcionalidades del portal educativo
          </p>
          <button id="open-login-btn" class="btn-publicar" style="width: 100%; font-size: 16px;">
            🚀 Iniciar Sesión
          </button>
        </div>
        
        <div style="margin-top: 40px; padding: 24px; background: rgba(255,255,255,0.03); border-radius: var(--radius); border: 1px solid var(--border); max-width: 600px; margin: 40px auto 0;">
          <h4 style="margin-top: 0; color: var(--text);">🎯 ¿Qué puedes hacer al iniciar sesión?</h4>
          <div style="display: grid; gap: 16px; text-align: left;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="font-size: 24px;">💬</span>
              <div>
                <strong style="color: var(--text);">Comentar publicaciones</strong>
                <div style="color: var(--muted); font-size: 14px;">Participa en conversaciones sobre noticias y proyectos</div>
              </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="font-size: 24px;">❤️</span>
              <div>
                <strong style="color: var(--text);">Dar "me gusta"</strong>
                <div style="color: var(--muted); font-size: 14px;">Muestra tu apoyo a los contenidos que te interesan</div>
              </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="font-size: 24px;">🔔</span>
              <div>
                <strong style="color: var(--text);">Recibir notificaciones</strong>
                <div style="color: var(--muted); font-size: 14px;">Mantente al día con las últimas actualizaciones</div>
              </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="font-size: 24px;">👨‍💼</span>
              <div>
                <strong style="color: var(--text);">Funciones de administrador</strong>
                <div style="color: var(--muted); font-size: 14px;">Si eres admin: crear, editar y gestionar contenido</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Handle login button
    container.querySelector("#open-login-btn").onclick = () => {
      import("./login.js").then(mod => {
        mod.renderLogin(container);
      });
    };
    return;
  }

  // Logged in - show full profile
  const loginTime = user.loginTime ? new Date(user.loginTime) : null;
  const isAdmin = user.role === 'admin';
  
  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-2)); display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 800; margin-bottom: 20px; box-shadow: var(--shadow-lg); border: 4px solid var(--white);">
          ${escapeHtml(user.avatar || user.username[0].toUpperCase())}
        </div>
        <h1 style="font-size: 36px; font-weight: 800; margin: 0 0 8px 0; color: var(--text);">
          ${isAdmin ? '👨‍💼' : '🎓'} ${escapeHtml(user.username)}
        </h1>
        <div style="color: var(--muted); font-size: 18px;">
          ${isAdmin ? 'Administrador del Sistema' : 'Miembro de la Comunidad'}
        </div>
        ${loginTime ? `
          <div style="color: var(--muted); font-size: 14px; margin-top: 8px;">
            🕒 Última sesión: ${formatDate(user.loginTime)}
          </div>
        ` : ''}
      </div>

      <div style="display: grid; gap: 24px;">
        <!-- User Stats -->
        <div style="background: linear-gradient(135deg, var(--card), var(--panel)); border-radius: var(--radius); padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow);">
          <h3 style="margin-top: 0; color: var(--text); display: flex; align-items: center; gap: 8px;">
            <span>📊</span> Tu Actividad
          </h3>
          ${renderUserStats(user)}
        </div>

        <!-- Admin Panel -->
        ${isAdmin ? `
          <div style="background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(29,78,216,0.05)); border-radius: var(--radius); padding: 24px; border: 2px solid var(--accent); box-shadow: var(--shadow);">
            <h3 style="margin-top: 0; color: var(--text); display: flex; align-items: center; gap: 8px;">
              <span>⚙️</span> Panel de Administración
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <button onclick="openPublishModal()" class="admin-action-btn">
                <span style="font-size: 24px;">✏️</span>
                <div>
                  <strong>Nueva Publicación</strong>
                  <div>Crear contenido</div>
                </div>
              </button>
              <button onclick="openBannerEditor()" class="admin-action-btn">
                <span style="font-size: 24px;">🖼️</span>
                <div>
                  
                  <div>Gestionar carrusel</div>
                </div>
              </button>
              <button onclick="openSocialEditor()" class="admin-action-btn">
                <span style="font-size: 24px;">🌐</span>
                <div>
                  <strong>Redes Sociales</strong>
                  <div>Configurar enlaces</div>
                </div>
              </button>
              <button onclick="showUserManagement()" class="admin-action-btn">
                <span style="font-size: 24px;">👥</span>
                <div>
                  <strong>Gestión</strong>
                  <div>Ver estadísticas</div>
                </div>
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Account Settings -->
        <div style="background: linear-gradient(135deg, var(--card), var(--panel)); border-radius: var(--radius); padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow);">
          <h3 style="margin-top: 0; color: var(--text); display: flex; align-items: center; gap: 8px;">
            <span>⚙️</span> Configuración de Cuenta
          </h3>
          <div style="display: grid; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm);">
              <div>
                <strong style="color: var(--text);">Nombre de Usuario</strong>
                <div style="color: var(--muted); font-size: 14px;">Tu identificador único en el sistema</div>
              </div>
              <div style="color: var(--accent-light); font-weight: 600;">
                ${escapeHtml(user.username)}
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm);">
              <div>
                <strong style="color: var(--text);">Tipo de Cuenta</strong>
                <div style="color: var(--muted); font-size: 14px;">Nivel de acceso y permisos</div>
              </div>
              <div style="background: ${isAdmin ? 'var(--accent)' : 'var(--success)'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ${isAdmin ? '👨‍💼 Administrador' : '🎓 Usuario'}
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm);">
              <div>
                <strong style="color: var(--text);">Estado de Sesión</strong>
                <div style="color: var(--muted); font-size: 14px;">Sesión actual activa</div>
              </div>
              <div style="background: var(--success); color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                🟢 Conectado
              </div>
            </div>
          </div>
        </div>

        <!-- Logout Section -->
        <div style="text-align: center; padding: 24px; background: rgba(220,38,38,0.1); border-radius: var(--radius); border: 1px solid rgba(220,38,38,0.2);">
          <h4 style="margin-top: 0; color: var(--text);">🚪 Cerrar Sesión</h4>
          <p style="color: var(--muted); margin-bottom: 20px;">
            ¿Deseas cerrar tu sesión actual? Perderás el acceso a las funciones exclusivas.
          </p>
          <button id="profile-logout-btn" class="btn-cancelar" style="font-size: 16px;">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  `;

  // Add admin action button styles
  const adminStyles = `
    <style>
      .admin-action-btn {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 16px;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--fast);
        color: var(--text);
        text-align: left;
      }
      
      .admin-action-btn:hover {
        background: rgba(37,99,235,0.1);
        border-color: var(--accent);
        transform: translateY(-2px);
      }
      
      .admin-action-btn strong {
        display: block;
        margin-bottom: 4px;
      }
      
      .admin-action-btn div div {
        font-size: 14px;
        color: var(--muted);
      }
    </style>
  `;
  
  if (!document.querySelector('#admin-profile-styles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'admin-profile-styles';
    styleEl.innerHTML = adminStyles;
    document.head.appendChild(styleEl);
  }

  // Handle logout
  container.querySelector("#profile-logout-btn").onclick = () => {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      localStorage.removeItem("user");
      showToast("👋 Sesión cerrada correctamente", "success");
      setTimeout(() => location.reload(), 1000);
    }
  };
}

function renderUserStats(user) {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const userPosts = posts.filter(post => post.author === user.username || (user.role === 'admin'));
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments || []).length, 0);
  
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
      <div style="text-align: center; padding: 16px; background: rgba(37,99,235,0.1); border-radius: var(--radius-sm); border: 1px solid rgba(37,99,235,0.2);">
        <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
        <div style="font-size: 24px; font-weight: 700; color: var(--text);">${posts.length}</div>
        <div style="color: var(--muted); font-size: 14px;">Publicaciones Totales</div>
      </div>
      
      <div style="text-align: center; padding: 16px; background: rgba(220,38,38,0.1); border-radius: var(--radius-sm); border: 1px solid rgba(220,38,38,0.2);">
        <div style="font-size: 32px; margin-bottom: 8px;">❤️</div>
        <div style="font-size: 24px; font-weight: 700; color: var(--text);">${totalLikes}</div>
        <div style="color: var(--muted); font-size: 14px;">Me Gusta Totales</div>
      </div>
      
      <div style="text-align: center; padding: 16px; background: rgba(16,163,74,0.1); border-radius: var(--radius-sm); border: 1px solid rgba(16,163,74,0.2);">
        <div style="font-size: 32px; margin-bottom: 8px;">💬</div>
        <div style="font-size: 24px; font-weight: 700; color: var(--text);">${totalComments}</div>
        <div style="color: var(--muted); font-size: 14px;">Comentarios Totales</div>
      </div>
      
      ${user.role === 'admin' ? `
        <div style="text-align: center; padding: 16px; background: rgba(147,51,234,0.1); border-radius: var(--radius-sm); border: 1px solid rgba(147,51,234,0.2);">
          <div style="font-size: 32px; margin-bottom: 8px;">⚙️</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--text);">Admin</div>
          <div style="color: var(--muted); font-size: 14px;">Permisos Completos</div>
        </div>
      ` : ''}
    </div>
  `;
}

// Global functions for admin actions
window.openPublishModal = function() {
  import('./Publish.js').then(mod => {
    mod.renderPublish(document.body, (newPost) => {
      showToast("🚀 Publicación creada exitosamente", "success");
    });
  });
};

window.openBannerEditor = function() {
  import('./Banners.js').then(mod => {
    mod.openBannerModal();
  });
};

window.openSocialEditor = function() {
  import('./FloatingMenu.js').then(mod => {
    // The openEditSocialsModal is not exported, so we'll call it differently
    const event = new CustomEvent('openSocialEditor');
    document.dispatchEvent(event);
  });
  
  // Direct call to render social editor
  setTimeout(() => {
    const editBtn = document.getElementById('editSocialFab');
    if (editBtn) {
      editBtn.click();
    } else {
      // Fallback: create and trigger social editor manually
      showToast("🌐 Abriendo editor de redes sociales...", "success");
      import('./FloatingMenu.js').then(() => {
        // Call the function after import
        if (window.openEditSocials) {
          window.openEditSocials();
        }
      });
    }
  }, 100);
};

window.showUserManagement = function() {
  showToast("📊 Función de gestión en desarrollo", "success");
  // This could be expanded to show user management features
};

function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '';
  }
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