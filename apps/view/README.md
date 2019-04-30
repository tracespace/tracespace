# tracespace view

> https://tracespace.io/view

Probably the best Gerber viewer on the internet. @tracespace/view uses the [pcb-stackup][] library to render Gerber and NC drill files as SVGs in your browser, without ever sending your files to a server.

Your renders are saved locally, so you can check out your boards without constantly having to re-upload your Gerber files.

[pcb-stackup]: ../packages/pcb-stackup

## architecture

The app is very similar to a typical React + Redux application. A central [state store][store] is available all through-out the app, and much of the UI is derived directly from that state.

The state can be changed by dispatching a [specific action][actions] to the store, which will [fold the action into the state][reducer]. As the action is being processed, it will pass through a series of middleware that can trigger side-effects, like triggering a render.

For more information, see the [state module][state]

[state]: ./src/state
[store]: ./src/state/store.ts
[actions]: ./src/state/actions.ts
[reducer]: './src/state/reducer.ts'

### rendering

The app runs pcb-stackup and various file reading libraries in a separate thread from the main UI via a [Web Worker][web-worker]. The render worker responds to and emits application store actions via the [render middleware][render-middleware]/

For more information, see the [render module][render].

[web-worker]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
[render]: ./src/render
[render]: ./src/render/middleware.ts

### local storage

Source files and their associated renders, as well as application preferences, are stored locally using IndexedDB. The app has two databases:

- `BoardDatabase`
  - Accessed exclusively by the render worker
  - Stores board information, layer information, and source files
- `AppDatabase`
  - Accessed from the main UI thread via the [settings middleware][settings]
  - Stores application preferences and information

[settings]: ./src/settings.ts

### analytics

The tracespace view application collects anonymous usage data if you opt-in to tracking. See the [analytics module][analytics] for more information

[analytics]: ./src/analytics

## debugging

To debug the application state, you can change the app's log level using your browser's JavaScript console:

```js
localStorage.setItem('logLevel', 'debug')
```

Available log levels are:

- `debug` (default in development)
- `info`
- `warn` (default in production)
- `error`

At `logLevel: 'debug'`, all actions and state changes will be logged
