import React from 'react'

import {Button, DeleteButton, Icon} from '../ui'

const CANCEL_TOOLTIP = 'Cancel'
const SAVE_TOOLTIP = 'Save changes'

const STYLE = 'absolute top-1 right-1 nt2 nr2 f4'
const BUTTON_STYLE = 'dib pa1'
const DELETE_BUTTON_STYLE = `${BUTTON_STYLE} absolute top-1 left-1 nt2 nl2 f4`

type Props = {
  delete: () => void
}

export default function SettingsButtons(props: Props): JSX.Element {
  return (
    <>
      <div className={STYLE}>
        <Button type="reset" className={BUTTON_STYLE} title={CANCEL_TOOLTIP}>
          <Icon name="times" />
        </Button>
        <Button type="submit" className={BUTTON_STYLE} title={SAVE_TOOLTIP}>
          <Icon name="check" className="green" />
        </Button>
      </div>
      <DeleteButton onClick={props.delete} className={DELETE_BUTTON_STYLE} />
    </>
  )
}
