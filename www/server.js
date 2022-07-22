import process from 'node:process'
import path from 'node:path'
import url from 'node:url'

import express from 'express'
import yargsParser from 'yargs-parser'
import {renderPage} from 'vite-plugin-ssr'
import {createServer as createViteServer} from 'vite'

const root = path.dirname(url.fileURLToPath(import.meta.url))
const argv = yargsParser(process.argv.slice(2), {
  number: ['port'],
  string: ['host'],
  default: {host: 'localhost', port: 3000},
})
const isPreviewServer = argv._[0] === 'preview'

createServer()
  .then(server => server.listen(argv.port, argv.host))
  .then(() => {
    console.log(`Server running at http://${argv.host}:${argv.port}`)
  })
  .catch(error => {
    console.error('Server failed to start!', error)
  })

function createServer() {
  const app = express()

  if (isPreviewServer) {
    return Promise.resolve(configurePreviewServer(app))
  }

  return createViteServer({server: {middlewareMode: true}}).then(
    viteDevServer => configureDevServer(app, viteDevServer)
  )
}

function configurePreviewServer(app) {
  app.use(express.static(`${root}/dist/client`))
  return app
}

function configureDevServer(app, viteDevServer) {
  app.use(viteDevServer.middlewares)

  app.get('*', async (request, response, next) => {
    const {httpResponse} = await renderPage({url: request.originalUrl})
    if (!httpResponse) return next()

    const {body, statusCode, contentType} = httpResponse
    response.status(statusCode).type(contentType).send(body)
  })

  return app
}
