import {expect} from 'chai'
import {Action, State, INITIAL_STATE} from '../../state'
import {AnalyticsEvent} from '../types'
import createEvent from '../create-event'

type Spec = {
  name: string
  action: Action
  nextState?: State
  prevState?: State
  expected: AnalyticsEvent | null
}

const MockFile = (name: string, type: string = ''): File => {
  const file = {name, type, size: 0, lastModified: 0, slice: () => file}
  return (file as unknown) as File
}

describe('create analytics event', () => {
  const SPECS: Array<Spec> = [
    {
      name: 'CREATE_BOARD with files from file picker',
      action: {
        type: 'CREATE_BOARD',
        payload: [MockFile('foo.gbr'), MockFile('bar.gbr')],
        metadata: {dragAndDrop: false},
      },
      expected: [
        'createBoardRequest',
        {source: 'filePicker', uploadType: 'files'},
      ],
    },
    {
      name: 'CREATE_BOARD with files from drag and drop',
      action: {
        type: 'CREATE_BOARD',
        payload: [MockFile('foo.gbr'), MockFile('bar.gbr')],
        metadata: {dragAndDrop: true},
      },
      expected: [
        'createBoardRequest',
        {source: 'dragAndDrop', uploadType: 'files'},
      ],
    },
    {
      name: 'CREATE_BOARD with zip',
      action: {
        type: 'CREATE_BOARD',
        payload: [MockFile('foo.zip', 'application/zip')],
        metadata: {dragAndDrop: false},
      },
      expected: [
        'createBoardRequest',
        {source: 'filePicker', uploadType: 'zip'},
      ],
    },
    {
      name: 'CREATE_BOARD with mixed',
      action: {
        type: 'CREATE_BOARD',
        payload: [MockFile('foo.zip', 'application/zip'), MockFile('bar.gbr')],
        metadata: {dragAndDrop: true},
      },
      expected: [
        'createBoardRequest',
        {source: 'dragAndDrop', uploadType: 'mixed'},
      ],
    },
    {
      name: 'CREATE_BOARD_FROM_URL',
      action: {type: 'CREATE_BOARD_FROM_URL', payload: 'foo'},
      expected: ['createBoardRequest', {source: 'url'}],
    },
    {
      name: 'GET_BOARD',
      action: {type: 'GET_BOARD', payload: 'foo'},
      expected: ['getBoardRequest', {}],
    },
  ]

  SPECS.forEach(spec =>
    it(spec.name, () => {
      const nextState = spec.nextState || INITIAL_STATE
      const prevState = spec.prevState || INITIAL_STATE
      const event = createEvent(spec.action, nextState, prevState)
      expect(event).to.eql(spec.expected)
    })
  )
})
