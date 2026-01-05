import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  server: {
    port: 8859,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
