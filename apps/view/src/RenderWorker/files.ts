import {Transform, TransformCallback} from 'readable-stream'
import fileReaderStream from 'filereader-stream'
import MD5 from 'md5.js'
import pump from 'pump'
import {baseName, promiseFlatMap, PromiseArray} from './util'

const READER_OPTIONS = {chunkSize: 2048}
const MIMETYPE_ZIP = 'application/zip'

export type FileToWrite = {name: string; contents: string}

export async function readFiles(files: Array<File>): PromiseArray<FileStream> {
  return promiseFlatMap(files, (file: File) =>
    file.type === MIMETYPE_ZIP ? zipReader(file) : [fileReader(file)]
  )
}

export async function fetchZipFile(url: string): PromiseArray<FileStream> {
  return fetch(url)
    .then(response => {
      if (response.ok) return response.blob()
      throw new Error(`Could not fetch ${url}: ${response.status}`)
    })
    .then(blob => {
      if (blob.type === MIMETYPE_ZIP) return zipReader(blob)
      throw new Error(`${url} is not a zip file`)
    })
}

export async function writeFiles(files: Array<FileToWrite>): Promise<Blob> {
  return import('jszip').then(ZipModule => {
    const zip = ZipModule.default()
    files.forEach(f => zip.file(f.name, f.contents))
    return zip.generateAsync({type: 'blob'})
  })
}

export class FileStream extends Transform {
  _hasher: MD5
  _chunks: Array<Buffer>
  name: string
  digest: string | null
  contents: Buffer | null

  constructor(filename: string) {
    super()
    this._hasher = new MD5()
    this._chunks = []
    this.name = baseName(filename)
    this.digest = null
    this.contents = null
  }

  _transform(chunk: Buffer, _: string, next: TransformCallback): void {
    this._hasher.update(chunk)
    this._chunks.push(chunk)
    next(undefined, chunk)
  }

  _flush(next: TransformCallback): void {
    this.digest = this._hasher.digest('hex')
    this.contents = Buffer.concat(this._chunks)
    next()
  }
}

function fileReader(file: File): FileStream {
  const reader = fileReaderStream(file, READER_OPTIONS)
  const collector = new FileStream(file.name)

  return pump<FileStream>(reader, collector)
}

async function zipReader(file: Blob): PromiseArray<FileStream> {
  return import('jszip')
    .then(ZipModule => ZipModule.loadAsync(file))
    .then(zip =>
      Object.keys(zip.files)
        .filter(name => !zip.files[name].dir)
        .map(name =>
          pump<FileStream>(zip.file(name).nodeStream(), new FileStream(name))
        )
    )
}
