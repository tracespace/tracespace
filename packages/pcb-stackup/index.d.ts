// Type definitions for pcb-stackup 4.0
// Project: https://github.com/tracespace/tracespace
// Definitions by: Mike Cousins <https://mike.cousins.io>

/// <reference types="node" />

import {
  GerberSource,
  ConverterResult,
  CreateElement,
  Options as GerberOptions,
} from 'gerber-to-svg'

import {
  Stackup as CoreStackup,
  Layer as CoreLayer,
  Options as CoreOptions,
} from 'pcb-stackup-core'

import {GerberSide, GerberType} from 'whats-that-gerber'

declare function pcbStackup<NodeType = string, Layer = pcbStackup.InputLayer>(
  layers: Array<Layer>,
  done: pcbStackup.Callback<NodeType, Layer>
): void

declare function pcbStackup<NodeType = string, Layer = pcbStackup.InputLayer>(
  layers: Array<Layer>,
  options: pcbStackup.Options | null,
  done: pcbStackup.Callback<NodeType, Layer>
): void

declare function pcbStackup<NodeType = string, Layer = pcbStackup.InputLayer>(
  layers: Array<Layer>,
  options?: pcbStackup.Options | null
): Promise<pcbStackup.Stackup<NodeType, Layer>>

declare namespace pcbStackup {
  interface InputLayer {
    filename?: string
    gerber?: GerberSource
    options?: GerberOptions | string
    side?: GerberSide
    type?: GerberType
    converter?: ConverterResult
    externalId?: string | null
  }

  type OutputLayer<Layer = InputLayer> = Layer &
    CoreLayer & {
      options: {
        id: string
        plotAsOutline: boolean | number
        createElement: CreateElement
      }
    }

  interface Stackup<NodeType = string, Layer = InputLayer>
    extends CoreStackup<NodeType> {
    layers: Array<OutputLayer<Layer>>
    outlineGapFill: number | null
  }

  type Options<NodeType = string> = Pick<
    CoreOptions,
    Exclude<keyof CoreOptions, 'id'>
  > & {
    id?: string
    outlineGapFill?: number
  }

  interface Callback<NodeType = string, Input = InputLayer> {
    (error: Error, stackup: Stackup<NodeType, Input>): unknown
  }
}

export = pcbStackup
