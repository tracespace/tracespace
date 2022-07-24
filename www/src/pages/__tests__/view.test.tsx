// @vitest-environment jsdom
// Tests for the index page
import {describe, it, afterEach, expect} from 'vitest'
import {render, screen, cleanup} from '@testing-library/preact'
import userEvent from '@testing-library/user-event'

import {Page as Subject} from '../view.page'

describe('view page', () => {
  afterEach(() => {
    cleanup()
  })

  it('should have a title', () => {
    render(<Subject />)

    const result = screen.getByRole('heading', {level: 1})
    expect(result).toHaveTextContent('tracespace view')
  })

  it('should have a file input', async () => {
    const files = [
      new File(['hello'], 'hello.gbr', {type: 'application/vnd.gerber'}),
      new File(['world'], 'world.gbr', {type: 'application/vnd.gerber'}),
    ]

    render(<Subject />)

    const result =
      screen.getByLabelText<HTMLInputElement>(/select your.+files/i)

    await userEvent.upload(result, files)

    expect(result.files).toHaveLength(2)
    expect(result.files![0]).toBe(files[0])
    expect(result.files![1]).toBe(files[1])
    expect(result).toHaveAttribute('sr', 'only')
  })

  it('should toggle dark mode', async () => {
    render(<Subject />)

    let result = screen.getByRole('button', {name: /switch to dark/i})
    await userEvent.click(result)

    expect(screen.queryByRole('button', {name: /switch to dark/i})).toBeNull()

    result = screen.getByRole('button', {name: /switch to light/i})
    await userEvent.click(result)

    expect(screen.queryByRole('button', {name: /switch to light/i})).toBeNull()
  })
})
