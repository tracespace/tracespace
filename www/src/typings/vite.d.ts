/// <reference types="vite/client" />

interface ImportMeta {
  glob(pattern: string, options: {as: 'raw'}): Record<string, string>
}
