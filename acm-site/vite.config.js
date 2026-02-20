import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'fx-vendor':    ['@react-three/postprocessing', 'postprocessing'],
          'gsap-vendor':  ['gsap'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
