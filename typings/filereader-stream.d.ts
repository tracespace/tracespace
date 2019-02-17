// Type definitions for filereader-stream 2.0
// Project: https://github.com/maxogden/filereader-stream
// Definitions by: Mike Cousins <https://mike.cousins.io>

/// <reference types="node" />

declare module 'filereader-stream' {
  function fileReaderStream(
    file: Blob,
    options?: fileReaderStream.Options | null
  ): NodeJS.ReadableStream

  namespace fileReaderStream {
    interface Options {
      chunkSize?: number | null
      offset?: number | null
    }
  }

  export = fileReaderStream
}
