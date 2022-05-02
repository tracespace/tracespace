import {describe, it, expect} from 'vitest'
import {sanitize} from '..'

describe('xml-id', () => {
  describe('sanitize', () => {
    const SPECS = [
      // Should leave these alone
      {given: '_123', expected: '_123'},
      {given: 'aBcDeFg', expected: 'aBcDeFg'},
      // Should sanitize start char
      {given: '0123', expected: '_123'},
      {given: '-123', expected: '_123'},
      {given: '.123', expected: '_123'},
      {given: ':123', expected: '_123'},
      // Replace invalid characters with an underscore
      {given: 'A B C', expected: 'A_B_C'},
      {given: 'A~B~C', expected: 'A_B_C'},
      {given: '.1*2&3', expected: '_1_2_3'},
      {given: 'abc.def', expected: 'abc_def'},
    ]

    for (const {given, expected} of SPECS) {
      it(`given ${given} expect ${expected}`, () => {
        expect(sanitize(given)).to.equal(expected)
      })
    }
  })
})
