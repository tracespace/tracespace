import {defineConfig} from 'vite'
import preact from '@preact/preset-vite'
import windiCSS from 'vite-plugin-windicss'
import mdx from '@mdx-js/rollup'
import ssr from 'vite-plugin-ssr/plugin'

import {baseConfig, getDefineConstants} from '../config/vite.config.base'
import packageMeta from './package.json'

export default defineConfig({
  ...baseConfig,
  define: getDefineConstants(packageMeta),
  plugins: [preact(), mdx(), ssr(), windiCSS()],
})
