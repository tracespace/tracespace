import {useState, useLayoutEffect, useEffect} from 'preact/hooks'

export const DARK_MODE_STORAGE_KEY = 'tracespace:darkModeEnabled'
export const DARK_MODE_CLASSNAME = 'dark'

export type DarkModeResults = [isDark: boolean, toggleIsDark: () => unknown]

export function useDarkMode(): DarkModeResults {
  const [isDark, setIsDark] = useState(false)

  useLayoutEffect(() => {
    if (document.documentElement.classList.contains(DARK_MODE_CLASSNAME)) {
      setIsDark(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, JSON.stringify(isDark))

    if (isDark) {
      document.documentElement.classList.add(DARK_MODE_CLASSNAME)
    } else {
      document.documentElement.classList.remove(DARK_MODE_CLASSNAME)
    }
  }, [isDark])

  const toggleIsDark = () => {
    setIsDark(!isDark)
  }

  return [isDark, toggleIsDark]
}
