import {defineConfig} from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TracespaceParser',
      fileName: (format: string) => `tracespace-parser.${format}.js`,
    },
  },
})
