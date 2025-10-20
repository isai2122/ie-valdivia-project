// src/modules/Home.js
export function renderHome(container) {
  const user = JSON.parse(localStorage.getItem("user")) || { role: "visitante" };
  const allPosts = JSON.parse(localStorage.getItem("posts") || "[]");

  container.innerHTML = `
    <div id="globalSearchBar">
      <input id="globalSearchInput" placeholder=" Buscar noticias, proyectos o contenido..." />
      <button id="globalSearchBtn">Buscar</button>
      <div id="searchPreview"></div>
    </div>
    
    <div id="bannerSection"></div>
    
    <section class="featured-section">
      <h2 style="text-align: center; margin: 40px 0 30px 0; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, var(--accent-light), var(--white)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        ✨ Contenido Destacado
      </h2>
      <div class="posts-grid" id="featuredGrid"></div>
    </section>
  `;

  // Setup search functionality
  setupGlobalSearch(container, allPosts);
  
  // Render featured posts
  renderFeaturedPosts(container, allPosts);
}

function setupGlobalSearch(container, allPosts) {
  const input = container.querySelector('#globalSearchInput');
  const preview = container.querySelector('#searchPreview');
  const searchBtn = container.querySelector('#globalSearchBtn');
  let searchTimeout;

  // Live search preview while typing
  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = input.value.trim().toLowerCase();
    
    if (!query) {
      preview.classList.remove('show');
      preview.innerHTML = '';
      return;
    }

    // Debounce search to avoid too many updates
    searchTimeout = setTimeout(() => {
      const hits = allPosts.filter(post => 
        (post.title + ' ' + (post.description || '') + ' ' + (post.category || '')).toLowerCase().includes(query)
      ).slice(0, 5);

      if (!hits.length) {
        preview.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted);">📭 No se encontraron resultados</div>';
        preview.classList.add('show');
        return;
      }

      preview.innerHTML = hits.map(post => `
        <div class="search-preview-item" data-id="${post.id}">
          <div class="search-preview-thumb">
            ${renderPreviewMedia(post)}
            ${post.type === 'video' ? '<div class="play">▶️</div>' : ''}
          </div>
          <div class="search-preview-info">
            <div class="search-preview-title">${escapeHtml(post.title)}</div>
            <div class="search-preview-meta"> ${escapeHtml(post.category)} • ${post.type === 'video' ? '🎬' : '🖼️'} ${escapeHtml(post.type)}</div>
            <div style="color: var(--muted); font-size: 14px; margin-top: 8px;">
              ${escapeHtml((post.description || '').slice(0, 100))}${post.description && post.description.length > 100 ? '...' : ''}
            </div>
          </div>
        </div>
      `).join('');
      
      preview.classList.add('show');

      // Add click handlers to preview items
      preview.querySelectorAll('.search-preview-item').forEach(item => {
        item.addEventListener('click', () => {
          const postId = Number(item.dataset.id);
          const post = allPosts.find(p => p.id === postId);
          if (post) {
            preview.classList.remove('show');
            input.value = '';
            openPostDetail(post);
          }
        });
      });
    }, 300);
  });

  // Full search on Enter or button click
  const performFullSearch = () => {
    const query = input.value.trim().toLowerCase();
    if (!query) return;

    const hits = allPosts.filter(post => 
      (post.title + ' ' + (post.description || '') + ' ' + (post.category || '')).toLowerCase().includes(query)
    );

    // Replace content with search results
    const featuredSection = container.querySelector('.featured-section');
    if (featuredSection) {
      featuredSection.innerHTML = `
        <h2 style="text-align: center; margin: 40px 0 30px 0; font-size: 32px; font-weight: 800; color: var(--text);">
           Resultados para: "${escapeHtml(query)}"
        </h2>
        <div class="posts-grid" id="searchResults"></div>
        <div style="text-align: center; margin-top: 30px;">
          <button id="clearSearch" class="btn-cancelar">🔄 Mostrar todo el contenido</button>
        </div>
      `;

      const resultsGrid = featuredSection.querySelector('#searchResults');
      
      if (!hits.length) {
        resultsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--muted);">
            <div style="font-size: 64px; margin-bottom: 20px;">📭</div>
            <h3>No se encontraron resultados</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        `;
      } else {
        renderPostCards(resultsGrid, hits);
      }

      // Clear search button
      featuredSection.querySelector('#clearSearch').addEventListener('click', () => {
        input.value = '';
        preview.classList.remove('show');
        renderFeaturedPosts(container, allPosts);
      });
    }

    preview.classList.remove('show');
  };

  searchBtn.addEventListener('click', performFullSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performFullSearch();
    }
  });
}

function renderFeaturedPosts(container, allPosts) {
  const featuredGrid = container.querySelector('#featuredGrid');
  if (!featuredGrid) return;

  // Reset the featured section
  const featuredSection = container.querySelector('.featured-section');
  featuredSection.innerHTML = `
    <h2 style="text-align: center; margin: 40px 0 30px 0; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, var(--accent-light), var(--white)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
      ✨ Contenido Destacado
    </h2>
    <div class="posts-grid" id="featuredGrid"></div>
  `;

  const newGrid = featuredSection.querySelector('#featuredGrid');
  const featuredPosts = allPosts.slice(0, 6); // Show top 6 posts

  if (!featuredPosts.length) {
    newGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--muted);">
        <div style="font-size: 64px; margin-bottom: 20px;">📋</div>
        <h3>Aún no hay contenido</h3>
        <p>Sé el primero en crear una publicación</p>
      </div>
    `;
    return;
  }

  renderPostCards(newGrid, featuredPosts);
}

function renderPostCards(container, posts) {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  
  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML = `
      ${user.role === 'admin' ? `
        <div class="post-menu">
          <button class="menu-btn" title="Opciones">⋯</button>
          <ul class="menu-options">
            
            <li class="danger" onclick="deletePost(${post.id})">🗑️ Eliminar</li>
          </ul>
        </div>
      ` : ''}
      
      <div class="post-media">
        ${renderPostMedia(post)}
        ${post.type === 'video' ? '<div class="media-overlay">🎬 Video</div>' : ''}
      </div>
      
      <h3 class="post-title">${escapeHtml(post.title)}</h3>
      <div class="post-desc">${escapeHtml((post.description || '').slice(0, 150))}${post.description && post.description.length > 150 ? '...' : ''}</div>
      
      <div class="meta-row">
        <div class="post-actions">
          <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
            ❤️ ${post.likes || 0}
          </button>
          <button class="action-btn" onclick="openPostDetail(${post.id})">
            💬 Ver más
          </button>
        </div>
        <div class="text-muted" style="font-size: 14px;">
           ${escapeHtml(post.category || 'General')}
        </div>
      </div>
    `;

    // Handle menu toggles
    const menuBtn = card.querySelector('.menu-btn');
    const menuOptions = card.querySelector('.menu-options');
    if (menuBtn && menuOptions) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close other menus
        document.querySelectorAll('.menu-options.show').forEach(menu => {
          if (menu !== menuOptions) menu.classList.remove('show');
        });
        menuOptions.classList.toggle('show');
      });
    }

    // Handle card click to open detail
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.post-menu') && !e.target.closest('.action-btn')) {
        openPostDetail(post);
      }
    });

    container.appendChild(card);
  });
}

function renderPostMedia(post) {
  if (!post.image) {
    return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--bg); color: var(--muted);">📄 Sin imagen</div>';
  }

  if (post.type === 'video') {
    if (post.image.includes('youtube.com') || post.image.includes('youtu.be')) {
      // Extract video ID and create thumbnail
      const videoId = extractYouTubeVideoId(post.image);
      if (videoId) {
        return `<img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="${escapeHtml(post.title)}" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'" / onClick={editPost(${post.id})}>`;
      }
    }
    return `<video preload="metadata" style="object-fit: cover;"><source src="${post.image}" /></video>`;
  }

  return `<img src="${post.image}" alt="${escapeHtml(post.title)}" />`;
}

function renderPreviewMedia(post) {
  if (!post.image) {
    return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--bg); color: var(--muted); font-size: 12px;">📄</div>';
  }

  if (post.type === 'video' && (post.image.includes('youtube.com') || post.image.includes('youtu.be'))) {
    const videoId = extractYouTubeVideoId(post.image);
    if (videoId) {
      return `<img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${escapeHtml(post.title)}" />`;
    }
  }

  return `<img src="${post.image}" alt="${escapeHtml(post.title)}" />`;
}

function extractYouTubeVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

function openPostDetail(postOrId) {
  const post = typeof postOrId === 'object' ? postOrId : JSON.parse(localStorage.getItem("posts") || "[]").find(p => p.id === postOrId);
  if (!post) return;

  import('./PublishView.js').then(mod => {
    mod.openPostDetailModal(post);
  });
}

// Global functions for post actions
window.toggleLike = function(postId) {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return;

  posts[postIndex].likes = (posts[postIndex].likes || 0) + 1;
  posts[postIndex].liked = true;
  localStorage.setItem("posts", JSON.stringify(posts));
    // trigger cross-tab and same-tab update
    localStorage.setItem('posts_update_ts', Date.now().toString());
    window.dispatchEvent(new Event('app:postsUpdated'));

  // Update UI
  const likeBtn = document.querySelector(`button[onclick="toggleLike(${postId})"]`);
  if (likeBtn) {
    likeBtn.innerHTML = `❤️ ${posts[postIndex].likes}`;
    likeBtn.classList.add('liked');
  }

  showToast("❤️ ¡Te gusta esta publicación!", "success");
};

window.editPost = function(postId) {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  import('./Publish.js').then(mod => {
    mod.renderEditPost(document.body, post, (editedPost) => {
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        posts[postIndex] = editedPost;
        localStorage.setItem("posts", JSON.stringify(posts));
    // trigger cross-tab and same-tab update
    localStorage.setItem('posts_update_ts', Date.now().toString());
    window.dispatchEvent(new Event('app:postsUpdated'));
        showToast("✅ Publicación actualizada", "success");
        setTimeout(() => location.reload(), 1000);
      }
    });
  });
};

window.deletePost = function(postId) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;

  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const filteredPosts = posts.filter(p => p.id !== postId);
  localStorage.setItem("posts", JSON.stringify(filteredPosts));
    // trigger cross-tab and same-tab update
    localStorage.setItem('posts_update_ts', Date.now().toString());
    window.dispatchEvent(new Event('app:postsUpdated'));

  showToast("🗑️ Publicación eliminada", "success");
  setTimeout(() => location.reload(), 1000);
};

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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}