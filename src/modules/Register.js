// src/modules/Register.js
export function renderRegister(container) {
  container.innerHTML = `
    <div class="login-background">
      <section class="login-card">
        <h2 class="login-title">📝 Registro</h2>
        <form id="register-form" class="login-form">
          <label>Usuario</label>
          <input id="reg-username" required />
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
            <button class="btn-publicar" type="submit">Registrar (visitante)</button>
          </div>
        </form>
      </section>
    </div>
  `;

  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    if (!username) return;
    const user = { username, role: "visitante" };
    localStorage.setItem("user", JSON.stringify(user));
    location.reload();
  });
}