// src/modules/About.js
// Renderiza la sección "Sobre Nosotros" súper completa y editable

function getStoredAbout() {
  const raw = localStorage.getItem("aboutContent");
  if (!raw) {
    // Contenido por defecto más completo
    const def = {
      title: "Sobre Nosotros",
      subtitle: "Conoce a nuestra institución educativa",
      heroImage: "/src/assets/placeholder.png",
      mission: "Formar estudiantes íntegros con valores, conocimientos y competencias para la vida.",
      vision: "Ser una institución educativa líder en formación integral y excelencia académica.",
      history: "Nuestra institución tiene una rica historia de más de 50 años formando generaciones de estudiantes exitosos. Fundada en 1970, hemos sido pioneros en educación de calidad en la región.",
      
      // Información de contacto expandida
      contact: {
        address: "Calle Principal #123, Valdivia",
        phone: "+56 63 2111111",
        email: "contacto@ievaldivia.edu.cl",
        website: "www.ievaldivia.edu.cl",
        schedule: "Lunes a Viernes: 8:00 AM - 6:00 PM"
      },
      
      // Equipo directivo
      team: [
        {
          id: 1,
          name: "María Elena González",
          role: "Directora General",
          photo: "/src/assets/placeholder.png",
          email: "direccion@ievaldivia.edu.cl",
          phone: "+56 63 2111112"
        },
        {
          id: 2,
          name: "Carlos Rodríguez",
          role: "Subdirector Académico",
          photo: "/src/assets/placeholder.png",
          email: "academico@ievaldivia.edu.cl",
          phone: "+56 63 2111113"
        },
        {
          id: 3,
          name: "Ana Patricia Silva",
          role: "Coordinadora de Convivencia",
          photo: "/src/assets/placeholder.png",
          email: "convivencia@ievaldivia.edu.cl",
          phone: "+56 63 2111114"
        }
      ],
      
      // Galería institucional
      gallery: [
        {
          id: 1,
          image: "/src/assets/placeholder.png",
          title: "Fachada Principal",
          description: "Vista frontal de nuestra institución"
        },
        {
          id: 2,
          image: "/src/assets/placeholder.png",
          title: "Laboratorio de Ciencias",
          description: "Modernas instalaciones para experimentos"
        },
        {
          id: 3,
          image: "/src/assets/placeholder.png",
          title: "Biblioteca",
          description: "Espacio de estudio y investigación"
        }
      ],
      
      // Logros y reconocimientos
      achievements: [
        {
          id: 1,
          year: "2023",
          title: "Mejor Institución Educativa Regional",
          description: "Reconocimiento por excelencia académica"
        },
        {
          id: 2,
          year: "2022",
          title: "Proyecto de Innovación Educativa",
          description: "Premio nacional por metodologías innovadoras"
        }
      ],
      
      // Información adicional
      extra: {
        values: "Respeto, Responsabilidad, Excelencia, Innovación, Solidaridad",
        enrollment: "850 estudiantes",
        teachers: "45 docentes especializados",
        levels: "Preescolar, Primaria, Secundaria"
      }
    };
    localStorage.setItem("aboutContent", JSON.stringify(def));
    return def;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error parsing aboutContent", e);
    return getStoredAbout(); // Recursive call to get default
  }
}

function saveStoredAbout(obj) {
  localStorage.setItem("aboutContent", JSON.stringify(obj));
  window.dispatchEvent(new CustomEvent("aboutUpdated", { detail: obj }));
}

function isAdmin() {
  const u = JSON.parse(localStorage.getItem("user") || "{}");
  return u && u.role === "admin";
}

function escapeHtml(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Render público mejorado
export function renderAbout(container) {
  const about = getStoredAbout();
  
  container.innerHTML = `
    <section class="about-section">
      <!-- Hero Section -->
      <div class="about-hero">
        <img class="about-hero-img" src="${escapeHtml(about.heroImage || '/src/assets/placeholder.png')}" alt="Imagen institucional" />
        <div class="about-hero-overlay">
          <h1 class="about-title">${escapeHtml(about.title || 'Sobre Nosotros')}</h1>
          <p class="about-subtitle">${escapeHtml(about.subtitle || '')}</p>
        </div>
      </div>

      <!-- Información Básica -->
      <div class="about-grid">
        <div class="about-card">
          <h3>🎯 Misión</h3>
          <p>${escapeHtml(about.mission || '')}</p>
        </div>
        <div class="about-card">
          <h3>🔮 Visión</h3>
          <p>${escapeHtml(about.vision || '')}</p>
        </div>
        <div class="about-card full">
          <h3>📚 Historia</h3>
          <p>${escapeHtml(about.history || '')}</p>
        </div>
      </div>

      <!-- Información Adicional -->
      ${about.extra ? `
      <div class="about-grid">
        <div class="about-card">
          <h3>⭐ Valores Institucionales</h3>
          <p>${escapeHtml(about.extra.values || '')}</p>
        </div>
        <div class="about-card">
          <h3>👥 Nuestra Comunidad</h3>
          <p><strong>Estudiantes:</strong> ${escapeHtml(about.extra.enrollment || '')}</p>
          <p><strong>Docentes:</strong> ${escapeHtml(about.extra.teachers || '')}</p>
          <p><strong>Niveles:</strong> ${escapeHtml(about.extra.levels || '')}</p>
        </div>
      </div>
      ` : ''}

      <!-- Equipo Directivo -->
      ${about.team && about.team.length ? `
      <div class="team-section">
        <h2 style="text-align: center; color: var(--accent-light); font-size: 32px; margin-bottom: 24px;">👥 Equipo Directivo</h2>
        <div class="team-grid">
          ${about.team.map(member => `
            <div class="team-member">
              <img src="${escapeHtml(member.photo || '/src/assets/placeholder.png')}" alt="${escapeHtml(member.name)}" />
              <h4>${escapeHtml(member.name)}</h4>
              <div class="role">${escapeHtml(member.role)}</div>
              <div class="contact">
                ${member.email ? `<p>📧 ${escapeHtml(member.email)}</p>` : ''}
                ${member.phone ? `<p>📞 ${escapeHtml(member.phone)}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Información de Contacto -->
      <div class="about-card" style="margin: 40px 0;">
        <h3>📞 Información de Contacto</h3>
        <div class="contact-grid">
          ${about.contact.address ? `
          <div class="contact-item">
            <div class="contact-icon">📍</div>
            <div class="contact-info">
              <h5>Dirección</h5>
              <p>${escapeHtml(about.contact.address)}</p>
            </div>
          </div>
          ` : ''}
          ${about.contact.phone ? `
          <div class="contact-item">
            <div class="contact-icon">📞</div>
            <div class="contact-info">
              <h5>Teléfono</h5>
              <p>${escapeHtml(about.contact.phone)}</p>
            </div>
          </div>
          ` : ''}
          ${about.contact.email ? `
          <div class="contact-item">
            <div class="contact-icon">📧</div>
            <div class="contact-info">
              <h5>Email</h5>
              <p>${escapeHtml(about.contact.email)}</p>
            </div>
          </div>
          ` : ''}
          ${about.contact.website ? `
          <div class="contact-item">
            <div class="contact-icon">🌐</div>
            <div class="contact-info">
              <h5>Sitio Web</h5>
              <p>${escapeHtml(about.contact.website)}</p>
            </div>
          </div>
          ` : ''}
          ${about.contact.schedule ? `
          <div class="contact-item">
            <div class="contact-icon">🕒</div>
            <div class="contact-info">
              <h5>Horario de Atención</h5>
              <p>${escapeHtml(about.contact.schedule)}</p>
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Galería Institucional -->
      ${about.gallery && about.gallery.length ? `
      <div class="gallery-section">
        <h2 style="text-align: center; color: var(--accent-light); font-size: 32px; margin-bottom: 24px;">🏫 Galería Institucional</h2>
        <div class="gallery-grid">
          ${about.gallery.map(item => `
            <div class="gallery-item" onclick="openImageModal('${escapeHtml(item.image)}', '${escapeHtml(item.title)}')">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
              <div class="gallery-overlay">
                <p>${escapeHtml(item.title)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Logros y Reconocimientos -->
      ${about.achievements && about.achievements.length ? `
      <div class="about-card" style="margin: 40px 0;">
        <h3>🏆 Logros y Reconocimientos</h3>
        <div style="display: grid; gap: 16px; margin-top: 16px;">
          ${about.achievements.map(achievement => `
            <div style="padding: 16px; background: rgba(37,99,235,0.1); border-radius: var(--radius-sm); border: 1px solid var(--border);">
              <div style="display: flex; gap: 16px; align-items: center;">
                <div style="background: var(--accent); color: var(--white); padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px;">
                  ${escapeHtml(achievement.year)}
                </div>
                <div style="flex: 1;">
                  <h5 style="margin: 0 0 4px 0; color: var(--text);">${escapeHtml(achievement.title)}</h5>
                  <p style="margin: 0; color: var(--muted); font-size: 14px;">${escapeHtml(achievement.description)}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Botones de Administración -->
      ${isAdmin() ? `
      <div class="about-admin-actions">
        <h3 style="margin-bottom: 20px; color: var(--text);">⚙️ Panel de Administración</h3>
        
      </div>
      ` : ''}
    </section>
  `;

  // Event listeners
  if (isAdmin()) {
    const btn = container.querySelector("#editAboutBtn");
    if (btn) btn.addEventListener("click", openEditAboutModal);
  }
}

// Modal editor súper completo
export function openEditAboutModal() {
  if (!isAdmin()) {
    showToast("❌ Solo los administradores pueden editar esta sección", "error");
    return;
  }

  // Evitar duplicados
  if (document.getElementById("aboutEditModal")) return;

  const about = getStoredAbout();

  const modal = document.createElement("div");
  modal.id = "aboutEditModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content about-edit-modal">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <h3>⚙️ Editar Información Institucional</h3>
        <button id="closeAboutEdit" class="btn-cancelar">✕ Cerrar</button>
      </header>

      <!-- Tabs de navegación -->
      <div class="about-edit-tabs">
        <button class="about-tab active" data-tab="basic">📝 Básico</button>
        <button class="about-tab" data-tab="team">👥 Equipo</button>
        <button class="about-tab" data-tab="contact">📞 Contacto</button>
        <button class="about-tab" data-tab="gallery">🖼️ Galería</button>
        <button class="about-tab" data-tab="achievements">🏆 Logros</button>
        <button class="about-tab" data-tab="extra">⭐ Extra</button>
      </div>

      <!-- Contenido de tabs -->
      <div id="basicTab" class="tab-content active">
        <div class="about-edit-grid">
          <label>🏷️ Título Principal</label>
          <input id="about_title" value="${escapeHtml(about.title||'')}" placeholder="Ej: Sobre Nosotros" />

          <label>📝 Subtítulo</label>
          <input id="about_subtitle" value="${escapeHtml(about.subtitle||'')}" placeholder="Ej: Conoce a nuestra institución" />

          <label>🖼️ Imagen Principal (URL)</label>
          <input id="about_hero_url" value="${escapeHtml(about.heroImage||'')}" placeholder="https://..." />
          
          <label>📁 Subir imagen principal</label>
          <input type="file" id="about_hero_file" accept="image/*" />

          <label>🎯 Misión</label>
          <textarea id="about_mission" rows="3" placeholder="Describe la misión institucional...">${escapeHtml(about.mission||'')}</textarea>

          <label>🔮 Visión</label>
          <textarea id="about_vision" rows="3" placeholder="Describe la visión institucional...">${escapeHtml(about.vision||'')}</textarea>

          <label>📚 Historia</label>
          <textarea id="about_history" rows="5" placeholder="Cuenta la historia de la institución...">${escapeHtml(about.history||'')}</textarea>
        </div>
      </div>

      <div id="teamTab" class="tab-content">
        <div id="teamList"></div>
        <button id="addTeamMember" class="btn-publicar" style="margin-top: 16px;">➕ Agregar Miembro</button>
      </div>

      <div id="contactTab" class="tab-content">
        <div class="about-edit-grid">
          <label>📍 Dirección</label>
          <input id="contact_address" value="${escapeHtml(about.contact?.address||'')}" placeholder="Calle Principal #123..." />

          <label>📞 Teléfono Principal</label>
          <input id="contact_phone" value="${escapeHtml(about.contact?.phone||'')}" placeholder="+56 63 2111111" />

          <label>📧 Email Principal</label>
          <input id="contact_email" value="${escapeHtml(about.contact?.email||'')}" placeholder="contacto@institucion.edu" />

          <label>🌐 Sitio Web</label>
          <input id="contact_website" value="${escapeHtml(about.contact?.website||'')}" placeholder="www.institucion.edu" />

          <label>🕒 Horario de Atención</label>
          <input id="contact_schedule" value="${escapeHtml(about.contact?.schedule||'')}" placeholder="Lunes a Viernes: 8:00 AM - 6:00 PM" />
        </div>
      </div>

      <div id="galleryTab" class="tab-content">
        <div id="galleryList"></div>
        <button id="addGalleryItem" class="btn-publicar" style="margin-top: 16px;">➕ Agregar Imagen</button>
      </div>

      <div id="achievementsTab" class="tab-content">
        <div id="achievementsList"></div>
        <button id="addAchievement" class="btn-publicar" style="margin-top: 16px;">➕ Agregar Logro</button>
      </div>

      <div id="extraTab" class="tab-content">
        <div class="about-edit-grid">
          <label>⭐ Valores Institucionales</label>
          <textarea id="extra_values" rows="2" placeholder="Respeto, Responsabilidad, Excelencia...">${escapeHtml(about.extra?.values||'')}</textarea>

          <label>👥 Número de Estudiantes</label>
          <input id="extra_enrollment" value="${escapeHtml(about.extra?.enrollment||'')}" placeholder="850 estudiantes" />

          <label>👨‍🏫 Número de Docentes</label>
          <input id="extra_teachers" value="${escapeHtml(about.extra?.teachers||'')}" placeholder="45 docentes especializados" />

          <label>🎓 Niveles Educativos</label>
          <input id="extra_levels" value="${escapeHtml(about.extra?.levels||'')}" placeholder="Preescolar, Primaria, Secundaria" />
        </div>
      </div>

      <!-- Botones de acción -->
      <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;padding-top:24px;border-top:2px solid var(--border);">
        <button id="saveAbout" class="btn-publicar">💾 Guardar Cambios</button>
        <button id="cancelAbout" class="btn-cancelar">❌ Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners básicos
  modal.querySelector("#closeAboutEdit").onclick = () => modal.remove();
  modal.querySelector("#cancelAbout").onclick = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });

  // Tab switching
  modal.querySelectorAll('.about-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      modal.querySelectorAll('.about-tab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const tabId = tab.dataset.tab + 'Tab';
      modal.querySelector('#' + tabId).classList.add('active');
    });
  });

  // Initialize dynamic sections
  renderTeamList(modal, about.team || []);
  renderGalleryList(modal, about.gallery || []);
  renderAchievementsList(modal, about.achievements || []);

  // File upload handler
  modal.querySelector("#about_hero_file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("❌ Máximo 2MB para la imagen", "error");
      return;
    }
    try {
      const dataUrl = await fileToDataURL(file);
      modal.querySelector("#about_hero_url").value = dataUrl;
      showToast("✅ Imagen cargada", "success");
    } catch (err) {
      showToast("❌ Error al cargar imagen", "error");
    }
  });

  // Save handler
  modal.querySelector("#saveAbout").addEventListener("click", saveAboutData);
}

function renderTeamList(modal, team) {
  const container = modal.querySelector('#teamList');
  if (!team.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--muted); border: 2px dashed var(--border); border-radius: var(--radius);">
        <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
        <h4>No hay miembros del equipo</h4>
        <p>Agrega el primer miembro usando el botón de abajo</p>
      </div>
    `;
    return;
  }

  container.innerHTML = team.map((member, index) => `
    <div class="team-member-edit" data-index="${index}">
      <h5>👤 Miembro ${index + 1}</h5>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <label>Nombre completo</label>
          <input class="team-name" value="${escapeHtml(member.name || '')}" placeholder="Juan Pérez" />
        </div>
        <div>
          <label>Cargo</label>
          <input class="team-role" value="${escapeHtml(member.role || '')}" placeholder="Director General" />
        </div>
        <div>
          <label>Email</label>
          <input class="team-email" value="${escapeHtml(member.email || '')}" placeholder="juan@institucion.edu" />
        </div>
        <div>
          <label>Teléfono</label>
          <input class="team-phone" value="${escapeHtml(member.phone || '')}" placeholder="+56 63 2111111" />
        </div>
      </div>
      <div style="margin-top: 16px;">
        <label>Foto (URL)</label>
        <input class="team-photo" value="${escapeHtml(member.photo || '')}" placeholder="https://..." />
        <input type="file" class="team-photo-file" accept="image/*" style="margin-top: 8px;" />
        ${member.photo ? `<img src="${member.photo}" class="image-upload-preview" />` : ''}
      </div>
      <div style="text-align: right; margin-top: 16px;">
        <button class="btn-cancelar" onclick="removeTeamMember(${index})">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');

  // Add event listeners for photo uploads
  container.querySelectorAll('.team-photo-file').forEach((input, index) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 1024 * 1024) {
        showToast("❌ Máximo 1MB para fotos", "error");
        return;
      }
      try {
        const dataUrl = await fileToDataURL(file);
        const photoInput = container.querySelector(`.team-member-edit[data-index="${index}"] .team-photo`);
        photoInput.value = dataUrl;
        
        // Update preview
        let preview = container.querySelector(`.team-member-edit[data-index="${index}"] .image-upload-preview`);
        if (!preview) {
          preview = document.createElement('img');
          preview.className = 'image-upload-preview';
          input.parentNode.appendChild(preview);
        }
        preview.src = dataUrl;
        
        showToast("✅ Foto cargada", "success");
      } catch (err) {
        showToast("❌ Error al cargar foto", "error");
      }
    });
  });

  // Add team member button
  modal.querySelector('#addTeamMember').onclick = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      role: '',
      photo: '',
      email: '',
      phone: ''
    };
    team.push(newMember);
    renderTeamList(modal, team);
  };
}

function renderGalleryList(modal, gallery) {
  const container = modal.querySelector('#galleryList');
  if (!gallery.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--muted); border: 2px dashed var(--border); border-radius: var(--radius);">
        <div style="font-size: 48px; margin-bottom: 16px;">🖼️</div>
        <h4>No hay imágenes en la galería</h4>
        <p>Agrega la primera imagen usando el botón de abajo</p>
      </div>
    `;
    return;
  }

  container.innerHTML = gallery.map((item, index) => `
    <div class="team-member-edit" data-index="${index}">
      <h5>🖼️ Imagen ${index + 1}</h5>
      <div style="display: grid; gap: 16px;">
        <div>
          <label>Título</label>
          <input class="gallery-title" value="${escapeHtml(item.title || '')}" placeholder="Laboratorio de Ciencias" />
        </div>
        <div>
          <label>Descripción</label>
          <input class="gallery-description" value="${escapeHtml(item.description || '')}" placeholder="Descripción breve..." />
        </div>
        <div>
          <label>URL de imagen</label>
          <input class="gallery-image" value="${escapeHtml(item.image || '')}" placeholder="https://..." />
          <input type="file" class="gallery-image-file" accept="image/*" style="margin-top: 8px;" />
          ${item.image ? `<img src="${item.image}" style="width: 200px; height: 120px; object-fit: cover; border-radius: 8px; margin-top: 8px;" />` : ''}
        </div>
      </div>
      <div style="text-align: right; margin-top: 16px;">
        <button class="btn-cancelar" onclick="removeGalleryItem(${index})">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');

  // Add event listeners for image uploads
  container.querySelectorAll('.gallery-image-file').forEach((input, index) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast("❌ Máximo 2MB para imágenes", "error");
        return;
      }
      try {
        const dataUrl = await fileToDataURL(file);
        const imageInput = container.querySelector(`.team-member-edit[data-index="${index}"] .gallery-image`);
        imageInput.value = dataUrl;
        showToast("✅ Imagen cargada", "success");
        renderGalleryList(modal, gallery); // Re-render to show preview
      } catch (err) {
        showToast("❌ Error al cargar imagen", "error");
      }
    });
  });

  modal.querySelector('#addGalleryItem').onclick = () => {
    const newItem = {
      id: Date.now(),
      title: '',
      description: '',
      image: ''
    };
    gallery.push(newItem);
    renderGalleryList(modal, gallery);
  };
}

function renderAchievementsList(modal, achievements) {
  const container = modal.querySelector('#achievementsList');
  if (!achievements.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--muted); border: 2px dashed var(--border); border-radius: var(--radius);">
        <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
        <h4>No hay logros registrados</h4>
        <p>Agrega el primer logro usando el botón de abajo</p>
      </div>
    `;
    return;
  }

  container.innerHTML = achievements.map((achievement, index) => `
    <div class="team-member-edit" data-index="${index}">
      <h5>🏆 Logro ${index + 1}</h5>
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 16px;">
        <div>
          <label>Año</label>
          <input class="achievement-year" value="${escapeHtml(achievement.year || '')}" placeholder="2023" style="width: 80px;" />
        </div>
        <div>
          <label>Título</label>
          <input class="achievement-title" value="${escapeHtml(achievement.title || '')}" placeholder="Mejor Institución Regional" />
        </div>
      </div>
      <div style="margin-top: 16px;">
        <label>Descripción</label>
        <textarea class="achievement-description" rows="2" placeholder="Descripción del logro...">${escapeHtml(achievement.description || '')}</textarea>
      </div>
      <div style="text-align: right; margin-top: 16px;">
        <button class="btn-cancelar" onclick="removeAchievement(${index})">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');

  modal.querySelector('#addAchievement').onclick = () => {
    const newAchievement = {
      id: Date.now(),
      year: new Date().getFullYear().toString(),
      title: '',
      description: ''
    };
    achievements.push(newAchievement);
    renderAchievementsList(modal, achievements);
  };
}

// Global functions for removing items
window.removeTeamMember = function(index) {
  if (!confirm('¿Eliminar este miembro del equipo?')) return;
  const modal = document.getElementById('aboutEditModal');
  const about = getStoredAbout();
  about.team.splice(index, 1);
  renderTeamList(modal, about.team);
  showToast("🗑️ Miembro eliminado", "success");
};

window.removeGalleryItem = function(index) {
  if (!confirm('¿Eliminar esta imagen?')) return;
  const modal = document.getElementById('aboutEditModal');
  const about = getStoredAbout();
  about.gallery.splice(index, 1);
  renderGalleryList(modal, about.gallery);
  showToast("🗑️ Imagen eliminada", "success");
};

window.removeAchievement = function(index) {
  if (!confirm('¿Eliminar este logro?')) return;
  const modal = document.getElementById('aboutEditModal');
  const about = getStoredAbout();
  about.achievements.splice(index, 1);
  renderAchievementsList(modal, about.achievements);
  showToast("🗑️ Logro eliminado", "success");
};

// Global function for opening image modal
window.openImageModal = function(imageSrc, title) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px; text-align: center;">
      <h3>${escapeHtml(title)}</h3>
      <img src="${escapeHtml(imageSrc)}" style="width: 100%; max-height: 70vh; object-fit: contain; border-radius: var(--radius);" />
      <div style="margin-top: 20px;">
        <button class="btn-cancelar" onclick="this.closest('.modal').remove()">✕ Cerrar</button>
      </div>
    </div>
  `;
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  document.body.appendChild(modal);
};

function saveAboutData() {
  const modal = document.getElementById('aboutEditModal');
  
  // Collect team data
  const team = [];
  modal.querySelectorAll('.team-member-edit').forEach(memberEl => {
    const member = {
      id: Date.now() + Math.random(),
      name: memberEl.querySelector('.team-name').value.trim(),
      role: memberEl.querySelector('.team-role').value.trim(),
      email: memberEl.querySelector('.team-email').value.trim(),
      phone: memberEl.querySelector('.team-phone').value.trim(),
      photo: memberEl.querySelector('.team-photo').value.trim()
    };
    if (member.name || member.role) team.push(member);
  });

  // Collect gallery data
  const gallery = [];
  modal.querySelectorAll('#galleryList .team-member-edit').forEach(itemEl => {
    const item = {
      id: Date.now() + Math.random(),
      title: itemEl.querySelector('.gallery-title').value.trim(),
      description: itemEl.querySelector('.gallery-description').value.trim(),
      image: itemEl.querySelector('.gallery-image').value.trim()
    };
    if (item.title || item.image) gallery.push(item);
  });

  // Collect achievements data
  const achievements = [];
  modal.querySelectorAll('#achievementsList .team-member-edit').forEach(achievementEl => {
    const achievement = {
      id: Date.now() + Math.random(),
      year: achievementEl.querySelector('.achievement-year').value.trim(),
      title: achievementEl.querySelector('.achievement-title').value.trim(),
      description: achievementEl.querySelector('.achievement-description').value.trim()
    };
    if (achievement.title) achievements.push(achievement);
  });

  const newAboutData = {
    title: modal.querySelector("#about_title").value.trim(),
    subtitle: modal.querySelector("#about_subtitle").value.trim(),
    heroImage: modal.querySelector("#about_hero_url").value.trim(),
    mission: modal.querySelector("#about_mission").value.trim(),
    vision: modal.querySelector("#about_vision").value.trim(),
    history: modal.querySelector("#about_history").value.trim(),
    
    contact: {
      address: modal.querySelector("#contact_address").value.trim(),
      phone: modal.querySelector("#contact_phone").value.trim(),
      email: modal.querySelector("#contact_email").value.trim(),
      website: modal.querySelector("#contact_website").value.trim(),
      schedule: modal.querySelector("#contact_schedule").value.trim()
    },
    
    team: team,
    gallery: gallery,
    achievements: achievements,
    
    extra: {
      values: modal.querySelector("#extra_values").value.trim(),
      enrollment: modal.querySelector("#extra_enrollment").value.trim(),
      teachers: modal.querySelector("#extra_teachers").value.trim(),
      levels: modal.querySelector("#extra_levels").value.trim()
    }
  };

  saveStoredAbout(newAboutData);

  // Re-render About section if present
  const main = document.getElementById("main-content");
  if (main) {
    const active = document.querySelector('.nav-btn.active')?.getAttribute('data-page');
    if (active === 'about') {
      renderAbout(main);
    }
  }

  modal.remove();
  showToast("✅ Cambios guardados exitosamente", "success");
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Error al leer archivo"));
    reader.readAsDataURL(file);
  });
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
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}