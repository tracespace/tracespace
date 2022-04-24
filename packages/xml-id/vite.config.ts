import {defineConfig} from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TracespaceXmlId',
      fileName: (format: string) => `tracespace-xml-id.${format}.js`,
    },
  },
})
