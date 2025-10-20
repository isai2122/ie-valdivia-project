// src/modules/Banners.js
let banners = JSON.parse(localStorage.getItem("banners")) || [];
let currentIndex = 0;
let autoplayInterval = null;

function isAdmin() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.role === "admin";
}

export function setupBannerSection() {
  const container = document.getElementById("bannerSection");
  if (!container) return;

  // Always read from localStorage (sincronizar)
  banners = JSON.parse(localStorage.getItem("banners")) || [];

  // Añade botón fijo de admin si corresponde (evita duplicados)
  if (isAdmin()) addAdminEditButton();

  renderBanners();
}

function addAdminEditButton() {
  const existingBtn = document.getElementById("btnEditBannersAdmin");
  if (existingBtn) return;

  const btn = document.createElement("button");
  btn.id = "btnEditBannersAdmin";
  btn.className = "btn-publicar";
  btn.innerHTML = "🖼️ Editar Banners";
  btn.style.cssText = `
    position: fixed;
    bottom: 120px;
    right: 24px;
    z-index: 999;
    font-size: 14px;
    padding: 12px 20px;
  `;
  btn.onclick = openBannerModal;
  document.body.appendChild(btn);
}

function renderBanners() {
  const container = document.getElementById("bannerSection");
  if (!container) return;

  banners = JSON.parse(localStorage.getItem("banners")) || [];

  if (!banners.length) {
    container.innerHTML = `
      <div class="banners-frame" style="padding: 60px 20px; text-align: center; color: var(--muted);">
        <div style="font-size: 48px; margin-bottom: 16px;">🖼️</div>
        <h3>No hay banners configurados</h3>
        <p>Los administradores pueden agregar banners desde el botón de edición</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="banners-frame" role="region" aria-label="Carrusel de banners">
      <div class="banners-track" id="bannersTrack" style="display:flex;transform:translateX(-${currentIndex*100}%);transition:transform 420ms cubic-bezier(.22,.9,.35,1);">
        ${banners.map((banner, index) => `
          <div class="banner-slide" style="min-width:100%;height:260px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;">
            ${renderBannerContentHTML(banner)}
            <div class="banner-overlay-led" aria-hidden="true"></div>
            ${banner.title ? `<div class="banner-title-overlay"><h3>${escapeHtml(banner.title)}</h3></div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="banner-nav" aria-hidden="true">
        <button id="bannerPrev" class="banner-arrow" aria-label="Banner anterior">❮</button>
        <button id="bannerNext" class="banner-arrow" aria-label="Siguiente banner">❯</button>
      </div>

      <div class="banner-dots" id="bannerDots" aria-hidden="true">
        ${banners.map((_, i) => `<button class="banner-dot ${i===currentIndex ? 'active' : ''}" data-index="${i}"></button>`).join('')}
      </div>
    </div>
  `;

  setupBannerControls();
  startAutoplay();
}

function renderBannerContentHTML(banner) {
  const url = banner.url || '';
  const isYouTube = /youtube\.com|youtu\.be/i.test(url);
  const isVideoFile = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

  if (isYouTube) {
    // normalize to embed url
    let embed = url.replace(/watch\?v=/, "embed/").replace(/youtu\.be\//, "youtube.com/embed/");
    if (!/embed\//i.test(embed)) {
      // try to extract id
      const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
      if (m && m[1]) embed = `https://www.youtube.com/embed/${m[1]}`;
    }
    return `<iframe src="${embed}" width="100%" height="260" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border:0;"></iframe>`;
  }

  if (isVideoFile) {
    // Render video tag (muted loop to behave like banner background)
    return `<video src="${escapeHtml(url)}" style="width:100%;height:100%;object-fit:cover;" autoplay muted loop playsinline></video>`;
  }

  // Default: image (dataURL or remote)
  return `<img src="${escapeHtml(url)}" alt="${escapeHtml(banner.title || 'Banner')}" style="width:100%;height:100%;object-fit:cover;display:block;" />`;
}

function setupBannerControls() {
  const track = document.getElementById("bannersTrack");
  const prevBtn = document.getElementById("bannerPrev");
  const nextBtn = document.getElementById("bannerNext");
  const dotsContainer = document.getElementById("bannerDots");

  if (!track) return;

  prevBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + banners.length) % banners.length;
    updateBannerPosition();
    restartAutoplay();
  });

  nextBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % banners.length;
    updateBannerPosition();
    restartAutoplay();
  });

  dotsContainer?.querySelectorAll(".banner-dot").forEach((d) => {
    d.addEventListener("click", (e) => {
      const idx = Number(e.currentTarget.dataset.index);
      currentIndex = idx;
      updateBannerPosition();
      restartAutoplay();
    });
  });

  // Touch / swipe
  let sx = 0;
  const frame = document.querySelector(".banners-frame");
  frame?.addEventListener("touchstart", (ev) => sx = ev.touches[0].clientX);
  frame?.addEventListener("touchend", (ev) => {
    const ex = ev.changedTouches[0].clientX;
    const diff = sx - ex;
    if (Math.abs(diff) > 50) {
      currentIndex = diff > 0 ? (currentIndex + 1) % banners.length : (currentIndex - 1 + banners.length) % banners.length;
      updateBannerPosition();
      restartAutoplay();
    }
  });

  // Pause on hover
  frame?.addEventListener("mouseenter", pauseAutoplay);
  frame?.addEventListener("mouseleave", startAutoplay);
}

function updateBannerPosition() {
  const track = document.getElementById("bannersTrack");
  if (!track) return;
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  const dots = document.querySelectorAll(".banner-dot");
  dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
}

function startAutoplay() {
  if (banners.length <= 1) return;
  clearInterval(autoplayInterval);
  autoplayInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % banners.length;
    updateBannerPosition();
  }, 6000);
}

function pauseAutoplay() {
  clearInterval(autoplayInterval);
}

function restartAutoplay() {
  clearInterval(autoplayInterval);
  startAutoplay();
}

// Editor modal
export function openBannerModal() {
  if (!isAdmin()) {
    showToast("❌ Solo los administradores pueden editar banners", "error");
    return;
  }

  const existing = document.getElementById("bannerEditorModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "bannerEditorModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content" style="max-width:820px;">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0">Editor de Banners</h3>
        <button id="closeBannerModal" class="btn-cancelar">Cerrar</button>
      </header>

      <div id="bannerList" style="margin-bottom:18px;"></div>

      <div style="display:grid;gap:12px;background:rgba(255,255,255,0.02);padding:12px;border-radius:10px;">
        <label style="font-weight:600">Agregar nuevo banner (archivo o URL)</label>

        <div style="display:flex;gap:12px;align-items:center;">
          <div style="flex:1">
            <input type="file" id="newBannerFile" accept="image/*,video/*" />
            <div style="font-size:12px;color:var(--muted);margin-top:6px">O pega una URL en el campo de abajo (YouTube, mp4, imagen)</div>
          </div>

          <div style="width:220px;">
            <input type="text" id="newBannerUrl" placeholder="https://..." style="width:100%;padding:8px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.04)" />
          </div>
        </div>

        <div style="display:flex;gap:8px;">
          <input type="text" id="newBannerTitle" placeholder="Título (opcional)" style="flex:1;padding:8px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.04)" />
          <input type="url" id="newBannerLink" placeholder="Enlace (opcional) https://..." style="width:260px;padding:8px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.04)" />
        </div>

        <div style="text-align:right">
          <button id="addBannerBtn" class="btn-publicar">➕ Agregar Banner</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#closeBannerModal").onclick = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });

  renderBannerList();

  modal.querySelector("#addBannerBtn").addEventListener("click", async () => {
    const fileInput = modal.querySelector("#newBannerFile");
    const urlInput = modal.querySelector("#newBannerUrl");
    const titleInput = modal.querySelector("#newBannerTitle");
    const hrefInput = modal.querySelector("#newBannerLink");

    const file = fileInput.files[0];
    const url = urlInput.value.trim();
    const title = titleInput.value.trim();
    const href = hrefInput.value.trim();

    if (!file && !url) {
      showToast("❌ Selecciona un archivo o pega una URL.", "error");
      return;
    }

    if (banners.length >= 5) {
      showToast("❌ Máximo 5 banners permitidos", "error");
      return;
    }

    try {
      let finalUrl = "";
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          showToast("❌ Archivo muy grande. Máximo 2MB", "error");
          return;
        }
        finalUrl = await fileToDataURL(file);
      } else {
        finalUrl = url;
      }

      banners.push({ url: finalUrl, title: title || "", href: href || "" });
      saveBanners();
      renderBannerList();
      renderBanners();

      fileInput.value = "";
      urlInput.value = "";
      titleInput.value = "";
      hrefInput.value = "";

      showToast("✅ Banner agregado exitosamente", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Error agregando banner", "error");
    }
  });
}

function renderBannerList() {
  const list = document.getElementById("bannerList");
  if (!list) return;

  banners = JSON.parse(localStorage.getItem("banners")) || [];

  if (!banners.length) {
    list.innerHTML = `<div style="padding:18px;text-align:center;color:var(--muted);border-radius:8px;border:1px dashed rgba(255,255,255,0.03)">No hay banners guardados</div>`;
    return;
  }

  list.innerHTML = banners.map((b, i) => `
    <div style="display:flex;gap:12px;align-items:center;padding:10px;background:rgba(255,255,255,0.02);border-radius:10px;margin-bottom:8px;border:1px solid rgba(255,255,255,0.03)">
      <div style="width:140px;flex-shrink:0;">
        ${isVideoUrl(b.url) ? `<div style="width:140px;height:80px;background:#000;border-radius:8px;overflow:hidden"><video src="${escapeHtml(b.url)}" style="width:100%;height:100%;object-fit:cover" muted loop></video></div>` : `<img src="${escapeHtml(b.url)}" style="width:140px;height:80px;object-fit:cover;border-radius:8px;" alt="thumb" />`}
      </div>
      <div style="flex:1;display:grid;gap:8px;">
        <input data-i="${i}" class="bn-title" value="${escapeHtml(b.title||'')}" placeholder="Título" style="padding:8px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.03)" />
        <input data-i="${i}" class="bn-href" value="${escapeHtml(b.href||'')}" placeholder="Enlace (opcional)" style="padding:8px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.03)" />
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <input type="file" data-i="${i}" class="bn-file" accept="image/*,video/*" />
        <button class="btn-cancelar bn-del" data-i="${i}">Eliminar</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".bn-del").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = Number(e.currentTarget.dataset.i);
      if (!confirm("Eliminar banner?")) return;
      banners.splice(idx, 1);
      saveBanners();
      renderBannerList();
      renderBanners();
      if (currentIndex >= banners.length) currentIndex = 0;
      showToast("🗑️ Banner eliminado", "success");
    });
  });

  list.querySelectorAll(".bn-title").forEach(inp => {
    inp.addEventListener("change", (e) => {
      const idx = Number(e.target.dataset.i);
      banners[idx].title = e.target.value;
      saveBanners();
      renderBanners();
    });
  });

  list.querySelectorAll(".bn-href").forEach(inp => {
    inp.addEventListener("change", (e) => {
      const idx = Number(e.target.dataset.i);
      banners[idx].href = e.target.value;
      saveBanners();
    });
  });

  list.querySelectorAll(".bn-file").forEach(inp => {
    inp.addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 2 * 1024 * 1024) {
        showToast("❌ Archivo muy grande. Máximo 2MB", "error");
        return;
      }
      try {
        const url = await fileToDataURL(f);
        const idx = Number(e.target.dataset.i);
        banners[idx].url = url;
        saveBanners();
        renderBannerList();
        renderBanners();
        showToast("✅ Imagen del banner actualizada", "success");
      } catch {
        showToast("❌ Error al leer archivo", "error");
      }
    });
  });
}

// util: detecta vídeo por url
function isVideoUrl(url = "") {
  if (!url) return false;
  if (/youtube\.com|youtu\.be/i.test(url)) return true;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function saveBanners() {
  localStorage.setItem("banners", JSON.stringify(banners));
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsDataURL(file);
  });
}

function escapeHtml(text = "") {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  if (type === "error") {
    toast.style.background = "linear-gradient(135deg, var(--danger), #b91c1c)";
  }
  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = "slideInRight 0.3s ease-out reverse";
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}
