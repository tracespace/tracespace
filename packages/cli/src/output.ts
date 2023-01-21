import fs from 'node:fs/promises'
import path from 'node:path'

import {stringifySvg} from '@tracespace/core'
import type {SvgElement} from '@tracespace/renderer'

export interface WriteRequest<ContentsType = unknown> {
  basename: string
  directory: string | undefined
  contents: ContentsType
  disable?: boolean
}

export async function writeJson(request: WriteRequest): Promise<void> {
  if (request.disable === true) {
    return
  }

  await writeText({
    ...request,
    basename: `${request.basename}.json`,
    contents: JSON.stringify(request.contents, undefined, 2),
  })
}

export async function writeSvg(
  request: WriteRequest<SvgElement>
): Promise<void> {
  if (request.disable === true) {
    return
  }

  await writeText({
    ...request,
    basename: `${request.basename}.svg`,
    contents: stringifySvg(request.contents),
  })
}

export async function writeText(request: WriteRequest<string>): Promise<void> {
  if (request.disable === true) {
    return
  }

  const {basename, contents, directory = ''} = request
  const filename = path.join(directory, basename)

  if (directory !== '') await fs.mkdir(directory, {recursive: true})
  await fs.writeFile(filename, contents, 'utf8')
}
