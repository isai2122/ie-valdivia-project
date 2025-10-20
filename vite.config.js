import { defineConfig } from 'vite'

export default defineConfig({
  // Configuración para desarrollo
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: false,
    hmr: {
      port: 3002
    }
  },
  
  // Configuración para producción
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['src/modules/Layout.js'],
          home: ['src/modules/Home.js'],
          about: ['src/modules/About.js'],
          news: ['src/modules/News.js'],
          projects: ['src/modules/Projects.js']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // Configuración de assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  
  // Optimización
  optimizeDeps: {
    include: ['src/modules/**/*.js']
  },
  
  // Base URL para diferentes entornos
  base: '/',
  
  // Configuración para compatibilidad con navegadores
  esbuild: {
    target: 'es2018'
  }
})