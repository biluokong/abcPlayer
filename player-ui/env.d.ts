/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_BASE_URL: string
  // 可以继续添加其他自定义环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}