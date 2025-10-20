import { renderPublishView } from './PublishView.js';

export async function renderNews(container, posts = null) {
  const apiUrl = import.meta.env.VITE_API_URL || ";
  let allPosts = [];
  if (!posts) {
    try {
      const response = await fetch(`${apiUrl}/api/posts`);
      if (response.ok) {
        allPosts = await response.json();
      } else {
        console.error("Error fetching posts:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  } else {
    allPosts = posts;
  }
  const newsPosts = allPosts.filter(post => post.category === 'noticias');
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: clamp(28px, 5vw, 36px); font-weight: 800; margin: 0 0 12px 0; color: var(--text);">
        📰 Noticias del Colegio
      </h1>
      <p style="color: var(--muted); font-size: clamp(16px, 3vw, 18px); margin: 0; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        Mantente informado sobre los eventos, logros y novedades de nuestra comunidad educativa
      </p>
      
      ${user.role === 'admin' ? `
        <div style="margin-top: 24px;">
          <button onclick="openPublishModal('noticias')" class="btn-publicar">
            📝 Nueva noticia
          </button>
        </div>
      ` : ''}
    </div>
  `;

  if (!newsPosts.length) {
    container.innerHTML += `
      <div style="text-align: center; padding: 60px 20px; color: var(--muted);">
        <div style="font-size: clamp(48px, 8vw, 64px); margin-bottom: 24px;">📰</div>
        <h2 style="font-size: clamp(20px, 4vw, 24px); margin-bottom: 16px;">No hay noticias disponibles</h2>
        <p style="font-size: clamp(14px, 3vw, 16px); max-width: 400px; margin: 0 auto;">Las noticias del colegio aparecerán aquí cuando estén disponibles</p>
        ${user.role === 'admin' ? `
          <button onclick="openPublishModal('noticias')" class="btn-publicar" style="margin-top: 20px;">
            📝 Crear primera noticia
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  // Sort by date (newest first)
  const sortedNews = [...newsPosts].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB - dateA;
  });

  // Featured news (first one) - Responsive
  const featuredNews = sortedNews[0];
  if (featuredNews) {
    container.innerHTML += `
      <div style="margin-bottom: 40px;">
        <h2 style="color: var(--text); margin-bottom: 20px; font-size: clamp(20px, 4vw, 24px); text-align: center;">⭐ Noticia Destacada</h2>
        <div id="featuredNewsCard" class="featured-news-card" style="
          background: linear-gradient(135deg, var(--card), var(--panel)); 
          border-radius: var(--radius); 
          padding: clamp(16px, 3vw, 24px); 
          border: 2px solid var(--accent); 
          box-shadow: var(--shadow-lg); 
          cursor: pointer; 
          transition: all var(--fast);
          overflow: hidden;
        ">
          <div style="
            display: grid; 
            grid-template-columns: minmax(0, 1fr); 
            gap: 24px; 
            align-items: center;
          " class="featured-content">
            <div class="post-media" style="
              height: clamp(200px, 30vw, 250px); 
              border-radius: var(--radius-sm); 
              overflow: hidden;
              width: 100%;
            ">
              ${renderNewsMedia(featuredNews)}
            </div>
            <div class="featured-text">
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
                <span style="background: var(--accent); color: var(--white); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">DESTACADA</span>
                <span style="background: rgba(37,99,235,0.1); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">NOTICIA</span>
              </div>
              <h3 style="font-size: clamp(20px, 4vw, 28px); margin: 0 0 16px 0; color: var(--text); font-weight: 700; line-height: 1.3;">${escapeHtml(featuredNews.title)}</h3>
              <p style="color: var(--muted); font-size: clamp(14px, 3vw, 16px); line-height: 1.6; margin: 0 0 16px 0;">
                ${escapeHtml((featuredNews.description || '').slice(0, 150))}${featuredNews.description && featuredNews.description.length > 150 ? '...' : ''}
              </p>
              <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; font-size: clamp(12px, 2.5vw, 14px);">
                <span style="color: var(--accent); font-weight: 600;">❤️ ${featuredNews.likes || 0}</span>
                <span style="color: var(--muted);">💬 ${(featuredNews.comments || []).length}</span>
                <span style="color: var(--muted);">📅 ${formatDate(featuredNews.createdAt || featuredNews.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add click listener and responsive behavior
    setTimeout(() => {
      const featuredCard = document.getElementById('featuredNewsCard');
      if (featuredCard) {
        // Make it responsive
        const featuredContent = featuredCard.querySelector('.featured-content');
        const updateLayout = () => {
          if (window.innerWidth > 768) {
            featuredContent.style.gridTemplateColumns = '400px 1fr';
          } else {
            featuredContent.style.gridTemplateColumns = '1fr';
          }
        };
        
        updateLayout();
        window.addEventListener('resize', updateLayout);
        
        featuredCard.addEventListener('click', () => {
          if (window.openPostDetail) window.openPostDetail(featuredNews.id);
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

  // Other news - Responsive Grid
  const otherNews = sortedNews.slice(1);
  if (otherNews.length > 0) {
    container.innerHTML += `
      <div>
        <h2 style="color: var(--text); margin-bottom: 20px; font-size: clamp(20px, 4vw, 24px); text-align: center;">📰 Más Noticias</h2>
        <div id="newsGrid" class="posts-grid responsive-grid"></div>
      </div>
    `;

    const newsGrid = container.querySelector('#newsGrid');
    
    // Make sure grid is responsive
    newsGrid.style.display = 'grid';
    newsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    newsGrid.style.gap = 'clamp(16px, 3vw, 32px)';
    newsGrid.style.marginTop = '32px';
    
    renderPublishView(newsGrid, otherNews);
  }

  // Add some additional responsive styles
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .featured-news-card .featured-content {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
      }
      
      .featured-news-card .post-media {
        height: 200px !important;
      }
      
      .responsive-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
    }
    
    @media (max-width: 480px) {
      .featured-news-card {
        padding: 16px !important;
      }
      
      .featured-news-card .post-media {
        height: 180px !important;
      }
    }
  `;
  
  if (!document.head.querySelector('#news-responsive-styles')) {
    style.id = 'news-responsive-styles';
    document.head.appendChild(style);
  }
}

function renderNewsMedia(post) {
  if (!post.image) {
    return `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg);color:var(--muted);flex-direction:column;">
        <div style="font-size: clamp(24px, 5vw, 32px); margin-bottom: 8px;">📰</div>
        <div style="font-size: clamp(12px, 2vw, 14px);">No hay imagen</div>
      </div>
    `;
  }

  if (post.type === 'video') {
    const embed = convertToEmbed(post.image);
    if (embed) {
      return `
        <iframe src="${escapeHtml(embed)}" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen 
                loading="lazy"
                style="border-radius: var(--radius-sm);"
                title="${escapeHtml(post.title)}"></iframe>
      `;
    } else {
      return `
        <video controls preload="metadata" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);">
          <source src="${escapeHtml(post.image)}" />
          Tu navegador no soporta video.
        </video>
      `;
    }
  }

  return `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" />`;
}

function convertToEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    
    // YouTube full or short
    if (host.includes('youtube.com')) {
      if (u.searchParams.get('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
      }
      if (u.pathname.includes('/embed/')) return url;
    }
    
    if (host.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    
    // Google Drive video preview
    if (host.includes('drive.google.com')) {
      const parts = url.split('/');
      const id = parts.find(p => p.length > 10 && !p.includes('drive.google.com'));
      if (id) return `https://drive.google.com/file/d/${id}/preview`;
      
      const m = url.match(/\/d\/([^\/]+)/);
      if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

// Global function to open publish modal
window.openPublishModal = window.openPublishModal || function(category = '') {
  import('./Publish.js').then(mod => {
    mod.renderPublish(document.body, (newPost) => {
      const cb = window.showToast || function(){};
      if (typeof cb === 'function') cb("📰 Noticia publicada correctamente", "success");
      setTimeout(() => location.reload(), 800);
    });
    if (category) {
      setTimeout(() => {
        const categorySelect = document.getElementById('pub-cat') || document.getElementById('pub-category');
        if (categorySelect) categorySelect.value = category;
      }, 120);
    }
  });
};

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