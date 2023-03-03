import {render as renderToString} from 'preact-render-to-string'
import {escapeInject as html, dangerouslySkipEscape} from 'vite-plugin-ssr'

import {DARK_MODE_STORAGE_KEY, DARK_MODE_CLASSNAME} from '../dark-mode'
import type {PageContext} from './_page-context'

export function render(pageContext: PageContext): unknown {
  const {Page} = pageContext
  const pageHtml = renderToString(<Page />)

  const documentHtml = html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>tracespace</title>
        <script>
          var darkModeEnabled = JSON.parse(
            localStorage.getItem('${DARK_MODE_STORAGE_KEY}')
          )

          if (darkModeEnabled === null) {
            darkModeEnabled = window.matchMedia(
              '(prefers-color-scheme: dark)'
            ).matches
          }

          if (darkModeEnabled) {
            document.documentElement.classList.add('${DARK_MODE_CLASSNAME}')
          }
        </script>
      </head>
      <body
        text="dark-800 dark:white"
        bg="white dark:dark-800"
        transition="colors"
      >
        ${dangerouslySkipEscape(pageHtml)}
      </body>
    </html>
  `

  return {documentHtml}
}
