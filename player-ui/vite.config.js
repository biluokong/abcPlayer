import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    /*AutoImport({
      resolvers: [ElementPlusResolver()],
    }),*/
    /*Components({
      resolvers: [ElementPlusResolver()]
      // dts: true,  // 👈 添加这一行，会在 src 下生成 components.d.ts
    }),*/
    obfuscatorPlugin({
      // 1. 插件控制参数
      include: [/\.(jsx?|cjs|mjs)$/], // 只混淆 JS 文件，避免处理 Vue 文件导致警告
      exclude: [/node_modules/],      // 排除第三方库，防止其运行异常
      apply: 'build',                 // 仅在构建时混淆，不影响开发体验
      // 2. javascript-obfuscator 核心混淆选项
      options: {
        // 基础混淆 (推荐开启)
        compact: true,                           // 压缩代码，移除空格和注释
        identifierNamesGenerator: 'hexadecimal', // 将变量名转为十六进制字符串
        simplify: true,                          // 简化代码结构

        // 对性能影响小，可选的增强项
        disableConsoleOutput: true,              // 移除 console.log，防止调试信息泄露
        numbersToExpressions: true,              // 将数字转为表达式 (如 1+2)
        transformObjectKeys: true,               // 混淆对象的键名

        // 高级混淆选项 (建议谨慎开启，会显著影响性能)
        controlFlowFlattening: false,            // 控制流扁平化，严重影响性能
        deadCodeInjection: false,                // 注入死代码，大幅增加代码体积
        debugProtection: false,                  // 调试保护，可能导致浏览器卡死
        selfDefending: false,                    // 自我保护，增加代码复杂性
        stringArray: false                      // 字符串数组混淆，会增加代码复杂度
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8900',
        changeOrigin: true
      }
    }
  }
  /*build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: {
        // 默认 Terser 只混淆函数内部的局部变量。开启此项后，连模块直接导出的函数名也会被缩短。
        toplevel: true, // 混淆顶层变量名
      },
      format: {
        comments: false,
      }
    }
  }*/
})
