# tracespace view analytics module

> Analytics tracking source code for @tracespace/view

This directory contains the logic for sending anonymous usage events to [Mixpanel][mixpanel]

[mixpanel]: https://mixpanel.com/

## events

The application state architecture of @tracespace/view is highly similar to [redux][], where there is a predefined set of actions that may be applied to a central store to transform the application state.

To drive analytics, we watch actions as they are dispatched to the store and send analytics events according the action type. See the [createEvent function][create-event] for the action to analytics mapping logic.

[create-event]: ./create-event.ts
