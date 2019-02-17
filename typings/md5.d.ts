// Type definitions for md5.js 1.3
// Project: https://github.com/crypto-browserify/md5.js
// Definitions by: Mike Cousins <https://mike.cousins.io>

/// <reference types="node" />

declare module 'md5.js' {
  class MD5 {
    constructor()
    update(data: string, encoding?: string): this
    update(data: Buffer, encoding?: 'buffer'): this
    digest(encoding?: string): string
  }

  export = MD5
}
