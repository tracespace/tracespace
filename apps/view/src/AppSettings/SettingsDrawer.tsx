import React from 'react'

import {VERSION} from '../pkg'
import {getAnalyticsUserId} from '../analytics'
import {select} from '../events'
import {useAppState, deleteAllBoards, updateAppPreferences} from '../state'
import {DeleteButton, Drawer, Checkbox, Label} from '../ui'

const TITLE = 'app settings'
const FOOTER = `tracespace v${VERSION}`

const DELETE_SAVED_COPY = 'delete all saved boards'
const USAGE_TRACKING_COPY = 'send usage data to tracespace'
const USER_ID_COPY = 'analytics user id'

const SETTINGS_ITEM_STYLE = 'mv2'
const LABEL_COPY_STYLE = 'mr-auto'
const USER_ID_LABEL_STYLE = 'flex-none mr2'
const USER_ID_INPUT_STYLE = 'w-100 bn bg-transparent'
const DELETE_BUTTON_STYLE = 'nr2'
const FOOTER_STYLE = 'mt3 mb1 f7 lh-copy'

type Props = {
  open: boolean
  close: () => void
}

export default function SettingsDrawer(props: Props): JSX.Element {
  const {appPreferences, dispatch} = useAppState()
  const {open, close} = props

  const handleTrackingChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    dispatch(updateAppPreferences({analyticsOptIn: event.target.checked}))
  }

  const handleDeleteAllClick = (): void => {
    dispatch(deleteAllBoards())
    close()
  }

  return (
    <Drawer title={TITLE} open={open} close={close}>
      <Checkbox
        checked={appPreferences.analyticsOptIn || false}
        className={SETTINGS_ITEM_STYLE}
        onChange={handleTrackingChange}
      >
        {USAGE_TRACKING_COPY}
      </Checkbox>

      <Label className={SETTINGS_ITEM_STYLE}>
        <span className={LABEL_COPY_STYLE}>{DELETE_SAVED_COPY}</span>
        <DeleteButton
          className={DELETE_BUTTON_STYLE}
          onClick={handleDeleteAllClick}
        />
      </Label>
      <footer className={FOOTER_STYLE}>
        <Label>
          <span className={USER_ID_LABEL_STYLE}>{USER_ID_COPY}:</span>
          <input
            className={USER_ID_INPUT_STYLE}
            type="text"
            value={getAnalyticsUserId() || 'N/A'}
            onFocus={select}
            readOnly
          />
        </Label>
        {FOOTER}
      </footer>
    </Drawer>
  )
}
