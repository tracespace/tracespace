import commonPrefix from 'common-prefix'
import randomColor from 'randomcolor'

import vb from 'viewbox'
import xid from '@tracespace/xml-id'
import {Options as GerberToSvgOptions} from 'gerber-to-svg'

// @ts-expect-error: cannot figure out how to type this without breaking the import
import clone from 'gerber-to-svg/clone'
// @ts-expect-error: cannot figure out how to type this without breaking the import
import render from 'gerber-to-svg/render'

import {Stackup, InputLayer, Options as StackupOptions} from 'pcb-stackup'

import {
  Optional,
  BoardRender,
  LayerRender,
  LayersMap,
  Board,
  Layer,
  LayerOptions,
  BoardUpdate,
} from '../types'

import {svgToDataUri} from '../image'
import {TYPE_DRILL} from '../layers'
import {readFiles, fetchZipFile, writeFiles, FileStream} from './files'
import {baseName} from './util'

export type InputLayerFromFile = InputLayer & {gerber: FileStream}

export type StackupFromFiles = Stackup<string, InputLayerFromFile>

const DEFAULT_BOARD_NAME = 'untitled board'
const RANDOM_ID_LENGTH = 20

const SCALE_MM_TO_IN = 1 / 25.4
const SCALE_IN_TO_MM = 25.4

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getPcbStackup = () => import('pcb-stackup').then(m => m.default)

export async function filesToStackups(
  files: Array<File>
): Promise<[StackupFromFiles, StackupFromFiles]> {
  return readFiles(files).then(fileStreamsToStackups)
}

export async function urlToStackups(
  url: string
): Promise<[StackupFromFiles, StackupFromFiles]> {
  return fetchZipFile(url).then(fileStreamsToStackups)
}

export async function boardToStackups(
  board: Board
): Promise<[Stackup, Stackup]> {
  const stackupLayers = Object.values(board.layers).map(ly => ({
    filename: ly.filename,
    gerber: ly.source,
    side: ly.side,
    type: ly.type,
    options: layerToGerberToSvgOptions(ly, board),
  }))

  return getPcbStackup().then(pcbStackup => {
    const options = boardToPcbStackupOptions(board)
    const selfContainedStackup = pcbStackup(stackupLayers, options)
    const sharedStackup = selfContainedStackup.then(stackup =>
      pcbStackup(
        stackup.layers.map(ly => ({...ly, externalId: ly.options.id})),
        options
      )
    )

    return Promise.all([selfContainedStackup, sharedStackup])
  })
}

export async function stackupToZipBlob(stackup: Stackup): Promise<Blob> {
  const files = stackup.layers
    .filter(layer => layer.converter.layer.length > 0)
    .reduce(
      (result, layer) =>
        result.concat({
          name: `${layer.filename}.svg`,
          contents: render(layer.converter, layer.options.id),
        }),
      [
        {name: 'top.svg', contents: stackup.top.svg},
        {name: 'bottom.svg', contents: stackup.bottom.svg},
      ]
    )

  return writeFiles(files)
}

export function stackupToBoard(stackup: StackupFromFiles): Board {
  const layers = stackup.layers.reduce<LayersMap>((result, ly) => {
    const {name, digest, contents} = ly.gerber

    if (digest && contents) {
      result[ly.converter.id] = {
        id: ly.converter.id,
        filename: name,
        sourceId: digest,
        source: contents,
        side: ly.side,
        type: ly.type,
        color: randomColor({luminosity: 'dark'}) as string,
        initialOptions: {
          coordinateFormat: ly.converter.parser.format.places,
          zeroSuppression: ly.converter.parser.format.zero,
          units: ly.converter.units,
        },
      }
    }
    return result
  }, {})

  const board = {
    layers,
    layerIds: Object.keys(layers),
    id: stackup.id,
    name: stackupToBoardName(stackup),
    options: stackupToBoardOptions(stackup),
    gerberOptions: {},
    drillOptions: {},
    thumbnail: svgToDataUri(stackup.top.svg),
  }

  return board
}

export function updateBoard(board: Board, update: BoardUpdate): Board {
  const {id, name, options, gerberOptions, drillOptions, layers} = update

  const nextBoard = {
    ...board,
    id: id || board.id,
    name: name || board.name,
    options: options || board.options,
    gerberOptions: gerberOptions || board.gerberOptions,
    drillOptions: drillOptions || board.drillOptions,
  }

  if (layers) {
    nextBoard.layers = Object.keys(board.layers).reduce(
      (result, id) => ({...result, [id]: {...board.layers[id], ...layers[id]}}),
      {}
    )
  }

  return nextBoard
}

export function updateBoardThumbnail(board: Board, stackup: Stackup): Board {
  return {
    ...board,
    thumbnail: svgToDataUri(stackup.top.svg),
  }
}

export function stackupToBoardRender(
  stackup: Stackup,
  board: Board
): BoardRender {
  return {
    id: board.id,
    name: board.name,
    options: board.options,
    gerberOptions: board.gerberOptions,
    drillOptions: board.drillOptions,
    viewBox: vb.add(stackup.top.viewBox, stackup.bottom.viewBox),
    top: stackup.top.svg,
    bottom: stackup.bottom.svg,
    layers: stackupToLayerRenders(stackup, board),
    sourceIds: board.layerIds.map(id => board.layers[id].sourceId),
    sourceUrl: board.sourceUrl || null,
  }
}

async function fileStreamsToStackups(
  fileStreams: Array<FileStream>
): Promise<[StackupFromFiles, StackupFromFiles]> {
  const id = xid.random(RANDOM_ID_LENGTH)
  const layers = fileStreams.map(fileStreamToInputLayer)
  const options = {id, attributes: {class: 'w-100 h-100'}}

  return getPcbStackup().then(pcbStackup => {
    const selfContainedStackup = pcbStackup(layers, options)
    const sharedStackup = selfContainedStackup.then(stackup =>
      pcbStackup(
        stackup.layers.map(ly => ({...ly, externalId: ly.options.id})),
        options
      )
    )

    return Promise.all([selfContainedStackup, sharedStackup])
  })
}

function fileStreamToInputLayer(gerber: FileStream): InputLayerFromFile {
  const id = xid.random(RANDOM_ID_LENGTH)

  return {gerber, filename: gerber.name, options: {id}}
}

function stackupToBoardName(stackup: Stackup): string {
  const boardName =
    commonPrefix(
      stackup.layers
        .filter(ly => ly.converter.layer.length > 0)
        .map(ly => baseName(ly.filename || '', true))
    ) || DEFAULT_BOARD_NAME

  // strip trailing dot if present
  return boardName.endsWith('.') ? boardName.slice(0, -1) : boardName
}

function stackupToBoardOptions(stackup: Stackup): Board['options'] {
  return {
    useOutline: stackup.useOutline,
    outlineGapFill: stackup.outlineGapFill || 0.00011,
    color: stackup.color,
  }
}

function boardToPcbStackupOptions(board: Board): StackupOptions {
  return {
    id: board.id,
    attributes: {class: 'w-100 h-100'},
    outlineGapFill: board.options.outlineGapFill,
    useOutline: board.options.useOutline,
    color: board.options.color,
  }
}

function stackupToLayerRenders(
  stackup: Stackup,
  board: Board
): Array<LayerRender> {
  const stackupUnits = stackupToUnits(stackup)

  return stackup.layers.reduce<Array<LayerRender>>((result, stackupLayer) => {
    const id = stackupLayer.options.id
    const units = stackupLayer.converter.units
    const layer: Layer | undefined = board.layers[id]
    let scale = 1

    if (units === 'mm' && stackupUnits === 'in') {
      scale = SCALE_MM_TO_IN
    } else if (units === 'in' && stackupUnits === 'mm') {
      scale = SCALE_IN_TO_MM
    }

    if (layer) {
      result.push({
        id: layer.id,
        side: layer.side,
        type: layer.type,
        color: layer.color,
        filename: layer.filename,
        converter: clone(stackupLayer.converter),
        initialOptions: layer.initialOptions,
        scale,
      })
    }

    return result
  }, [])
}

function stackupToUnits(stackup: Stackup): 'mm' | 'in' {
  const count = stackup.layers.reduce(
    (result, ly) => {
      if (ly.converter.units === 'mm') return {...result, mm: result.mm + 1}
      if (ly.converter.units === 'in') return {...result, in: result.in + 1}
      return result
    },
    {mm: 0, in: 0}
  )

  return count.in > count.mm ? 'in' : 'mm'
}

function layerToGerberToSvgOptions(
  layer: Layer,
  board: Board
): GerberToSvgOptions {
  let boardLevelOptions: Optional<LayerOptions> = {}

  if (layer.type === TYPE_DRILL) {
    boardLevelOptions = board.drillOptions
  } else if (layer.type) {
    boardLevelOptions = board.gerberOptions
  }

  return {
    id: layer.id,
    places: boardLevelOptions.coordinateFormat,
    zero: boardLevelOptions.zeroSuppression,
    units: boardLevelOptions.units,
  }
}
