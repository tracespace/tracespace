// Type definitions for @tracespace/xml-id 4.0
// Project: https://github.com/tracespace/tracespace
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare namespace xmlId {
  function random(length?: number): string
  function sanitize(input: string): string
  function ensure(maybeId: unknown, length?: number): string
}

export = xmlId
