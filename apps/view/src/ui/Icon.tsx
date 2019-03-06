import React from 'react'
import cx from 'classnames'
import {Omit} from '../types'

import {
  FontAwesomeIcon as FaIcon,
  Props as FaIconProps,
} from '@fortawesome/react-fontawesome'

import {
  library,
  IconPrefix as FaIconPrefix,
  IconProp as FaIconProp,
} from '@fortawesome/fontawesome-svg-core'

import {
  faCheckSquare,
  faCircle,
  faCopy,
  faDotCircle,
  faEye,
  faEyeSlash,
  faSquare,
  faTrashAlt,
} from '@fortawesome/free-regular-svg-icons'

import {
  faCheck,
  faChevronLeft,
  faChevronRight,
  faCog,
  faExpand,
  faFileDownload,
  faFileUpload,
  faPlus,
  faQuestionCircle,
  faSearchMinus,
  faSearchPlus,
  faSlidersH,
  faSpinner,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'

const PREFIX_BY_ICON = {
  check: 'fas',
  'check-square': 'far',
  'chevron-left': 'fas',
  'chevron-right': 'fas',
  circle: 'far',
  cog: 'fas',
  copy: 'far',
  'dot-circle': 'far',
  expand: 'fas',
  eye: 'far',
  'eye-slash': 'far',
  'file-download': 'fas',
  'file-upload': 'fas',
  plus: 'fas',
  'question-circle': 'fas',
  'search-plus': 'fas',
  'search-minus': 'fas',
  'sliders-h': 'fas',
  spinner: 'fas',
  square: 'far',
  times: 'fas',
  'trash-alt': 'far',
}

export type IconName = keyof typeof PREFIX_BY_ICON

export type IconProps = {
  name: IconName
  className?: string
  style?: React.CSSProperties
  faProps?: Omit<FaIconProps, 'icon' | 'className'>
}

library.add(
  faCheck,
  faCheckSquare,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faCog,
  faCopy,
  faDotCircle,
  faExpand,
  faEye,
  faEyeSlash,
  faFileDownload,
  faFileUpload,
  faPlus,
  faSearchMinus,
  faSearchPlus,
  faSlidersH,
  faSpinner,
  faSquare,
  faTimes,
  faTrashAlt,
  faQuestionCircle
)

export function Icon(props: IconProps): JSX.Element {
  const {name, style, faProps} = props
  const icon: FaIconProp = [PREFIX_BY_ICON[name] as FaIconPrefix, name]
  const className = cx(props.className, 'relative w2 h2 pa2')

  return (
    <div className={className} style={style}>
      <span className="db absolute absolute--center">
        <FaIcon icon={icon} {...faProps} />
      </span>
    </div>
  )
}
