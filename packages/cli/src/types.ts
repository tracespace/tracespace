import {Options as GerberOptions} from 'gerber-to-svg'
import {Options as PcbStackupOptions} from 'pcb-stackup'
import {Options as YargsOptions} from 'yargs'

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
  layer?: {
    [filename: string]: GerberOptions
  }
  _configFile?: string
}

export interface ArgOptions extends YargsOptions {
  example: {cmd: string; desc: string; aside?: string}
}
