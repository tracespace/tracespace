// @tracespace/view entry point
import React from 'react'
import './styles'

Promise.all([
  import('react-dom'),
  import('./App'),
  import('./analytics'),
  import('./logger'),
  import('./render'),
  import('./settings'),
  import('./state'),
]).then(imports => {
  const [
    {default: ReactDom},
    {default: App},
    {createAnalyticsMiddleware},
    {createLogMiddleware},
    {createRenderMiddleware},
    {createSettingsMiddleware},
    {StateProvider},
  ] = imports

  ReactDom.hydrate(
    <StateProvider
      middleware={[
        createAnalyticsMiddleware(),
        createRenderMiddleware(),
        createSettingsMiddleware(),
        createLogMiddleware(),
      ]}
    >
      <App />
    </StateProvider>,
    document.querySelector('[data-hook=root]')
  )
})
