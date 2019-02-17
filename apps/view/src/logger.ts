import {useState, useEffect, useMemo} from 'react'

import {LogLevel, Logger, LogHandler} from './types'

const STORAGE_KEY = 'logLevel'
const DEFAULT_LEVEL = process.env.NODE_ENV !== 'production' ? 'debug' : 'warn'
const LEVELS: Array<LogLevel> = ['debug', 'info', 'warn', 'error']

const createLogHandler = (logLvl: LogLevel, lvl: LogLevel): LogHandler =>
  LEVELS.indexOf(lvl) >= LEVELS.indexOf(logLvl)
    ? (msg, ...meta) => console[lvl](`${lvl}: ${msg}`, ...meta)
    : () => {}

export function useLogger(): Logger {
  const [level, setLevel] = useState<LogLevel>(DEFAULT_LEVEL)

  useEffect(() => {
    setLevel(readLogLevel())
  }, [])

  return useMemo(
    () => ({
      debug: createLogHandler(level, 'debug'),
      info: createLogHandler(level, 'info'),
      warn: createLogHandler(level, 'warn'),
      error: createLogHandler(level, 'error'),
    }),
    [level]
  )
}

function readLogLevel(): LogLevel {
  try {
    return mapToLogLevel(window.localStorage.getItem(STORAGE_KEY))
  } catch (error) {
    console.error('Could not read logLevel from localStorage', error)
    return DEFAULT_LEVEL
  }
}

function mapToLogLevel(maybeLevel: string | null): LogLevel {
  if (
    maybeLevel === 'debug' ||
    maybeLevel === 'info' ||
    maybeLevel === 'warn' ||
    maybeLevel === 'error'
  ) {
    return maybeLevel
  }

  return DEFAULT_LEVEL
}
