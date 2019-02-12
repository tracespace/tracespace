// Type definitions for gerber-plotter 4.0
// Project: https://github.com/tracespace/tracespace
// Definitions by: Mike Cousins <https://mike.cousins.io>

/// <reference types="node" />

declare function gerberPlotter(
  options: gerberPlotter.Options
): gerberPlotter.Plotter

declare namespace gerberPlotter {
  interface Plotter extends NodeJS.ReadWriteStream {
    format: {
      units: Units
      backupUnits: Units
      nota: Notation
      backupNota: Notation
    }
  }

  interface Options {
    units?: Units | null
    backupUnits?: Units | null
    nota?: Notation | null
    backupNota?: Notation | null
    optimizePaths?: boolean | null
    plotAsOutline?: boolean | number | null
  }

  type Units = 'mm' | 'in'

  type Notation = 'A' | 'I'
}

export = gerberPlotter
