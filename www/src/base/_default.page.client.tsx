import '@fontsource/open-sans/variable.css'
import 'virtual:windi.css'
import 'virtual:windi-devtools'

import {hydrate, render} from 'preact'
import {useClientRouter} from 'vite-plugin-ssr/client/router'

import type {PageContext} from './page-context'

const {hydrationPromise} = useClientRouter({
  render(pageContext: PageContext): void {
    const {Page, isHydration} = pageContext
    const page = <Page />
    const mount = isHydration ? hydrate : render

    mount(page, window.document.body)
  },
})

hydrationPromise
  .then(() => {
    console.log('Hydration finished; page is now interactive.')
  })
  .catch((error: Error) => {
    console.error('Hydration failed!', error)
  })
