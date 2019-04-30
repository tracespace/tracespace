import * as State from './state'
import {
  createAppDatabase,
  ensureAppPreferences,
  updateAppPreferences,
  AppDatabase,
} from './db'

export function createSettingsMiddleware(): State.Middleware {
  let database: AppDatabase | undefined

  return store => {
    const {dispatch} = store

    createAppDatabase().then(db => {
      database = db
      dispatch(State.fetchAppPreferences())
    })

    return next => action => {
      if (database) {
        const db: AppDatabase = database

        switch (action.type) {
          case State.FETCH_APP_PREFERENCES: {
            ensureAppPreferences(db).then(prefs =>
              dispatch(State.appPreferences(prefs))
            )
            break
          }

          case State.UPDATE_APP_PREFERENCES: {
            updateAppPreferences(db, action.payload)
              .then(() => ensureAppPreferences(db))
              .then(prefs => dispatch(State.appPreferences(prefs)))
            break
          }
        }
      }

      return next(action)
    }
  }
}
