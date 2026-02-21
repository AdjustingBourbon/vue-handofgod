import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // 核心配置：base 必须等于仓库名，结尾带斜杠（适配GitHub Pages项目站点）
  base: '/improv-host/',//main分支保留'/'，gh-pages分支使用'/improv-host/'
  plugins: [vue()],
  resolve: {
    // 可选：配置路径别名（若你项目用到了@，需保留；没用到可删除）
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    // 可选：确保打包输出目录为dist（Vite默认值，显式声明更清晰）
    outDir: 'dist',
    // 可选：关闭生产环境sourcemap，减少文件体积，避免额外404
    sourcemap: false
  }
})
