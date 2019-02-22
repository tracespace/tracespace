// Type definitions for pcb-stackup-core 4.0
// Project: https://github.com/tracespace/tracespace
// Definitions by: Mike Cousins <https://mike.cousins.io>

/// <reference types="node" />

import {Converter, ConverterResult, CreateElement} from 'gerber-to-svg'
import {GerberSide, GerberType} from 'whats-that-gerber'

declare function pcbStackupCore<NodeType = string>(
  layers: Array<pcbStackupCore.Layer>,
  options: string | pcbStackupCore.Options<NodeType>
): pcbStackupCore.Stackup<NodeType>

declare namespace pcbStackupCore {
  interface Layer {
    side: GerberSide
    type: GerberType
    converter: Converter
    externalId?: string | null
  }

  interface Options<NodeType = string> {
    id: string
    color?: ColorOptions
    attributes?: object
    useOutline?: boolean
    createElement?: CreateElement<NodeType>
  }

  interface Stackup<NodeType = string> {
    id: string
    color: Color
    attributes: object
    useOutline: boolean
    createElement: CreateElement<NodeType>
    top: StackupSide<NodeType>
    bottom: StackupSide<NodeType>
  }

  interface StackupSide<NodeType = string> extends ConverterResult<NodeType> {
    svg: NodeType
  }

  interface Color {
    fr4: string
    cu: string
    cf: string
    sm: string
    ss: string
    sp: string
    out: string
  }

  type ColorOptions = {[P in keyof Color]?: Color[P] | null}
}

export = pcbStackupCore
