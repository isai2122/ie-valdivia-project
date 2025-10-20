import { renderPublishView } from './PublishView.js';

export function renderProjects(container, posts = null) {
  const allPosts = posts || JSON.parse(localStorage.getItem("posts") || "[]");
  const projectPosts = allPosts.filter(post => post.category === 'proyectos');
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: clamp(28px, 5vw, 36px); font-weight: 800; margin: 0 0 12px 0; color: var(--text);">
        🚀 Proyectos Estudiantiles
      </h1>
      <p style="color: var(--muted); font-size: clamp(16px, 3vw, 18px); margin: 0; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        Descubre los proyectos e investigaciones desarrollados por nuestros estudiantes
      </p>
      
      ${user.role === 'admin' ? `
        <div style="margin-top: 24px;">
          <button onclick="openPublishModal('proyectos')" class="btn-publicar">
            🚀 Nuevo proyecto
          </button>
        </div>
      ` : ''}
    </div>
  `;

  if (!projectPosts.length) {
    container.innerHTML += `
      <div style="text-align: center; padding: 60px 20px; color: var(--muted);">
        <div style="font-size: clamp(48px, 8vw, 64px); margin-bottom: 24px;">🚀</div>
        <h2 style="font-size: clamp(20px, 4vw, 24px); margin-bottom: 16px;">No hay proyectos disponibles</h2>
        <p style="font-size: clamp(14px, 3vw, 16px); max-width: 400px; margin: 0 auto;">Los proyectos estudiantiles aparecerán aquí cuando estén disponibles</p>
        ${user.role === 'admin' ? `
          <button onclick="openPublishModal('proyectos')" class="btn-publicar" style="margin-top: 20px;">
            🚀 Crear primer proyecto
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  // Sort by date (newest first)
  const sortedProjects = [...projectPosts].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB - dateA;
  });

  // Featured project (first one) - Responsive
  const featuredProject = sortedProjects[0];
  if (featuredProject) {
    container.innerHTML += `
      <div style="margin-bottom: 40px;">
        <h2 style="color: var(--text); margin-bottom: 20px; font-size: clamp(20px, 4vw, 24px); text-align: center;">⭐ Proyecto Destacado</h2>
        <div id="featuredProjectCard" class="featured-project-card" style="
          background: linear-gradient(135deg, var(--card), var(--panel)); 
          border-radius: var(--radius); 
          padding: clamp(16px, 3vw, 24px); 
          border: 2px solid var(--accent); 
          box-shadow: var(--shadow-lg); 
          cursor: pointer; 
          transition: all var(--fast);
          overflow: hidden;
        ">
          ${renderFeaturedProject(featuredProject)}
        </div>
      </div>
    `;

    setTimeout(() => {
      const featuredCard = document.getElementById('featuredProjectCard');
      if (featuredCard) {
        featuredCard.addEventListener('click', () => {
          if (window.openPostDetail) window.openPostDetail(featuredProject.id);
        });
        
        featuredCard.addEventListener('mouseenter', () => {
          featuredCard.style.transform = 'translateY(-4px)';
          featuredCard.style.boxShadow = 'var(--shadow-lg), 0 0 30px rgba(37,99,235,0.2)';
        });
        
        featuredCard.addEventListener('mouseleave', () => {
          featuredCard.style.transform = 'translateY(0)';
          featuredCard.style.boxShadow = 'var(--shadow-lg)';
        });
      }
    }, 20);
  }

  // Build categories (smart classification) - All responsive
  const categories = categorizeProjects(sortedProjects.slice(1)); // Exclude featured
  const categoryOrder = ['science', 'technology', 'arts', 'social', 'other'];
  
  categoryOrder.forEach(catKey => {
    const list = categories[catKey];
    if (!list.length) return;

    const titleMap = {
      science: '🔬 Ciencias',
      technology: '💻 Tecnología',
      arts: '🎨 Arte y Cultura',
      social: '🌍 Proyectos Sociales',
      other: '📚 Otros Proyectos'
    };

    const section = document.createElement('div');
    section.style.marginBottom = '40px';
    section.innerHTML = `
      <h2 style="
        color: var(--text); 
        margin-bottom: 20px; 
        font-size: clamp(20px, 4vw, 24px); 
        text-align: center;
        padding: 12px 20px;
        background: rgba(37,99,235,0.1);
        border-radius: var(--radius);
        border: 1px solid var(--border);
      ">
        ${titleMap[catKey] || catKey} (${list.length})
      </h2>
      <div class="posts-grid responsive-projects-grid" id="${catKey}Grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: clamp(16px, 3vw, 32px);
        margin-top: 24px;
      "></div>
    `;
    container.appendChild(section);

    const grid = section.querySelector(`#${catKey}Grid`);
    renderPublishView(grid, list);
  });

  // Add responsive styles for projects
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .featured-project-card .featured-content {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
      }
      
      .featured-project-card .post-media {
        height: 200px !important;
      }
      
      .responsive-projects-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
    }
    
    @media (max-width: 480px) {
      .featured-project-card {
        padding: 16px !important;
      }
      
      .featured-project-card .post-media {
        height: 180px !important;
      }
    }
  `;
  
  if (!document.head.querySelector('#projects-responsive-styles')) {
    style.id = 'projects-responsive-styles';
    document.head.appendChild(style);
  }
}

function categorizeProjects(projects) {
  const categories = {
    science: [],
    technology: [],
    arts: [],
    social: [],
    other: []
  };

  projects.forEach((project) => {
    const title = (project.title || '').toLowerCase();
    const description = (project.description || '').toLowerCase();
    const content = `${title} ${description}`;

    if (/ciencia|biolog|química|física|matemát|experimento|laboratorio|investigación/.test(content)) {
      categories.science.push(project);
    } else if (/tecnolog|programa|app|software|web|robot|código|digital|informática/.test(content)) {
      categories.technology.push(project);
    } else if (/arte|música|teatro|danza|pintura|cultura|creatividad|diseño/.test(content)) {
      categories.arts.push(project);
    } else if (/social|comunidad|solidario|historia|geografía|ambiente|ecología|sostenible/.test(content)) {
      categories.social.push(project);
    } else {
      categories.other.push(project);
    }
  });

  return categories;
}

function renderFeaturedProject(project) {
  return `
    <div class="featured-content" style="
      display: grid; 
      grid-template-columns: minmax(0, 1fr); 
      gap: 24px; 
      align-items: center;
    ">
      <div class="post-media" style="
        height: clamp(200px, 30vw, 250px); 
        border-radius: var(--radius-sm); 
        overflow: hidden;
        width: 100%;
      ">
        ${renderProjectMedia(project)}
      </div>
      <div class="featured-text">
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
          <span style="background: var(--accent); color: var(--white); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">DESTACADO</span>
          <span style="background: rgba(37,99,235,0.1); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">PROYECTO</span>
        </div>
        <h3 style="font-size: clamp(20px, 4vw, 28px); margin: 0 0 16px 0; color: var(--text); font-weight: 700; line-height: 1.3;">${escapeHtml(project.title)}</h3>
        <p style="color: var(--muted); font-size: clamp(14px, 3vw, 16px); line-height: 1.6; margin: 0 0 16px 0;">
          ${escapeHtml((project.description || '').slice(0, 150))}${project.description && project.description.length > 150 ? '...' : ''}
        </p>
        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; font-size: clamp(12px, 2.5vw, 14px);">
          <span style="color: var(--accent); font-weight: 600;">❤️ ${project.likes || 0}</span>
          <span style="color: var(--muted);">💬 ${(project.comments || []).length}</span>
          <span style="color: var(--muted);">📅 ${formatDate(project.createdAt || project.updatedAt)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderProjectMedia(project) {
  if (!project.image) {
    return `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg);color:var(--muted);flex-direction:column;">
        <div style="font-size: clamp(24px, 5vw, 32px); margin-bottom: 8px;">🚀</div>
        <div style="font-size: clamp(12px, 2vw, 14px);">No hay multimedia</div>
      </div>
    `;
  }

  if (project.type === 'video') {
    const embed = convertToEmbed(project.image);
    if (embed) {
      return `
        <iframe src="${escapeHtml(embed)}" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allowfullscreen 
                loading="lazy" 
                style="border-radius: var(--radius-sm);"
                title="${escapeHtml(project.title)}"></iframe>
      `;
    } else {
      return `
        <video controls preload="metadata" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);">
          <source src="${escapeHtml(project.image)}" />
          Tu navegador no soporta video.
        </video>
      `;
    }
  }

  return `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" />`;
}

function convertToEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    
    if (host.includes('youtube.com')) {
      if (u.searchParams.get('v')) return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
      if (u.pathname.includes('/embed/')) return url;
    }
    
    if (host.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    
    if (host.includes('drive.google.com')) {
      const m = url.match(/\/d\/([^\/]+)/);
      if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
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

// Global function to open publish modal
window.openPublishModal = window.openPublishModal || function(category = '') {
  import('./Publish.js').then(mod => {
    mod.renderPublish(document.body, (newPost) => {
      const cb = window.showToast || (() => {});
      cb("🚀 Proyecto publicado correctamente", "success");
      setTimeout(() => location.reload(), 800);
    });
    if (category) {
      setTimeout(() => {
        const sel = document.getElementById('pub-cat') || document.getElementById('pub-category');
        if (sel) sel.value = category;
      }, 120);
    }
  });
};

// Make responsive adjustments on window resize
window.addEventListener('resize', () => {
  // Update featured project layout
  const featuredContent = document.querySelector('.featured-project-card .featured-content');
  if (featuredContent) {
    if (window.innerWidth > 768) {
      featuredContent.style.gridTemplateColumns = '400px 1fr';
    } else {
      featuredContent.style.gridTemplateColumns = '1fr';
    }
  }
});