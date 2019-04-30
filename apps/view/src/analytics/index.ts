// analytics module via mixpanel
import mixpanel from 'mixpanel-browser'

import log from '../logger'
import * as State from '../state'
import createEvent from './create-event'

const MIXPANEL_ID = process.env.MIXPANEL_ID
let userId: string | null = null

export function getAnalyticsUserId(): string | null {
  return userId
}

export function createAnalyticsMiddleware(): State.Middleware {
  if (MIXPANEL_ID) {
    log.debug('initializing mixpanel')
    mixpanel.init(MIXPANEL_ID, {
      opt_out_tracking_by_default: true,
      loaded: (mp): void => {
        userId = mp.get_distinct_id()
      },
    })
  } else {
    log.debug('no mixpanel token found; not initializing')
  }

  return store => next => action => {
    const prevState = store.getState()
    const result = next(action)
    const nextState = store.getState()

    if (userId) {
      const nextOptIn = nextState.appPreferences.analyticsOptIn
      const event = createEvent(action, nextState, prevState)

      // ensure opt-in preferences are communicated to mixpanel
      if (nextOptIn && mixpanel.has_opted_out_tracking()) {
        mixpanel.opt_in_tracking()
      } else if (!nextOptIn && !mixpanel.has_opted_out_tracking) {
        mixpanel.opt_out_tracking()
      }

      // only track anything if opted in
      if (nextOptIn && event) {
        const [name, payload] = event

        log.debug('track', event)
        mixpanel.track(name, payload)
      } else if (event) {
        log.debug('did not track', event)
      }
    }

    return result
  }
}
