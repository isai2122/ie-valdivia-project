const API_BASE = (import.meta.env.VITE_API_URL || 'https://ie-valdivia-backend.onrender.com').replace(/\/$/, '');
const CACHE_KEY = 'posts';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizePost(raw = {}) {
  return {
    ...raw,
    id: raw.id,
    title: raw.title || '',
    description: raw.description || '',
    category: raw.category || 'general',
    author: raw.author || 'admin',
    image: raw.image || raw.image_url || null,
    type: raw.type || (raw.media_type === 'video' ? 'video' : 'image'),
    media_type: raw.media_type || (raw.type === 'video' ? 'video' : 'image'),
    tags: asArray(raw.tags),
    likes: Number(raw.likes || 0),
    comments: asArray(raw.comments),
    createdAt: raw.createdAt || raw.created_at || null,
    updatedAt: raw.updatedAt || raw.updated_at || null,
    created_at: raw.created_at || raw.createdAt || null,
    updated_at: raw.updated_at || raw.updatedAt || null,
  };
}

export function readCachedPosts() {
  try {
    return asArray(JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')).map(normalizePost);
  } catch (error) {
    console.warn('No se pudo leer la caché de publicaciones:', error);
    return [];
  }
}

export function writeCachedPosts(posts) {
  const normalized = asArray(posts).map(normalizePost);
  localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
  localStorage.setItem('posts_update_ts', Date.now().toString());
  window.dispatchEvent(new Event('app:postsUpdated'));
  return normalized;
}

function buildPostPayload(post = {}) {
  return {
    title: post.title || '',
    description: post.description || '',
    category: post.category || 'general',
    author: post.author || 'admin',
    media_type: post.media_type || (post.type === 'video' ? 'video' : 'image'),
    external_url: post.external_url || null,
    image: post.image || null,
    type: post.type || 'image',
    tags: asArray(post.tags),
    likes: Number(post.likes || 0),
    comments: asArray(post.comments),
    created_at: post.created_at || post.createdAt || null,
    updated_at: post.updated_at || post.updatedAt || null,
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const data = await response.json();
      detail = data.detail || data.message || detail;
    } catch (_) {
      // ignore parse errors
    }
    throw new Error(detail || 'Error de comunicación con el servidor');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fetchPosts() {
  const data = await request('/api/posts');
  return writeCachedPosts(asArray(data).map(normalizePost));
}

export async function fetchPostById(id) {
  const data = await request(`/api/posts/${id}`);
  return normalizePost(data);
}

export async function createPost(post) {
  const data = await request('/api/posts', {
    method: 'POST',
    body: JSON.stringify(buildPostPayload(post)),
  });
  const created = normalizePost(data);
  const current = readCachedPosts();
  writeCachedPosts([created, ...current.filter(item => item.id !== created.id)]);
  return created;
}

export async function updatePost(id, post) {
  const data = await request(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(buildPostPayload(post)),
  });
  const updated = normalizePost(data);
  const current = readCachedPosts();
  writeCachedPosts(current.map(item => item.id === id ? updated : item));
  return updated;
}

export async function deletePostById(id) {
  await request(`/api/posts/${id}`, { method: 'DELETE' });
  const current = readCachedPosts();
  writeCachedPosts(current.filter(item => item.id !== id));
}

export async function incrementPostLike(id) {
  const current = await fetchPostById(id);
  return updatePost(id, {
    ...current,
    likes: Number(current.likes || 0) + 1,
    comments: asArray(current.comments),
  });
}

export async function appendCommentToPost(id, comment) {
  const current = await fetchPostById(id);
  return updatePost(id, {
    ...current,
    likes: Number(current.likes || 0),
    comments: [...asArray(current.comments), comment],
  });
}
