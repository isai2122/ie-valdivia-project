
// src/modules/ChangePassword.js
// Modal and logic for admin to change their password (localStorage-based)
// Styled to match the project's existing inline/modal patterns.

function isAdmin() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user && user.role === "admin";
}

export function openChangePasswordModal() {
  if (!isAdmin()) {
    showToast("❌ Solo administradores pueden cambiar la contraseña", "error");
    return;
  }

  const existing = document.getElementById("changePasswordModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "changePasswordModal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "2000";
  modal.style.background = "rgba(0,0,0,0.65)";

  const box = document.createElement("div");
  box.style.width = "520px";
  box.style.maxWidth = "92%";
  box.style.background = "linear-gradient(180deg, rgba(12,18,28,0.96), rgba(3,9,18,0.98))";
  box.style.border = "1px solid rgba(66, 153, 255, 0.12)";
  box.style.boxShadow = "0 8px 30px rgba(2,6,23,0.6)";
  box.style.borderRadius = "12px";
  box.style.padding = "22px";
  box.style.color = "var(--muted)";
  box.style.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "12px";

  const title = document.createElement("h3");
  title.textContent = "🔒 Cambiar contraseña (admin)";
  title.style.margin = "0";
  title.style.color = "var(--accent-light)";
  title.style.fontSize = "18px";
  title.style.fontWeight = "700";

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✖";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.color = "var(--muted)";
  closeBtn.style.fontSize = "18px";
  closeBtn.style.cursor = "pointer";
  closeBtn.addEventListener("click", () => modal.remove());

  header.appendChild(title);
  header.appendChild(closeBtn);

  const form = document.createElement("div");
  form.style.display = "grid";
  form.style.gap = "10px";

  const inputHtml = (id, placeholder, type="password") => {
    return `<div style="display:flex;flex-direction:column;gap:6px;">
      <label for="\${id}" style="font-size:13px;color:var(--muted)">${placeholder}</label>
      <input id="\${id}" type="\${type}" style="padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:var(--muted);outline:none" />
    </div>`;
  };

  form.innerHTML = `
    ${inputHtml("currentPassword","Contraseña actual")}
    ${inputHtml("newPassword","Nueva contraseña (mín 6 caracteres)")}
    ${inputHtml("confirmPassword","Confirmar nueva contraseña")}
    <div style="display:flex;justify-content:flex-end;margin-top:4px;gap:8px;">
      <button id="cancelChangePw" style="padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:var(--muted);cursor:pointer">Cancelar</button>
      <button id="submitChangePw" style="padding:10px 16px;border-radius:10px;background:linear-gradient(90deg,#2b6cff,#4ea1ff);border:none;color:white;cursor:pointer;font-weight:600">Guardar</button>
    </div>
  `;

  box.appendChild(header);
  box.appendChild(form);

  modal.appendChild(box);
  document.body.appendChild(modal);

  document.getElementById("cancelChangePw").addEventListener("click", () => modal.remove());
  document.getElementById("submitChangePw").addEventListener("click", handleChangePassword);
}

function handleChangePassword() {
  const current = document.getElementById("currentPassword").value || "";
  const ne = document.getElementById("newPassword").value || "";
  const conf = document.getElementById("confirmPassword").value || "";

  if (!current || !ne || !conf) {
    showToast("❗ Todos los campos son obligatorios", "error");
    return;
  }
  if (ne.length < 6) {
    showToast("🔒 La nueva contraseña debe tener al menos 6 caracteres", "error");
    return;
  }
  if (ne !== conf) {
    showToast("❗ Las contraseñas no coinciden", "error");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user || user.role !== "admin") {
    showToast("❌ Usuario no autorizado", "error");
    return;
  }

  // If a password is stored in localStorage, verify it. Otherwise allow setting.
  const storedPass = localStorage.getItem("admin_password");
  if (storedPass && storedPass !== current) {
    showToast("❌ Contraseña actual incorrecta", "error");
    return;
  }

  // Save new password (in a real app this must be done server-side)
  localStorage.setItem("admin_password", ne);
  // Also update user object for convenience (hashed would be better)
  user.password = ne;
  localStorage.setItem("user", JSON.stringify(user));

  showToast("✅ Contraseña actualizada correctamente", "success");
  const modal = document.getElementById("changePasswordModal");
  if (modal) modal.remove();
}

export default {
  openChangePasswordModal,
};
