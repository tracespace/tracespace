import {run as runSubject, Result} from '..'

export interface TestResult extends Result {
  stdout: string
  stderr: string
}

export async function run(...args: string[]): Promise<TestResult> {
  let stdout = ''
  let stderr = ''

  const logger = {
    info(message: string) {
      stdout += message
    },
    warn(message: string) {
      stderr += message
    },
    error(message: string) {
      stderr += message
    },
  }

  return runSubject(['', '', ...args], {logger}).then(({exitCode}) => ({
    exitCode,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  }))
}
