// @vitest-environment jsdom
import {describe, it, afterEach, expect} from 'vitest'
import {renderHook, act, cleanup} from '@testing-library/preact'

import {useDarkMode as subject} from '..'

describe('useDarkMode', () => {
  afterEach(async () => {
    document.querySelector('html')?.classList.remove('dark')
    cleanup()
  })

  it('should initialize to false by default', () => {
    const {result} = renderHook(() => subject())
    expect(result.current?.[0]).toEqual(false)
  })

  it('should initialize to true if dark class present', () => {
    document.querySelector('html')?.classList.add('dark')

    const {result} = renderHook(() => subject())

    expect(result.current?.[0]).toEqual(true)
  })

  it('should toggle dark mode', async () => {
    const {result} = renderHook(() => subject())

    expect(result.current?.[0]).toEqual(false)

    await act(() => {
      result.current?.[1]()
    })

    expect(result.current?.[0]).toEqual(true)

    await act(() => {
      result.current?.[1]()
    })

    expect(result.current?.[0]).toEqual(false)
  })

  it('should add html class and persist to localstorage', async () => {
    const {result} = renderHook(() => subject())

    await act(() => {
      result.current?.[1]()
    })

    expect(document.querySelector('html')).toHaveClass('dark')
    expect(localStorage.getItem('tracespace:darkModeEnabled')).toEqual('true')

    await act(() => {
      result.current?.[1]()
    })

    expect(document.querySelector('html')).not.toHaveClass('dark')
    expect(localStorage.getItem('tracespace:darkModeEnabled')).toEqual('false')
  })
})
