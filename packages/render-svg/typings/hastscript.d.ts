declare module 'hastscript/svg' {
  import {Element} from 'hast-format'

  namespace svg {
    type Properties = {[name: string]: unknown}
    type Children = string | Element | (string | Element)[]
  }

  function svg(
    selector: string,
    properties: svg.Properties,
    children: svg.Children
  ): Element

  function svg(): Element
  function svg(selector: string): Element
  function svg(properties: svg.Properties): Element
  function svg(children: svg.Children): Element
  function svg(selector: string, properties: svg.Properties): Element
  function svg(selector: string, children: svg.Children): Element
  function svg(properties: svg.Properties, children: svg.Children): Element

  export = svg
}
