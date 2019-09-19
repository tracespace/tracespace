// tree reducer common test
import {expect} from 'chai'
import u from 'unist-builder'
import {Parent} from 'unist'

import * as Grammar from '../../grammar'
import * as Nodes from '../nodes'
import {reducer} from '../reducer'

type ReducerSpec = {
  props?: Omit<Nodes.Root, 'type' | 'children'>
  header?: Parent
  image?: Parent
  match: Grammar.GrammarMatch<Grammar.GrammarRuleType>
  expected: Parent
}

const EMPTY_HEADER = u(Nodes.HEADER, [])
const EMPTY_IMAGE = u(Nodes.IMAGE, [])
const EMPTY_ROOT_CHILDREN = [EMPTY_HEADER, EMPTY_IMAGE]

const SPECS: {[name: string]: ReducerSpec} = {
  'drill filetype': {
    match: {type: Grammar.DRILL_COMMENT, tokens: [], filetype: 'drill'},
    expected: u(
      Nodes.ROOT,
      {filetype: 'drill', done: false},
      EMPTY_ROOT_CHILDREN
    ),
  },
  'gerber filetype': {
    match: {type: Grammar.GERBER_COMMENT, tokens: [], filetype: 'gerber'},
    expected: u(
      Nodes.ROOT,
      {filetype: 'gerber', done: false},
      EMPTY_ROOT_CHILDREN
    ),
  },
  'drill done': {
    match: {type: Grammar.DRILL_DONE, tokens: [], filetype: 'drill'},
    expected: u(
      Nodes.ROOT,
      {filetype: 'drill', done: true},
      EMPTY_ROOT_CHILDREN
    ),
  },
  'gerber done': {
    match: {type: Grammar.GERBER_DONE, tokens: [], filetype: 'gerber'},
    expected: u(
      Nodes.ROOT,
      {filetype: 'gerber', done: true},
      EMPTY_ROOT_CHILDREN
    ),
  },
}

describe('tree reducer for drill file headers', () => {
  Object.keys(SPECS).forEach(name => {
    const {
      props = {filetype: null, done: false},
      header = EMPTY_HEADER,
      image = EMPTY_IMAGE,
      match,
      expected,
    } = SPECS[name]

    it(name, () => {
      const tree = u(Nodes.ROOT, props, [header, image])
      expect(reducer(tree as Nodes.Root, match)).to.eql(expected)
    })
  })
})
