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

  type Direction = 'cw' | 'ccw'
  type Polarity = 'dark' | 'clear'
  type Point = [number, number]
  type Offset = [number, number]
  type Box = [number, number, number, number]
  type ToolId = string

  // ----------------------------------------------------------------------
  // Shape aka Tool

  interface Circle {
    type: 'circle'
    r: number
    cx: number
    cy: number
  }

  interface Rect {
    type: 'rect'
    width: number
    height: number
    r: number
    cx: number
    cy: number
  }

  interface Poly {
    type: 'poly'
    points: Point[]
  }

  interface Ring {
    type: 'ring'
    r: number
    width: number
    cx: number
    cy: number
  }

  interface Clip {
    type: 'clip'
    shape: (Rect | Poly)[]
    clip: Ring
  }

  type Shape = Circle | Rect | Poly | Ring

  // ----------------------------------------------------------------------
  // Segments

  interface Line {
    type: 'line'
    start: Point
    end: Point
  }

  interface Arc {
    type: 'arc'
    start: [number, number, number] // start x,y, angle
    end: [number, number, number] // end x,y, angle
    center: Point
    sweep: number
    radius: number
    dir: Direction
  }

  type Segment = Line | Arc

  // ----------------------------------------------------------------------
  // Chunks

  interface ChunkShape {
    type: 'shape'
    tool: ToolId
    shape: Shape[]
  }

  interface ChunkPad {
    type: 'pad'
    x: number
    y: number
    tool: ToolId
  }

  interface ChunkFill {
    type: 'fill'
    path: Segment[]
  }

  interface ChunkStroke {
    type: 'stroke'
    width: number
    path: Segment[]
  }

  interface ChunkPolarity {
    type: 'polarity'
    polarity: Polarity
  }

  interface ChunkRepeat {
    type: 'repeat'
    offsets: Offset[]
    box: Box
  }

  interface ChunkSize {
    type: 'size'
    box: Box
    units: Units
  }

  type Chunk =
    | ChunkShape
    | ChunkPad
    | ChunkFill
    | ChunkStroke
    | ChunkPolarity
    | ChunkRepeat
    | ChunkSize
}

export = gerberPlotter
