// Type definitions for gerber-parser 4.0
// Project: https://github.com/tracespace/tracespace
// Definitions by: Mike Cousins <https://mike.cousins.io>

/// <reference types="node" />

declare function gerberParser(
  options: gerberParser.Options
): gerberParser.Parser

declare namespace gerberParser {
  interface Parser extends NodeJS.ReadWriteStream {
    line: number
    format: {
      places: CoordinateFormat
      zero: ZeroSuppression
      filetype: FileType
    }
  }

  interface Options {
    places?: CoordinateFormat | null
    zero?: ZeroSuppression | null
    filetype?: FileType | null
  }

  type CoordinateFormat = [number, number]

  type ZeroSuppression = 'L' | 'T'

  type FileType = 'gerber' | 'drill'
}

export = gerberParser
