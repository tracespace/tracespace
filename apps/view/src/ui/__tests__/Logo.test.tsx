// @tracespace/components tests

import {expect} from 'chai'
import React from 'react'
import {shallow} from 'enzyme'
import snapshot from 'snap-shot-it'

import * as components from '..'

describe('Logo', () => {
  const {Logo} = components

  it('should provide default width and height', () => {
    const wrapper = shallow(<Logo />)

    expect(wrapper.is('svg')).to.equal(true)
    expect(wrapper.prop('width')).to.equal('32px')
    expect(wrapper.prop('height')).to.equal('32px')
  })

  it('should take specified width and height', () => {
    const wrapper = shallow(<Logo width="32" height={64} />)

    expect(wrapper.is('svg')).to.equal(true)
    expect(wrapper.prop('width')).to.equal('32')
    expect(wrapper.prop('height')).to.equal('64')
  })

  it('should preserve aspect ratio', () => {
    expect(shallow(<Logo width="32" />).prop('height')).to.equal('32')
    expect(shallow(<Logo height="32" />).prop('width')).to.equal('32')
  })

  it('should render', () => {
    snapshot(shallow(<Logo />).html())
    snapshot(shallow(<Logo width="32" />).html())
    snapshot(shallow(<Logo height="32" />).html())
    snapshot(shallow(<Logo width="100%" height="50%" />).html())
  })
})
