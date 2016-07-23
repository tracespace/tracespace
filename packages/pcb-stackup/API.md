<a name="pcbStackup"></a>

## pcbStackup(layers, [options], done) : `function`
The pcb-stackup converter function.

| Param     | Type                      | Default                                           | Description                                                                                                                      |
| ---       | ---                       | ---                                               | ---                                                                                                                              |
| layers    | [`array.<Layer>`](#Layer) |                                                   | Array of layer objects                                                                                                           |
| [options] | `object`                  | `{id: shortId.generate(), maskWithOutline: true}` | Optional options, see [pcb-stackup-core docs][1]. Setting createElement will override that setting in the gerber-to-svg options. |
| done      | [`Done`](#Done)           |                                                   | Callback function.                                                                                                               |

<a name="Layer"></a>

## Layer : `object`
**Properties**

| Name      | Type                                    | Default                    | Description                                                                                                      |
| ---       | ---                                     | ---                        | ---                                                                                                              |
| gerber    | `string` &#124; `NodeJS.ReadableStream` |                            | The gerber data as a string or [ReadableStream][2]                                                               |
| filename  | `string`                                |                            | The filename so we can try and identify the type of the layer. You either have to provide this or the layerType. |
| layerType | `string`                                |                            | The layer type, a [valid layer type][3] as given by whats-that-gerber.                                           |
| options   | `object`                                | `{id: shortId.generate()}` | [gerber-to-svg options][4]                                                                                       |

<a name="Done"></a>

## Done(error, stackup) : `function`

| Param   | Type                  | Description                    |
| ---     | ---                   | ---                            |
| error   | `Error`               | Error if something goes wrong. |
| stackup | [`Stackup`](#Stackup) | The stackup data.              |

<a name="Stackup"></a>

## Stackup : `object`
**Properties**

| Name       | Type                      | Description                                                                           |
| ---        | ---                       | ---                                                                                   |
| top        | `object`                  | The top view SVG object, see [pcb-stackup-core docs][5] for full details.             |
| top.svg    | `string`                  | The top SVG string.                                                                   |
| bottom     | `object`                  | The bottom view SVG object, see [pcb-stackup-core docs][6] for full details.          |
| bottom.svg | `string`                  | The bottom SVG string.                                                                |
| layers     | [`Array.<Layer>`](#Layer) | A cache of the processed layers that can be passed back to [pcbStackup](#pcbStackup). |

[1]: https://github.com/tracespace/pcb-stackup-core/blob/master/README.md#options
[2]: https://nodejs.org/api/stream.html#stream_readable_streams
[3]: https://github.com/tracespace/whats-that-gerber#layer-types-and-names
[4]: https://github.com/mcous/gerber-to-svg/blob/master/API.md#options
[5]: https://github.com/tracespace/pcb-stackup-core/blob/master/README.md#usage
[6]: https://github.com/tracespace/pcb-stackup-core/blob/master/README.md#usage
