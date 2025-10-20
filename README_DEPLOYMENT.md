# 🚀 Guía de Despliegue - Portal Escolar IE Valdivia

## 📋 Requisitos del Sistema

### Desarrollo Local
- Node.js 18+ 
- npm o yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Producción
- Servidor web (Apache, Nginx, o cualquier servidor estático)
- HTTPS recomendado
- Dominio propio (opcional)

## 🛠️ Instalación y Configuración

### 1. Clonar el Proyecto
```bash
git clone [URL_DEL_REPOSITORIO]
cd ie-valdivia-project
```

### 2. Instalar Dependencias
```bash
npm install
# o
yarn install
```

### 3. Desarrollo Local
```bash
npm run dev
# o
yarn dev
```

El proyecto estará disponible en:
- **Local**: http://localhost:3001
- **Red**: http://[TU_IP]:3001

## 🚀 Despliegue en Producción

### 1. Construir para Producción
```bash
npm run build
# o
yarn build
```

Esto creará una carpeta `dist/` con todos los archivos optimizados.

### 2. Opciones de Hosting

#### A) Netlify (Recomendado - Gratis)
1. Registrarse en [netlify.com](https://netlify.com)
2. Conectar con GitHub/GitLab
3. Configurar build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Deploy automático ✅

#### B) Vercel (Gratis)
1. Registrarse en [vercel.com](https://vercel.com)
2. Conectar repositorio
3. Deploy automático ✅

#### C) GitHub Pages
1. Instalar gh-pages: `npm install --save-dev gh-pages`
2. Agregar en package.json:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://[tu-usuario].github.io/[nombre-repo]"
}
```
3. Ejecutar: `npm run deploy`

#### D) Servidor Propio (VPS/Hosting)
1. Construir: `npm run build`
2. Subir carpeta `dist/` al servidor
3. Configurar servidor web (ver ejemplos abajo)

## ⚙️ Configuración del Servidor Web

### Apache (.htaccess)
Crear archivo `.htaccess` en la carpeta dist:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Habilitar compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

### Nginx
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/a/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔧 Configuración Avanzada

### Variables de Entorno
Crear archivo `.env.production`:
```bash
# URL base (ajustar según hosting)
VITE_BASE_URL=https://tu-dominio.com

# Modo de producción
NODE_ENV=production
```

### Personalización
1. **Logo**: Reemplazar `/src/assets/logo-default.png`
2. **Colores**: Modificar variables CSS en `/src/style.css`
3. **Contenido**: El contenido se gestiona desde el panel de admin

## 📱 Optimización Móvil

El proyecto ya incluye:
- ✅ Diseño responsive completo
- ✅ Touch-friendly interfaces
- ✅ Imágenes optimizadas
- ✅ Carga rápida en móviles

## 🛡️ Seguridad

### HTTPS (Recomendado)
- **Netlify/Vercel**: HTTPS automático
- **Servidor propio**: Configurar SSL/TLS (Let's Encrypt gratis)

### Contenido
- ✅ Sanitización de HTML automática
- ✅ Validación de URLs
- ✅ Prevención XSS

## 📊 Monitoreo

### Analytics (Opcional)
Agregar Google Analytics en `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔄 Mantenimiento

### Respaldos
El sistema incluye función de export/import de datos desde el panel de admin.

### Actualizaciones
1. Hacer cambios en desarrollo
2. Probar localmente
3. Construir para producción
4. Desplegar

## 🆘 Solución de Problemas

### Error: Página en blanco
- Verificar ruta base en `vite.config.js`
- Comprobar configuración del servidor web
- Revisar consola del navegador

### Error: Assets no cargan
- Verificar rutas relativas
- Comprobar configuración CORS del servidor
- Revisar permisos de archivos

### Error: Función no disponible
- Verificar que JavaScript esté habilitado
- Comprobar compatibilidad del navegador
- Revisar errores en consola

## 📞 Soporte

Para problemas técnicos:
1. Revisar consola del navegador (F12)
2. Verificar configuraciones
3. Contactar al desarrollador

---

## 🎯 Checklist de Despliegue

### Antes del Deploy
- [ ] Probar todas las funciones localmente
- [ ] Verificar responsive en móviles
- [ ] Comprobar que todas las imágenes cargan
- [ ] Revisar contenido de prueba
- [ ] Configurar dominio (si aplica)

### Después del Deploy
- [ ] Verificar que el sitio carga correctamente
- [ ] Probar navegación en móvil y desktop
- [ ] Comprobar funciones de admin
- [ ] Verificar formularios y botones
- [ ] Configurar analytics (opcional)

### Mantenimiento Regular
- [ ] Backup de datos mensual
- [ ] Revisar actualizaciones de seguridad
- [ ] Monitorear rendimiento
- [ ] Actualizar contenido regularmente

¡Tu Portal Escolar IE Valdivia está listo para producción! 🎉