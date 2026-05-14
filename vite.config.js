import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' 
    ? '/ti-ku-wang-zhan/'  // 改为你的仓库名
    : './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
