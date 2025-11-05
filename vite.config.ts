import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/impact-incidents/',       // required for GitHub Pages
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // make @ point to /src
    },
  },
})
