// src/modules/PublishView.js
// Versión completa y funcional del módulo de publicaciones.
// Maneja render, detalle, comentarios, likes, edición y eliminación.

export function renderPublishView(container = document.getElementById("postsContainer"), posts = null) {
  if (!container) return;

  // cargar posts (si se pasan por parámetro se usan)
  const allPosts = Array.isArray(posts) ? posts.slice() : JSON.parse(localStorage.getItem("posts") || "[]");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  container.innerHTML = "";

  // Header / boton nuevo (solo admin)
  if (user.role === "admin") {
    const topBar = document.createElement("div");
    topBar.style.display = "flex";
    topBar.style.justifyContent = "flex-end";
    topBar.style.marginBottom = "18px";

    const newBtn = document.createElement("button");
    newBtn.className = "btn-publicar";
    newBtn.textContent = "➕ Nueva publicación";
    newBtn.onclick = () => {
      // intentar usar Publish.js si existe, si no abrir modal interno simple
      if (window.renderPublishExternal) {
        // hook externo (por si otro módulo registra)
        window.renderPublishExternal();
      } else {
        openEditModal(null); // null => crear nueva
      }
    };

    topBar.appendChild(newBtn);
    container.appendChild(topBar);
  }

  if (!allPosts.length) {
    container.innerHTML += `
      <div style="text-align:center;padding:80px 20px;color:var(--muted);">
        <div style="font-size:64px;margin-bottom:24px;">📭</div>
        <h2>No hay publicaciones aún</h2>
        <p>¡Sé el primero en compartir contenido!</p>
      </div>
    `;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "posts-grid"; // tu css ya define 2 columnas en desktop
  allPosts.forEach(post => grid.appendChild(createPostCard(post, JSON.parse(localStorage.getItem("user") || "{}"))));
  container.appendChild(grid);
}

/* ------------------ Helpers de rendering ------------------ */

function createPostCard(post, user) {
  const card = document.createElement("div");
  card.className = "post-card";
  card.dataset.postId = post.id;

  // Admin menu (sin emojis)
  if (user.role === 'admin') {
    const menuWrap = document.createElement('div');
    menuWrap.className = 'post-menu';
    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.title = 'Opciones';
    menuBtn.textContent = '⋯';
    const menuOptions = document.createElement('ul');
    menuOptions.className = 'menu-options';
    menuOptions.innerHTML = `
      
      <li class="menu-delete danger">Eliminar publicación</li>
    `;
    menuWrap.appendChild(menuBtn);
    menuWrap.appendChild(menuOptions);
    card.appendChild(menuWrap);

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.menu-options.show').forEach(m => { if (m !== menuOptions) m.classList.remove('show'); });
      menuOptions.classList.toggle('show');
    });

    menuOptions.querySelector('.menu-edit').addEventListener('click', (e) => {
      e.stopPropagation();
      window.editPost && window.editPost(post.id);
      menuOptions.classList.remove('show');
    });
    menuOptions.querySelector('.menu-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      window.deletePost && window.deletePost(post.id);
      menuOptions.classList.remove('show');
    });
  }

  // Media
  const mediaBox = document.createElement('div');
  mediaBox.className = 'post-media';
  mediaBox.innerHTML = renderPostMediaHTML(post);
  card.appendChild(mediaBox);

  // Title
  const title = document.createElement('h3');
  title.className = 'post-title';
  title.textContent = post.title || '';
  card.appendChild(title);

  // Desc
  const desc = document.createElement('p');
  desc.className = 'post-desc';
  desc.textContent = post.description ? (post.description.length > 150 ? post.description.slice(0,150) + '...' : post.description) : '';
  card.appendChild(desc);

  // Meta row (likes / comments / category)
  const metaRow = document.createElement('div');
  metaRow.className = 'meta-row';
  metaRow.style.display = 'flex';
  metaRow.style.justifyContent = 'space-between';
  metaRow.style.alignItems = 'center';
  metaRow.style.marginTop = '12px';

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.alignItems = 'center';

  const likeBtn = document.createElement('button');
  likeBtn.className = 'action-btn nav-btn';
  likeBtn.textContent = `❤️ ${post.likes || 0}`;
  likeBtn.onclick = (e) => {
    e.stopPropagation();
    window.togglePostLike && window.togglePostLike(post.id);
    // actualizar UI inmediata
    const updated = getPostById(post.id);
    likeBtn.textContent = `❤️ ${updated.likes || 0}`;
    likeBtn.classList.add('liked');
  };

  const commentBtn = document.createElement('button');
  commentBtn.className = 'action-btn nav-btn';
  commentBtn.textContent = `💬 ${(post.comments || []).length}`;
  commentBtn.onclick = (e) => {
    e.stopPropagation();
    window.openPostDetail && window.openPostDetail(post.id);
  };

  actions.appendChild(likeBtn);
  actions.appendChild(commentBtn);

  const categoryEl = document.createElement('div');
  categoryEl.className = 'text-muted';
  categoryEl.style.fontSize = '14px';
  categoryEl.textContent = post.category || 'General';

  metaRow.appendChild(actions);
  metaRow.appendChild(categoryEl);
  card.appendChild(metaRow);

  // Click en card abre detalle
  card.addEventListener('click', () => {
    window.openPostDetail && window.openPostDetail(post.id);
  });

  return card;
}

function renderPostMediaHTML(post) {
  if (!post.image) {
    return `
      <div style="display:flex;align-items:center;justify-content:center;height:180px;background:var(--bg);color:var(--muted);flex-direction:column;border-radius:8px;">
        <div style="font-size:20px;margin-bottom:8px;">No hay multimedia</div>
      </div>
    `;
  }

  if (post.type === 'video') {
    const embed = convertToEmbed(post.image);
    if (embed) {
      // iframe embebido (YouTube, Drive)
      return `<iframe src="${escapeHtml(embed)}" width="100%" height="220" frameborder="0" allowfullscreen loading="lazy" title="${escapeHtml(post.title || 'Video')}"></iframe>`;
    } else {
      // archivo de video directo
      return `
        <video controls preload="metadata" style="width:100%;height:220px;object-fit:cover;border-radius:8px;background:#000;">
          <source src="${escapeHtml(post.image)}" />
          Tu navegador no soporta video.
        </video>
      `;
    }
  }

  // imagen
  return `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title || '')}" loading="lazy" style="width:100%;height:220px;object-fit:cover;border-radius:8px;" />`;
}

/* ------------------ Detalle modal ------------------ */

export function openPostDetailModalById(id) {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const post = posts.find(p => p.id === id);
  if (!post) return;
  openPostDetailModal(post);
}

export function openPostDetailModal(postParam) {
  // postParam puede ser objeto o id (en caso de id se resuelve)
  let post = typeof postParam === "object" ? postParam : getPostById(postParam);
  if (!post) return;

  // cierre si ya existe
  const existing = document.getElementById('postDetailModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'postDetailModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width:1000px;">
      <header style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
        <div>
          <h2 style="margin:0 0 8px 0;font-size:28px;color:var(--text)">${escapeHtml(post.title)}</h2>
          <div style="color:var(--muted);font-size:14px;">${escapeHtml(post.category || '')} • ${formatDate(post.createdAt || post.updatedAt)}</div>
        </div>
        <button id="closePostDetail" class="btn-cancelar" style="padding:8px 16px;">Cerrar</button>
      </header>

      <div style="display:grid;gap:24px;">
        <div class="post-media" style="height:400px;border-radius:var(--radius);overflow:hidden;">
          ${renderPostMediaHTML(post)}
        </div>

        <div style="background:rgba(255,255,255,0.03);padding:20px;border-radius:var(--radius);border:1px solid rgba(255,255,255,0.04);">
          <h3 style="margin-top:0;color:var(--text)">Descripción</h3>
          <p style="color:var(--text);line-height:1.6;margin:0;">${escapeHtml(post.description || 'Sin descripción disponible.')}</p>
        </div>

        <div style="display:flex;gap:16px;align-items:center;padding:16px;background:rgba(255,255,255,0.03);border-radius:var(--radius);border:1px solid rgba(255,255,255,0.04);">
          <button id="likeDetail" class="action-btn nav-btn">${post.likes || 0} Me gusta</button>
          <div style="color:var(--muted)">${(post.comments || []).length} comentarios</div>
        </div>

        <div id="commentsSection">
          <h3 style="color:var(--text);margin-bottom:16px">Comentarios</h3>
          <div id="commentsList"></div>
          <form id="commentForm" class="comment-form" style="margin-top:20px;display:flex;gap:12px;align-items:center;">
            <input id="commentInput" placeholder="Escribe tu comentario..." style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:var(--text)"/>
            <button type="submit" class="btn-publicar">Comentar</button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // listeners
  modal.querySelector('#closePostDetail').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  function reloadComments() {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const fresh = posts.find(p => p.id === post.id);
    const comments = (fresh && fresh.comments) || [];
    const commentsList = modal.querySelector('#commentsList');
    if (!comments.length) {
      commentsList.innerHTML = `<div style="text-align:center;color:var(--muted);padding:20px;border-radius:8px;">No hay comentarios</div>`;
      return;
    }
    commentsList.innerHTML = comments.map(c => `
      <div class="comment-item" style="padding:8px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:8px;">
        <div style="font-weight:600;color:var(--text)">${escapeHtml(c.author || 'Anónimo')}</div>
        <div style="color:var(--muted)">${escapeHtml(c.text)}</div>
        <div style="color:var(--muted);font-size:12px">${formatDate(c.createdAt)}</div>
      </div>
    `).join('');
  }

  reloadComments();

  modal.querySelector('#commentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = modal.querySelector('#commentInput');
    const txt = input.value.trim();
    if (!txt) return;
    const user = JSON.parse(localStorage.getItem('user') || "{}");
    const author = user.username || 'Visitante';
    const newComment = { text: txt, author, createdAt: new Date().toISOString() };

    const posts = JSON.parse(localStorage.getItem('posts') || "[]");
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      posts[idx].comments = posts[idx].comments || [];
      posts[idx].comments.push(newComment);
      localStorage.setItem('posts', JSON.stringify(posts));
    // trigger cross-tab and same-tab update
    localStorage.setItem('posts_update_ts', Date.now().toString());
    window.dispatchEvent(new Event('app:postsUpdated'));
      // actualizar referencia local
      post = posts[idx];
      reloadComments();
      input.value = '';
      showToast("Comentario agregado", "success");
      // actualizar contadores en lista
      refreshListViews();
    }
  });

  modal.querySelector('#likeDetail').addEventListener('click', () => {
    window.togglePostLike && window.togglePostLike(post.id);
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const p = posts.find(p => p.id === post.id);
    if (p) modal.querySelector('#likeDetail').textContent = `${p.likes || 0} Me gusta`;
    refreshListViews();
  });
}

/* ------------------ Edición y eliminación (admin) ------------------ */

function openEditModal(postId = null) {
  const user = JSON.parse(localStorage.getItem('user') || "{}");
  if (user.role !== 'admin') return alert("Acceso restringido: solo administradores.");

  const posts = JSON.parse(localStorage.getItem('posts') || "[]");
  const editingPost = postId ? posts.find(p => p.id === postId) : null;

  // modal único
  const existing = document.getElementById('postEditModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'postEditModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width:720px;">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="margin:0">${editingPost ? 'Editar publicación' : 'Crear publicación'}</h3>
        <button id="closeEdit" class="btn-cancelar">Cerrar</button>
      </header>

      <form id="editForm" style="display:grid;gap:12px;">
        <label>Título</label>
        <input id="editTitle" required />
        <label>Descripción</label>
        <textarea id="editDesc" rows="4"></textarea>
        <label>Categoría</label>
        <select id="editCat" required>
          <option value="">Selecciona...</option>
          <option value="noticias">Noticias</option>
          <option value="proyectos">Proyectos</option>
        </select>

        <label>Tipo de media</label>
        <select id="editType">
          <option value="image">Imagen</option>
          <option value="video">Video</option>
        </select>

        <label>Enlace (YouTube / Drive / Facebook) — opcional</label>
        <input id="editLink" placeholder="https://..." />

        <label>O subir archivo local (opcional)</label>
        <input type="file" id="editFile" accept="image/*,video/*" />

        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button type="button" id="saveEdit" class="btn-publicar">${editingPost ? 'Guardar' : 'Publicar'}</button>
          <button type="button" id="cancelEdit" class="btn-cancelar">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('#closeEdit').onclick = () => modal.remove();
  modal.querySelector('#cancelEdit').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  // rellenar si edita
  if (editingPost) {
    modal.querySelector('#editTitle').value = editingPost.title || '';
    modal.querySelector('#editDesc').value = editingPost.description || '';
    modal.querySelector('#editCat').value = editingPost.category || '';
    modal.querySelector('#editType').value = editingPost.type || 'image';
    modal.querySelector('#editLink').value = editingPost.image && isDataURL(editingPost.image) ? '' : (editingPost.image || '');
  }

  modal.querySelector('#saveEdit').addEventListener('click', async () => {
    const title = modal.querySelector('#editTitle').value.trim();
    const desc = modal.querySelector('#editDesc').value.trim();
    const cat = modal.querySelector('#editCat').value;
    const type = modal.querySelector('#editType').value;
    const link = modal.querySelector('#editLink').value.trim();
    const file = modal.querySelector('#editFile').files[0];

    if (!title || !cat) return alert('Completa título y categoría.');

    let mediaSrc = '';
    let finalType = type === 'video' ? 'video' : 'image';

    if (link) {
      mediaSrc = link;
    } else if (file) {
      try {
        mediaSrc = await fileToDataURL(file);
      } catch {
        return alert('Error leyendo archivo.');
      }
    } else if (editingPost && editingPost.image) {
      mediaSrc = editingPost.image;
      finalType = editingPost.type || finalType;
    } else {
      mediaSrc = '/assets/placeholder.png';
      finalType = 'image';
    }

    const posts = JSON.parse(localStorage.getItem("posts") || "[]");

    if (editingPost) {
      const idx = posts.findIndex(p => p.id === editingPost.id);
      if (idx !== -1) {
        posts[idx] = {
          ...posts[idx],
          title,
          description: desc,
          category: cat,
          image: mediaSrc,
          type: finalType,
          updatedAt: new Date().toISOString()
        };
      }
      showToast("Publicación actualizada", "success");
    } else {
      const newPost = {
        id: Date.now(),
        title,
        description: desc,
        category: cat,
        image: mediaSrc,
        type: finalType,
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString()
      };
      posts.unshift(newPost);
      showToast("Publicación creada", "success");
    }

    localStorage.setItem("posts", JSON.stringify(posts));
    // trigger cross-tab and same-tab update
    localStorage.setItem('posts_update_ts', Date.now().toString());
    window.dispatchEvent(new Event('app:postsUpdated'));
    modal.remove();
    refreshListViews();
  });
}

/* ------------------ Operaciones globales (expuestas) ------------------ */

window.openPostDetail = (id) => openPostDetailModalById(id);
window.openPostDetailModal = openPostDetailModal; // por compatibilidad

window.togglePostLike = function(id) {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return;
  posts[idx].likes = (posts[idx].likes || 0) + 1;
  localStorage.setItem("posts", JSON.stringify(posts));
    // trigger cross-tab and same-tab update
    localStorage.setItem('posts_update_ts', Date.now().toString());
    window.dispatchEvent(new Event('app:postsUpdated'));
  refreshListViews();
};

window.editPost = function(id) {
  openEditModal(id);
};

window.deletePost = function(id) {
  if (!confirm('¿Eliminar publicación? Esta acción no se puede deshacer.')) return;
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return;
  posts.splice(idx,1);
  localStorage.setItem("posts", JSON.stringify(posts));
    // trigger cross-tab and same-tab update
    localStorage.setItem('posts_update_ts', Date.now().toString());
    window.dispatchEvent(new Event('app:postsUpdated'));
  showToast("Publicación eliminada", "success");
  refreshListViews();
};

/* ------------------ Utilidades ------------------ */

function getPostById(id) {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  return posts.find(p => p.id === id);
}

function refreshListViews() {
  // refrescar el contenedor principal si existe
  const mainGridContainer = document.getElementById("postsContainer") || document.querySelector(".posts-grid")?.parentElement;
  if (mainGridContainer) {
    // si el contenedor padre tiene id=postsContainer, re-renderizamos usando la función exportada
    // busco el módulo en window (si se ha importado) — sino simplemente reconstruyo el grid
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    if (typeof window.renderPublishViewExternal === "function") {
      // hook externo para refrescar (si existe)
      window.renderPublishViewExternal(posts);
    } else {
      // simple: destruyo grid y vuelvo a crear
      const host = document.getElementById("postsContainer") || mainGridContainer;
      host.innerHTML = "";
      renderPublishView(host, posts);
    }
  }
}

function fileToDataURL(file) {
  return new Promise((res,rej) => {
    const r = new FileReader();
    r.onerror = () => rej();
    r.onload = () => res(String(r.result));
    r.readAsDataURL(file);
  });
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
      // formato shareable ?id=...
      const idParam = u.searchParams.get('id');
      if (idParam) return `https://drive.google.com/file/d/${idParam}/preview`;
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
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function isDataURL(str) {
  return /^data:image|^data:video/.test(String(str || ''));
}

function showToast(message, type = 'success') {
  const t = document.createElement('div');
  t.className = 'toast-message';
  t.textContent = message;
  if (type === 'error') t.style.background = 'linear-gradient(135deg, var(--danger), #b91c1c)';
  document.body.appendChild(t);
  setTimeout(() => {
    if (t.parentNode) {
      t.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => t.remove(), 300);
    }
  }, 2000);
}