import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ignora warnings durante el build
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignora todos los warnings comunes
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        // Puedes agregar más códigos de warning aquí
        warn(warning)
      }
    },
    // No falla el build por warnings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    }
  },
  // Configuración para development también
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'commonjs-proxy': 'silent'
    }
  }
})