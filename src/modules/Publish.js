// src/modules/Publish.js
export function renderPublish(host = document.body, onNewPost, editPost = null) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== "admin") {
    showToast("❌ Solo los administradores pueden publicar contenido", "error");
    return;
  }

  // Remove existing modal to avoid duplicates
  const existingModal = document.getElementById('publishModal');
  if (existingModal) existingModal.remove();

  const isEditing = !!editPost;
  
  const modal = document.createElement('div');
  modal.id = 'publishModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        
        <button id="closePublishModal" class="btn-cancelar" style="padding: 8px 16px;">✕ Cerrar</button>
      </header>
      
      <form id="publishForm" style="display: grid; gap: 20px;">
        <div>
          <label for="pub-title">📝 Título *</label>
          <input type="text" id="pub-title" value="${escapeHtml(editPost?.title || '')}" required 
                 placeholder="Título llamativo para tu publicación..." />
        </div>
        
        <div>
          <label for="pub-desc">📄 Descripción *</label>
          <textarea id="pub-desc" rows="4" required 
                    placeholder="Describe el contenido de tu publicación...">${escapeHtml(editPost?.description || '')}</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label for="pub-category">📂 Categoría *</label>
            <select id="pub-category" required>
              <option value="">Selecciona una categoría...</option>
              <option value="noticias" ${editPost?.category === 'noticias' ? 'selected' : ''}>📰 Noticias</option>
              <option value="proyectos" ${editPost?.category === 'proyectos' ? 'selected' : ''}>🚀 Proyectos</option>
            </select>
          </div>
          
          <div>
            <label for="pub-media-type">🎬 Tipo de contenido</label>
            <select id="pub-media-type">
              <option value="image" ${editPost?.type === 'image' ? 'selected' : ''}>🖼️ Imagen</option>
              <option value="video" ${editPost?.type === 'video' ? 'selected' : ''}>🎬 Video</option>
            </select>
          </div>
        </div>
        
        <div style="background: rgba(37,99,235,0.1); padding: 20px; border-radius: var(--radius); border: 1px solid var(--border);">
          <h4 style="margin-top: 0; color: var(--text);">🔗 Contenido Multimedia</h4>
          <p style="color: var(--muted); font-size: 14px; margin-bottom: 16px;">
            <strong>Recomendado:</strong> Usa enlaces externos (YouTube, Google Drive, etc.) para ahorrar espacio.
          </p>
          
          <div style="display: grid; gap: 16px;">
            <div>
              <label for="pub-external-url">🌐 Enlace externo (YouTube, Drive, Facebook, etc.)</label>
              <input type="url" id="pub-external-url" value="${escapeHtml(editPost?.image || '')}"
                     placeholder="https://youtube.com/watch?v=... o https://drive.google.com/..." />
              <div style="font-size: 14px; color: var(--muted); margin-top: 4px;">
                ✅ YouTube • ✅ Google Drive • ✅ Facebook • ✅ Cualquier URL de imagen/video
              </div>
            </div>
            
            <div style="text-align: center; color: var(--muted); padding: 8px;">
              <strong>-- O --</strong>
            </div>
            
            <div>
              <label for="pub-local-file">📁 Subir archivo local (opcional)</label>
              <input type="file" id="pub-local-file" accept="image/*,video/*" />
              <div style="font-size: 14px; color: var(--muted); margin-top: 4px;">
                Solo si no tienes enlace externo. Máximo 5MB.
              </div>
            </div>
          </div>
        </div>
        
        ${editPost?.image ? `
          <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: var(--radius); border: 1px solid var(--border);">
            <h4 style="margin-top: 0; color: var(--text);">👁️ Vista previa actual</h4>
            <div style="text-align: center;">
              ${renderMediaPreview(editPost)}
            </div>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 16px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid var(--border);">
          <button type="button" id="cancelPublish" class="btn-cancelar">
            ❌ Cancelar
          </button>
          <button type="submit" id="submitPublish" class="btn-publicar">
            ${isEditing ? '💾 Guardar cambios' : '🚀 Publicar'}
          </button>
        </div>
      </form>
    </div>
  `;

  host.appendChild(modal);

  // Event listeners
  modal.querySelector('#closePublishModal').onclick = () => modal.remove();
  modal.querySelector('#cancelPublish').onclick = () => modal.remove();
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Form submission
  modal.querySelector('#publishForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handlePublishSubmit(modal, onNewPost, editPost);
  });

  // Live preview updates
  const externalUrlInput = modal.querySelector('#pub-external-url');
  const mediaTypeSelect = modal.querySelector('#pub-media-type');
  
  externalUrlInput.addEventListener('input', debounce(() => {
    updateLivePreview(modal, externalUrlInput.value, mediaTypeSelect.value);
  }, 500));
  
  mediaTypeSelect.addEventListener('change', () => {
    updateLivePreview(modal, externalUrlInput.value, mediaTypeSelect.value);
  });
}

// Separate function for editing posts
export function renderEditPost(host, post, onEditComplete) {
  renderPublish(host, onEditComplete, post);
}

async function handlePublishSubmit(modal, onComplete, editPost) {
  const submitBtn = modal.querySelector('#submitPublish');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner"></span> Procesando...';
  submitBtn.disabled = true;

  try {
    const title = modal.querySelector('#pub-title').value.trim();
    const description = modal.querySelector('#pub-desc').value.trim();
    const category = modal.querySelector('#pub-category').value;
    const mediaType = modal.querySelector('#pub-media-type').value;
    const externalUrl = modal.querySelector('#pub-external-url').value.trim();
    const localFile = modal.querySelector('#pub-local-file').files[0];

    // Validation
    if (!title || !description || !category) {
      throw new Error('Por favor completa todos los campos obligatorios');
    }

    let mediaUrl = '';
    let finalMediaType = mediaType;

    // Process media
    if (externalUrl) {
      mediaUrl = processExternalUrl(externalUrl);
      finalMediaType = detectMediaType(externalUrl) || mediaType;
    } else if (localFile) {
      if (localFile.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es muy grande. Máximo 5MB');
      }
      mediaUrl = await fileToDataURL(localFile);
      finalMediaType = localFile.type.startsWith('video/') ? 'video' : 'image';
    } else if (!editPost) {
      // For new posts without media, use placeholder
      mediaUrl = createPlaceholderImage(title);
      finalMediaType = 'image';
    } else {
      // Keep existing media for edits
      mediaUrl = editPost.image;
      finalMediaType = editPost.type;
    }

    const postData = {
      id: editPost ? editPost.id : undefined,      title,
      description,
      category,
      image: mediaUrl,
      type: finalMediaType,
      likes: editPost ? editPost.likes : 0,
      comments: editPost ? editPost.comments : [],
      createdAt: editPost ? editPost.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Default to local backend if not set
    let response;
    if (isEditing) {
      response = await fetch(`${apiUrl}/api/posts/${editPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
    } else {
      response = await fetch(`${apiUrl}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
    }

    if (!response.ok) {
      throw new Error("Error al guardar la publicación.");
    }
    const result = await response.json();

    // trigger cross-tab and same-tab update
    window.dispatchEvent(new Event("app:postsUpdated"));

    // Success callback
    if (typeof onComplete === 'function') {
      onComplete(postData);
    }

    modal.remove();
    showToast(editPost ? "✅ Publicación actualizada exitosamente" : "🚀 Publicación creada exitosamente", "success");

  } catch (error) {
    showToast(`❌ Error: ${error.message}`, "error");
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

function processExternalUrl(url) {
  // YouTube URL processing
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // Convert to embed URL for better integration
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Google Drive URL processing
  if (url.includes('drive.google.com')) {
    // Convert sharing URL to direct view URL
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/view`;
    }
  }
  
  return url;
}

function detectMediaType(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'video';
  }
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  
  const lowerUrl = url.toLowerCase();
  
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'image';
  }
  
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'video';
  }
  
  return null;
}

function extractYouTubeVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

function createPlaceholderImage(title) {
  // Create a simple SVG placeholder with the title
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#233240"/>
      <text x="200" y="140" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        ${escapeHtml(title.slice(0, 30))}${title.length > 30 ? '...' : ''}
      </text>
      <text x="200" y="170" font-family="Arial, sans-serif" font-size="12" fill="#8fa3c4" text-anchor="middle" dominant-baseline="middle">
        📄 Sin imagen
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function updateLivePreview(modal, url, mediaType) {
  const existingPreview = modal.querySelector('#livePreview');
  if (existingPreview) existingPreview.remove();
  
  if (!url) return;
  
  const previewContainer = document.createElement('div');
  previewContainer.id = 'livePreview';
  previewContainer.style.cssText = `
    background: rgba(255,255,255,0.03);
    padding: 16px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    margin-top: 16px;
  `;
  
  previewContainer.innerHTML = `
    <h4 style="margin-top: 0; color: var(--text);">👁️ Vista previa en vivo</h4>
    <div style="text-align: center;">
      ${renderMediaPreview({ image: processExternalUrl(url), type: detectMediaType(url) || mediaType, title: 'Vista previa' })}
    </div>
  `;
  
  const form = modal.querySelector('#publishForm');
  form.appendChild(previewContainer);
}

function renderMediaPreview(post) {
  if (!post.image) {
    return '<div style="color: var(--muted); padding: 20px;">📄 Sin contenido multimedia</div>';
  }

  if (post.type === 'video') {
    if (post.image.includes('youtube.com') || post.image.includes('embed/')) {
      return `
        <iframe src="${post.image}" 
                width="100%" 
                height="200" 
                frameborder="0" 
                allowfullscreen 
                style="border-radius: 8px;">
        </iframe>
      `;
    }
    return `
      <video controls style="width: 100%; max-height: 200px; border-radius: 8px;">
        <source src="${post.image}" />
        Tu navegador no soporta video HTML5.
      </video>
    `;
  }

  return `<img src="${post.image}" alt="${escapeHtml(post.title || 'Preview')}" style="max-width: 100%; max-height: 200px; border-radius: 8px;" />`;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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