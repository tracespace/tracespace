// Type definitions for pump 3.0
// Project: https://github.com/mafintosh/pump
// Definitions by: Mike Cousins <https://mike.cousins.io>

/// <reference types="node" />

declare module 'pump' {
  function pump<T extends NodeJS.ReadableStream>(
    ...args: Array<T | NodeJS.ReadableStream | pump.Callback>
  ): T

  namespace pump {
    type Callback = (error?: Error | null) => unknown
  }

  export = pump
}
