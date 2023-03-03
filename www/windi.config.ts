import {defineConfig} from 'windicss/helpers'
import defaultTheme from 'windicss/defaultTheme'
import plugin from 'windicss/plugin'

export default defineConfig({
  attributify: true,
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open SansVariable', ...defaultTheme.fontFamily.sans],
      },
      cursor: {
        grab: 'grab',
      },
    },
  },
  plugins: [
    plugin(({addVariant}) => {
      addVariant('slider-thumb', ({modifySelectors}) => {
        return modifySelectors(({className}) => {
          return `input[type=range]${className}::-webkit-slider-thumb`
        })
      })
    }),
  ],
})
