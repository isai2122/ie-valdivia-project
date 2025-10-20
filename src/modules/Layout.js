// src/modules/Layout.js

export function renderLayout(container, contentCallback) {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  container.innerHTML = `
    <header class="main-header">
      <div class="logo-section">
        <img src="${localStorage.getItem("schoolLogo") || "/assets/logo-default.png"}" alt="Logo IE Valdivia" id="school-logo" />
        <span class="site-title">IE Valdivia</span>
        ${user.role === 'admin' ? `<label class="edit-logo-label" title="Editar logo">
          Editar logo <input type="file" id="logo-upload" accept="image/*" hidden>
        </label>` : ''}
      </div>

      <nav class="nav-links">
        <button class="nav-btn active" data-page="home">Inicio</button>
        <button class="nav-btn" data-page="news">Noticias</button>
        <button class="nav-btn" data-page="projects">Proyectos</button>
        <button class="nav-btn" data-page="about">Sobre Nosotros</button>
        <button class="nav-btn" data-page="profile">Perfil</button>
      </nav>

      <div class="user-menu">
        <div class="user-avatar" id="userAvatar" title="${user.username ? `Hola, ${escapeHtml(user.username)}` : 'Usuario invitado'}">
          ${user.username ? escapeHtml(user.username[0].toUpperCase()) : "U"}
        </div>
        <div class="user-dropdown" id="userDropdown">
          ${user.username ?
            `<p><strong>${escapeHtml(user.username)}</strong></p>
             <p class="text-muted">Rol: ${escapeHtml(user.role)}</p>
             <button id="logout-btn" class="btn-cancelar">Cerrar sesión</button>` :
            `<p><strong>Visitante</strong></p>
             <p class="text-muted">Acceso restringido. Si eres administrador, inicia sesión desde Perfil.</p>
             <div style="display:flex;gap:8px;justify-content:flex-end">
               <button id="go-profile-btn" class="btn-publicar">Ir a Perfil</button>
             </div>`
          }
        </div>
      </div>
    </header>

    <main id="main-content" class="main-content"></main>
  `;

  // Cambiar logo (solo admin)
  const uploadInput = container.querySelector("#logo-upload");
  if (uploadInput) {
    uploadInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // límite prudente
      if (file.size > 2 * 1024 * 1024) {
        showToast("El archivo es muy grande. Máx 2MB.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const logoData = reader.result;
        const logoEl = document.getElementById("school-logo");
        if (logoEl) logoEl.src = logoData;
        localStorage.setItem("schoolLogo", logoData);
        showToast("Logo actualizado", "success");
      };
      reader.onerror = () => showToast("Error al cargar imagen", "error");
      reader.readAsDataURL(file);
    });
  }

  // Toggle user dropdown (avatar)
  const avatar = container.querySelector('#userAvatar');
  const dropdown = container.querySelector('#userDropdown');
  if (avatar) {
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      // abrir dropdown si hay contenido
      if (dropdown) dropdown.classList.toggle('show');
    });
  }

  // Si no hay sesión, botón lleva a la página de perfil (donde está el login)
  const goProfileBtn = container.querySelector('#go-profile-btn');
  if (goProfileBtn) {
    goProfileBtn.addEventListener('click', () => {
      if (dropdown) dropdown.classList.remove('show');
      contentCallback('profile');
      // asegurar que el botón de nav "perfil" quede activo visualmente
      container.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      const pbtn = container.querySelector('.nav-btn[data-page="profile"]');
      if (pbtn) pbtn.classList.add('active');
      // scroll arriba
      window.scrollTo(0, 0);
    });
  }

  // Logout button (solo si existe sesión)
  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!confirm('¿Cerrar sesión?')) return;
      localStorage.removeItem('user');
      if (dropdown) dropdown.classList.remove('show');
      showToast("Sesión cerrada", "success");
      setTimeout(() => location.reload(), 700);
    });
  }

  // Navigation handling
  container.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remover clase active de todos los botones
      container.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

      // Añadir clase active al botón clickeado
      btn.classList.add('active');

      // Cerrar modales y detener media
      closeAllModalsAndStopMedia();

      const page = btn.getAttribute("data-page");
      contentCallback(page);

      // Cerrar dropdown si está abierto
      if (dropdown) dropdown.classList.remove('show');

      // Scroll al top
      const main = document.getElementById("main-content");
      if (main) {
        main.scrollTop = 0;
        window.scrollTo(0, 0);
      }
    });
  });

  // Funciones helper internas
  function closeAllModalsAndStopMedia() {
    // Eliminar modales y overlays
    document.querySelectorAll('.modal, .publish-overlay, #bannerEditor').forEach(n => n.remove());

    // Parar vídeos/ sonidos
    document.querySelectorAll('video, audio').forEach(m => {
      try { m.pause(); m.currentTime = 0; } catch (e) { /* ignore */ }
    });

    // Cerrar dropdowns
    document.querySelectorAll('.user-dropdown.show, .social-dropdown.show, .menu-options.show').forEach(el => {
      el.classList.remove('show');
    });

    // ocultar search preview si existe
    document.querySelectorAll('#searchPreview.show').forEach(el => el.classList.remove('show'));
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
        toast.style.opacity = '0';
        toast.style.transition = 'opacity .28s';
        setTimeout(() => toast.remove(), 300);
      }
    }, 2500);
  }

  // Cargar la página inicial
  setTimeout(() => contentCallback("home"), 0);
}

// Helper para escapar HTML (prevención XSS en texto simple)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}