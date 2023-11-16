import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/], // <-- allows Vue to compile Markdown files
    }),
    Markdown({ /* options */ }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/models': {
        target: 'http://127.0.0.1:14011',
        changeOrigin: true,
      },
      '/status': {
        target: 'http://127.0.0.1:14011',
        changeOrigin: true,
      },
      '/voice': {
        target: 'http://127.0.0.1:14011',
        changeOrigin: true,
      },
      '/tools': {
        target: 'http://127.0.0.1:14011',
        changeOrigin: true,
      },
      '/docs': {
        target: 'http://127.0.0.1:14011',
        changeOrigin: true,
      },
    },
  }
})
