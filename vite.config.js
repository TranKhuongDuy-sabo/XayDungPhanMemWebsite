import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Phải có dòng import này ở trên đầu

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Nó phải nằm trong ngoặc vuông [] của plugins như thế này
  ],
})