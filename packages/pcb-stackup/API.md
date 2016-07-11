<a name="pcbStackup"></a>

## pcbStackup(layers, [options], done)
The pcb-stackup converter function.

| Param     | Type                                       | Default                               | Description                                                                                                                  |
| --------- | ------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| layers    | <code>[array.&lt;Layer&gt;](#Layer)</code> |                                       | Array of layer objects                                                                                                       |
| [options] | <code>object</code>                        | <code>{id: shortId.generate()}</code> | Optional options, see [pcb-stackup-core-docs](https://github.com/tracespace/pcb-stackup-core/blob/master/README.md#options). |
| done      | <code>[Done](#Done)</code>                 |                                       | Callback function.                                                                                                           |

<a name="Layer"></a>

## Layer : <code>object</code>
**Properties**

| Name      | Type                                                          | Default                               | Description                                                                                                                                |
| --------- | ------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| gerber    | <code>string</code> &#124; <code>NodeJS.ReadableStream</code> |                                       | The gerber data as a string or [ReadableStream](https://nodejs.org/api/stream.html#stream_readable_streams)                                |
| filename  | <code>string</code>                                           |                                       | The filename so we can try and identify the type of the layer. You either have to provide this or the layerType.                           |
| layerType | <code>string</code>                                           |                                       | The layer type, a [valid layer type](https://github.com/tracespace/whats-that-gerber#layer-types-and-names) as given by whats-that-gerber. |
| options   | <code>object</code>                                           | <code>{id: shortId.generate()}</code> | [gerber-to-svg options](https://github.com/mcous/gerber-to-svg/blob/master/API.md#options)                                                 |

<a name="Done"></a>

## Done : <code>function</code>

| Param   | Type                             | Description                    |
| ------- | -------------------------------- | ------------------------------ |
| error   | <code>Error</code>               | Error if something goes wrong. |
| stackup | <code>[Stackup](#Stackup)</code> | The stackup data.              |

<a name="Stackup"></a>

## Stackup : <code>object</code>
**Properties**

| Name       | Type                                       | Description                                                                                                                                           |
| ---------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| top        | <code>object</code>                        | The top view SVG object, see [pcb-stackup-core docs](https://github.com/tracespace/pcb-stackup-core/blob/master/README.md#usage) for full details.    |
| top.svg    | <code>string</code>                        | The top SVG string.                                                                                                                                   |
| bottom     | <code>object</code>                        | The bottom view SVG object, see [pcb-stackup-core docs](https://github.com/tracespace/pcb-stackup-core/blob/master/README.md#usage) for full details. |
| bottom.svg | <code>string</code>                        | The bottom SVG string.                                                                                                                                |
| layers     | <code>[Array.&lt;Layer&gt;](#Layer)</code> | A cache of the processed layers that can be passed back to pcbStackup.                                                                                |
