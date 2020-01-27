import path from 'path'
import untildify from 'untildify'

export function resolve(filename: string): string {
  return path.resolve(process.cwd(), untildify(filename))
}
