import React from 'react'
import ReactDomServer from 'react-dom/server'
import {dom as faDom} from '@fortawesome/fontawesome-svg-core'

import App from './App'

import faviconIco from './images/favicon.ico'
import favicon16 from './images/favicon-16x16.png'
import favicon32 from './images/favicon-32x32.png'
import favicon64 from './images/favicon-64x64.png'

type Props = {
  htmlWebpackPlugin: {
    options: {
      title: string
      description: string
      author: string
    }
  }
}

export default function StaticTemplate(props: Props): string {
  const {options} = props.htmlWebpackPlugin

  return `<!doctype html>${ReactDomServer.renderToStaticMarkup(
    <html lang="en" className="h-100 lh-solid">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content={options.description} />
        <meta name="author" content={options.author} />
        <title>{options.title}</title>
        <link rel="shortcut icon" href={faviconIco} />
        <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />
        <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
        <link rel="icon" type="image/png" sizes="32x32" href={favicon64} />
        <style>{faDom.css()}</style>
      </head>
      <body className="h-100 overflow-hidden">
        <div
          data-hook="root"
          className="h-100"
          dangerouslySetInnerHTML={{
            __html: ReactDomServer.renderToString(<App />),
          }}
        />
      </body>
    </html>
  )}`
}
