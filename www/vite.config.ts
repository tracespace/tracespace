import preact from '@preact/preset-vite'
import windiCSS from 'vite-plugin-windicss'
import mdx from '@mdx-js/rollup'
import ssr from 'vite-plugin-ssr/plugin'

import {defineBaseConfig} from '../config/vite.config.base'
import packageMeta from './package.json'

export default defineBaseConfig(packageMeta, {
  appType: 'custom',
  plugins: [preact(), mdx(), windiCSS(), ssr({prerender: true})],
})
