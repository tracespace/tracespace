import {render as renderToString} from 'preact-render-to-string'
import {escapeInject as html, dangerouslySkipEscape} from 'vite-plugin-ssr'

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
      </head>
      <body>
        ${dangerouslySkipEscape(pageHtml)}
      </body>
    </html>
  `

  return {documentHtml}
}
