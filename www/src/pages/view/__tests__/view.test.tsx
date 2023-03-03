// @vitest-environment jsdom
// Tests for the index page
import {describe, it, beforeEach, afterEach, expect} from 'vitest'
import {render, screen, within, cleanup} from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import * as td from 'testdouble'
import {replaceEsm, reset} from 'testdouble-vitest'

describe('view page', () => {
  let renderer: typeof import('../../../render')
  let subject: typeof import('../index.page')

  beforeEach(async () => {
    renderer = await replaceEsm('../../../render')
    subject = await import('../index.page')
    td.when(renderer.render(td.matchers.anything())).thenResolve({})
  })

  afterEach(() => {
    cleanup()
    reset()
  })

  it('should have a title', () => {
    render(<subject.Page />)

    const result = screen.getByRole('heading', {level: 1})
    expect(result).toHaveTextContent('tracespace view')
  })

  it.skip('should have a file input', async () => {
    const files = [
      new File(['hello'], 'hello.gbr', {type: 'application/vnd.gerber'}),
      new File(['world'], 'world.gbr', {type: 'application/vnd.gerber'}),
    ]

    render(<subject.Page />)

    const input = screen.getByLabelText<HTMLInputElement>(/select your.+files/i)
    await userEvent.upload(input, files)

    const results = within(screen.getByRole('list')).getAllByRole('listitem')

    expect(results).toHaveLength(2)
    expect(results[0]).toHaveTextContent('hello.gbr')
    expect(results[1]).toHaveTextContent('world.gbr')
  })

  it('should toggle dark mode', async () => {
    render(<subject.Page />)

    let result = screen.getByRole('button', {name: /switch to dark/i})
    await userEvent.click(result)

    expect(screen.queryByRole('button', {name: /switch to dark/i})).toBeNull()

    result = screen.getByRole('button', {name: /switch to light/i})
    await userEvent.click(result)

    expect(screen.queryByRole('button', {name: /switch to light/i})).toBeNull()
  })
})
