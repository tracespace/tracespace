import type {Options as GerberOptions} from 'gerber-to-svg'
import type {Options as PcbStackupOptions} from 'pcb-stackup'
import type {Options as YargsOptions} from 'yargs'

export interface Config {
  files: string[]
  out: string
  noBoard?: boolean
  noLayer?: boolean
  force?: boolean
  quiet?: boolean
  gerber?: GerberOptions
  drill?: GerberOptions
  board?: PcbStackupOptions
  layer?: Record<string, GerberOptions>
  _configFile?: string
}

export interface ArgOptions extends YargsOptions {
  example: {cmd: string; desc: string; aside?: string}
}
