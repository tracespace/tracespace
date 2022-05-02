import path from 'node:path'
import process from 'node:process'

import untildify from 'untildify'

export function resolve(filename: string): string {
  return path.resolve(process.cwd(), untildify(filename))
}
