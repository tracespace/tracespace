import {defineConfig} from 'vite'
import preact from '@preact/preset-vite'
import windiCSS from 'vite-plugin-windicss'
import mdx from '@mdx-js/rollup'
import ssr from 'vite-plugin-ssr/plugin'

export default defineConfig({
  plugins: [preact(), mdx(), ssr(), windiCSS()],
  resolve: {
    conditions: ['source'],
  },
})
