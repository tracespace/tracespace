import {defineConfig} from 'windicss/helpers'
import defaultTheme from 'windicss/defaultTheme'

export default defineConfig({
  attributify: true,
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open SansVariable', ...defaultTheme.fontFamily.sans],
      },
    },
  },
})
