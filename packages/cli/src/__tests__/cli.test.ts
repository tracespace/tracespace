import {describe, it, expect} from 'vitest'

import {run} from './run'

describe('@tracespace/cli', () => {
  it('should display the version', async () => {
    const {stdout, exitCode} = await run('--version')

    expect(exitCode).to.equal(0)
    expect(stdout).to.equal('0.0.0-test')
  })

  it('should display help info', async () => {
    const {stdout, exitCode} = await run('--help')

    expect(exitCode).to.equal(0)
    expect(stdout).to.include('Usage: tracespace')
  })
})
