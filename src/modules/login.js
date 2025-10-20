// src/modules/login.js
export function renderLogin(container) {
  // Add login background class
  document.body.classList.add('login-background');

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 40px 20px;">
      <div class="login-card animated-fade-in">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 64px; margin-bottom: 16px;">🏫</div>
          <h2 class="login-title">Iniciar Sesión</h2>
          <p style="color: var(--muted); margin: 0;">Portal Educativo IE Valdivia</p>
        </div>
        
        <form id="login-form" class="login-form">
          <div>
            <label for="login-username">👤 Usuario</label>
            <input type="text" id="login-username" placeholder="Ingresa tu nombre de usuario" required />
          </div>

          <div>
            <label for="login-role">🎭 Rol</label>
            <select id="login-role" required>
              <option value="visitante">🎓 Visitante</option>
              <option value="admin">👨‍💼 Administrador</option>
            </select>
          </div>

          <div id="admin-password-container" style="display: none;">
            <label for="admin-password">🔐 Contraseña de administrador</label>
            <input type="password" id="admin-password" placeholder="Contraseña especial" />
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">
              Contraseña requerida para acceso administrativo
            </div>
          </div>

          <button type="submit" class="btn-ingresar">
            🚀 Entrar al Portal
          </button>

          <div style="text-align: center; margin-top: 20px;">
            <p class="register-link">
              ¿Eres nuevo? <a href="#" id="go-register">Regístrate aquí</a>
            </p>
          </div>
        </form>
        
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); text-align: center;">
          <div style="color: var(--muted); font-size: 14px; margin-bottom: 8px;">
            <strong>Demo para pruebas:</strong>
          </div>
          <div style="display: grid; gap: 8px; font-size: 13px; color: var(--accent-light);">
            <div>🎓 <strong>Visitante:</strong> Acceso de solo lectura</div>
            <div>👨‍💼 <strong>Admin:</strong> Contraseña: <code style="background: rgba(37,99,235,0.1); padding: 2px 6px; border-radius: 4px;">12</code></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Handle role selection
  const roleSelect = container.querySelector('#login-role');
  const passwordContainer = container.querySelector('#admin-password-container');
  
  roleSelect.addEventListener('change', () => {
    if (roleSelect.value === 'admin') {
      passwordContainer.style.display = 'block';
      passwordContainer.style.animation = 'fadeInDown 0.3s ease-out';
    } else {
      passwordContainer.style.display = 'none';
    }
  });

  // Handle registration link
  container.querySelector('#go-register').addEventListener('click', (e) => {
    e.preventDefault();
    import('./Register.js').then(mod => {
      mod.renderRegister(container);
    }).catch(() => {
      showToast("⚠️ Registro temporalmente no disponible", "error");
    });
  });

  // Handle form submission
  container.querySelector('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin(container);
  });

  // Auto-focus username input
  setTimeout(() => {
    const usernameInput = container.querySelector('#login-username');
    if (usernameInput) usernameInput.focus();
  }, 100);
}

function handleLogin(container) {
  const username = container.querySelector('#login-username').value.trim();
  const role = container.querySelector('#login-role').value;
  const password = container.querySelector('#admin-password').value;

  // Validation
  if (!username) {
    showToast("❌ Por favor ingresa tu nombre de usuario", "error");
    return;
  }

  if (username.length < 2) {
    showToast("❌ El nombre de usuario debe tener al menos 2 caracteres", "error");
    return;
  }

  // Admin password validation
  if (role === 'admin') {
    if (!password) {
      showToast("❌ La contraseña de administrador es requerida", "error");
      return;
    }
    
    if (password !== '12') {
      showToast("❌ Contraseña de administrador incorrecta", "error");
      // Add shake animation to password field
      const passwordInput = container.querySelector('#admin-password');
      passwordInput.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        passwordInput.style.animation = '';
        passwordInput.focus();
        passwordInput.select();
      }, 500);
      return;
    }
  }

  // Create user object
  const user = {
    username: username,
    role: role,
    loginTime: new Date().toISOString(),
    avatar: username[0].toUpperCase()
  };

  // Save to localStorage
  try {
    localStorage.setItem('user', JSON.stringify(user));
    
    // Remove login background
    document.body.classList.remove('login-background');
    
    // Show success message
    showToast(`🎉 ¡Bienvenido${role === 'admin' ? ', Administrador' : ''} ${username}!`, "success");
    
    // Smooth transition back to main app
    container.style.animation = 'fadeOut 0.5s ease-out';
    
    setTimeout(() => {
      // Reload the entire application to refresh layout with new user
      location.reload();
    }, 1000);
    
  } catch (error) {
    showToast("❌ Error al guardar los datos del usuario", "error");
    console.error('Login error:', error);
  }
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

// Add shake animation for error states
const shakeKeyframes = `
@keyframes shake {
  0%, 20%, 40%, 60%, 80% {
    transform: translateX(-10px);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}
`;

// Add fadeOut animation
const fadeOutKeyframes = `
@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
`;

// Inject animations if not already present
if (!document.querySelector('#login-animations')) {
  const style = document.createElement('style');
  style.id = 'login-animations';
  style.textContent = shakeKeyframes + fadeOutKeyframes;
  document.head.appendChild(style);
}