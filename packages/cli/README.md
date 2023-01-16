# tracespace cli

[![npm][npm badge]][npm package]

Use Gerber/drill files to render a PCB to SVG from the command line. Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm package]: https://www.npmjs.com/package/@tracespace/cli/v/next
[npm badge]: https://img.shields.io/npm/v/@tracespace/cli/next?style=flat-square

## install

```shell
npm install -g @tracespace/cli@next
```

## usage

```shell
tracespace --help
```

### tracespace render <files..>

Use `tracespace` or `tracespace render` to render a set of Gerber/drill files. By default, a `.svg` file will be written for every layer, in addition to `top.svg` and `bottom.svg` for renders of the finished board.

```shell
tracespace render my-board/*.gbr
```

| option              | description                                  | default |
| ------------------- | -------------------------------------------- | ------- |
| `-o, --output`      | Output directory                             | CWD     |
| `-l, --layers-only` | Only write layer renders                     | `false` |
| `-b, --board-only`  | Only write board renders                     | `false` |
| `--parse`           | Write intermediate parse trees for debugging | `false` |
| `--plot`            | Write intermediate plot trees for debugging  | `false` |

### tracespace plot <files..>

Use `tracespace plot` to plot the images of a set of Gerber/drill files. By default, a `.plot.json` file will be written for every layer, in addition to `board-shape.json` for the board shape inferred from an included outline layer, if possible.

```shell
tracespace plot my-board/*.gbr
```

| option              | description                                  | default |
| ------------------- | -------------------------------------------- | ------- |
| `-o, --output`      | Output directory                             | CWD     |
| `-l, --layers-only` | Only write layer plots                       | `false` |
| `--parse`           | Write intermediate parse trees for debugging | `false` |

### tracespace parse <files..>

Use `tracespace parse` to parse of a set of Gerber/drill files. A `.parse.json` file will be written for every layer.

```shell
tracespace parse my-board/*.gbr
```

| option         | description      | default |
| -------------- | ---------------- | ------- |
| `-o, --output` | Output directory | CWD     |
