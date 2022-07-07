import {options} from './options'

export const examples = [
  {
    cmd: '$0',
    desc: 'Render files in `cwd` and output to `cwd`',
  },
  {
    cmd: '$0 --out=-',
    desc: 'Render files in `cwd` and output to `stdout`',
  },
  ...Object.values(options).map(opt => opt.example),
]
