import type {IconDefinition} from '@fortawesome/fontawesome-svg-core'

import type {StylableComponentProps} from './types'

export interface IconProps extends StylableComponentProps {
  data: IconDefinition
}

export function Icon(props: IconProps) {
  const {data, ...styleAttributes} = props
  const [width, height, _ligatures, _unicode, pathData] = data.icon
  const viewBox = `0 0 ${width} ${height}`
  const path = typeof pathData === 'string' ? pathData : pathData.join('')

  return (
    <svg
      viewBox={viewBox}
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      fill="currentColor"
      w="1em"
      h="1em"
      {...styleAttributes}
    >
      <path d={path} />
    </svg>
  )
}
