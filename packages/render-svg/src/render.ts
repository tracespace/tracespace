import s, {Properties} from 'hastscript/svg'
import {CIRCLE, RECTANGLE, OBROUND} from '@tracespace/parser'
import {ImageShape} from '@tracespace/builder'

export function renderShape(node: ImageShape) {
  const {x, y, shape} = node

  if (shape.type === CIRCLE) {
    return s('circle', {cx: x, cy: y, r: shape.diameter / 2})
  }

  if (shape.type === RECTANGLE || shape.type === OBROUND) {
    const props: Properties = {
      x: x - shape.xSize / 2,
      y: y - shape.ySize / 2,
      width: shape.xSize,
      height: shape.ySize,
    }

    if (shape.type === OBROUND) {
      const radius = Math.min(shape.xSize, shape.ySize) / 2
      props.rx = radius
      props.ry = radius
    }

    return s('rect', props)
  }

  return s()
}
