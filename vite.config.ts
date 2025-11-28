import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Tauri recommends binding to localhost and allowing external
    // host to be true when running inside the Tauri dev environment.
    host: true,
    port: 5173
  }
})
