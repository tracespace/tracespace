import {useState, useEffect} from 'preact/hooks'
import {faSun} from '@fortawesome/free-solid-svg-icons/faSun'
import {faMoon} from '@fortawesome/free-solid-svg-icons/faMoon'

import {Icon} from '../components/icon'
import type {StylableComponentProps} from '../components/types'
import {useDarkMode} from './use-dark-mode'

export interface DarkModeToggleProps extends StylableComponentProps {}

export function DarkModeToggle(props: DarkModeToggleProps): JSX.Element {
  const [isDark, toggleIsDark] = useDarkMode()
  const iconData = isDark ? faMoon : faSun
  const labelText = `Switch to ${isDark ? 'light' : 'dark'} mode`

  return (
    <button
      title={labelText}
      aria-label={labelText}
      onClick={toggleIsDark}
      {...props}
    >
      <Icon data={iconData} />
    </button>
  )
}
