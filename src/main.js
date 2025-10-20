// src/main.js
import './style.css';
import { renderLayout } from "./modules/Layout.js";
import { renderHome } from "./modules/Home.js";
import { renderNews } from "./modules/News.js";
import { renderProjects } from "./modules/Projects.js";
import { renderAbout } from "./modules/About.js";
import { renderProfile } from "./modules/Profile.js";
import { renderFloatingMenu } from "./modules/FloatingMenu.js";
import { setupBannerSection } from "./modules/Banners.js";

const app = document.getElementById("root");

// Inicialización principal - NO forzar login
function initializeApp() {
  let allPosts = JSON.parse(localStorage.getItem("posts") || "[]");

  // Renderizar layout principal
  renderLayout(app, (page) => {
    const main = document.getElementById("main-content");
    if (!main) return;
    main.innerHTML = "";

    // Cerrar dropdowns y modales al cambiar página
    document.querySelectorAll('.user-dropdown.show, .social-dropdown.show, .menu-options.show').forEach(el => {
      el.classList.remove('show');
    });
    document.querySelectorAll('#searchPreview.show').forEach(el => {
      el.classList.remove('show');
    });

    // Routing de páginas
    switch (page) {
      case "home":
        renderHome(main);
        break;
      case "news":
        renderNews(main, allPosts);
        break;
      case "projects":
        renderProjects(main, allPosts);
        break;
      case "about":
        renderAbout(main);
        break;
      case "profile": {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        renderProfile(main, user);
        break;
      }
      case "publish":
        // Importar dinámicamente y abrir modal
        import("./modules/Publish.js").then(mod => {
          mod.renderPublish(document.body, (newPost) => {
            // Actualizar posts locales
            allPosts.unshift(newPost);
            localStorage.setItem("posts", JSON.stringify(allPosts));
    // trigger cross-tab and same-tab update
    localStorage.setItem('posts_update_ts', Date.now().toString());
    window.dispatchEvent(new Event('app:postsUpdated'));
            
            // Toast de confirmación
            showToast("✅ Publicación creada exitosamente", "success");
            
            // Refrescar vista actual si es necesario
            const currentPage = getCurrentPage();
            if (currentPage === 'news' || currentPage === 'projects' || currentPage === 'home') {
              setTimeout(() => {
                const main = document.getElementById("main-content");
                if (main) {
                  switch (currentPage) {
                    case 'home':
                      renderHome(main);
                      break;
                    case 'news':
                      renderNews(main, allPosts);
                      break;
                    case 'projects':
                      renderProjects(main, allPosts);
                      break;
                  }
                }
              }, 100);
            }
          });
        });
        break;
      default:
        renderHome(main);
        break;
    }

    // marcar nav activo
    document.querySelectorAll(".nav-btn").forEach(btn => {
      const p = btn.getAttribute("data-page");
      if (p === page) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    // Renderizar menú flotante después de cargar página (pasamos container por compatibilidad)
    setTimeout(() => {
      try {
        renderFloatingMenu(document.getElementById("main-content"));
      } catch (err) {
        console.warn("Error al renderizar floating menu:", err);
        renderFloatingMenu();
      }
      // Inicializar banners DESPUÉS de que la página haya creado el contenedor #bannerSection
      try {
        setupBannerSection();
      } catch (err) {
        console.warn("Error al inicializar banners:", err);
      }
    }, 120);
  });
}

// Función helper para mostrar toast
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  
  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, var(--danger), #b91c1c)';
  }
  
  document.body.appendChild(toast);
  
  // Auto-remover después de 3 segundos
  setTimeout(() => {
    if (toast.parentNode) {
      // animación de salida (si no existe, se elimina igual)
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.28s';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

// Helper para obtener página actual
function getCurrentPage() {
  const activeBtn = document.querySelector('.nav-btn.active');
  return activeBtn ? activeBtn.getAttribute('data-page') : 'home';
}

// Cerrar modales con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Cerrar modales
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
    
    // Cerrar dropdowns
    document.querySelectorAll('.user-dropdown.show, .social-dropdown.show, .menu-options.show').forEach(el => {
      el.classList.remove('show');
    });
    
    // Cerrar search preview
    document.querySelectorAll('#searchPreview.show').forEach(el => {
      el.classList.remove('show');
    });
  }
});

// Cerrar dropdowns al hacer click fuera
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu')) {
    document.querySelectorAll('.user-dropdown.show').forEach(el => {
      el.classList.remove('show');
    });
  }
  
  if (!e.target.closest('#floatingSocialBtn') && !e.target.closest('.social-dropdown')) {
    document.querySelectorAll('.social-dropdown.show').forEach(el => {
      el.classList.remove('show');
    });
  }
  
  if (!e.target.closest('.post-menu')) {
    document.querySelectorAll('.menu-options.show').forEach(el => {
      el.classList.remove('show');
    });
  }
  
  if (!e.target.closest('#globalSearchBar')) {
    document.querySelectorAll('#searchPreview.show').forEach(el => {
      el.classList.remove('show');
    });
  }
});

// Inicializar la aplicación
initializeApp();
// Initialize cross-tab sync
import('./modules/Sync.js');
