# tracespace cli

[![latest][@tracespace/cli-latest-badge]][npm]
[![next][@tracespace/cli-next-badge]][npm-next]
[![david][@tracespace/cli-david-badge]][david]

> Render PCBs as SVGs from the comfort of your own terminal

The tracespace CLI provides a wrapper for [gerber-to-svg][] and [pcb-stackup][] so you can generate beautiful, precise SVG renders of printed circuit boards quickly and easily.

Part of the [tracespace][] collection of PCB visualization tools.

[gerber-to-svg]: ../gerber-to-svg
[pcb-stackup]: ../pcb-stackup
[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/@tracespace/cli
[npm-next]: https://www.npmjs.com/package/@tracespace/cli/v/next
[david]: https://david-dm.org/tracespace/tracespace?path=packages/cli
[@tracespace/cli-latest-badge]: https://flat.badgen.net/npm/v/@tracespace/cli
[@tracespace/cli-next-badge]: https://flat.badgen.net/npm/v/@tracespace/cli/next
[@tracepsace/cli-david-badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/cli

## install

```shell
npm install -g @tracespace/cli
# or
yarn global add @tracespace/cli
```

## usage

```shell
tracespace [options] <files...>
```

You can also use [`npx`][npx] to run without installing globally

```shell
npx @tracespace/cli [options] <files...>
```

[npx]: https://github.com/zkat/npx

### options

All options can be specified using a config file (`.tracespacerc`, `.tracespacerc.json`, `tracespace.config.js`, etc.) or a `"tracespace"` key in `package.json`. Config will be loaded from the current working directory. See [cosmiconfig][] for additional acceptable config file names and formats.

[cosmiconfig]: https://github.com/davidtheclark/cosmiconfig

#### `-h`, `--help`

- Type: boolean
- Description: prints version and usage then exits

```shell
# Print usage
tracespace --help
```

#### `-v`, `--version`

- Type: boolean
- Description: prints version then exits

```shell
# Print version
tracespace --version
```

<!-- insert:docs:options -->

#### `-o`, `--out`, `config.out`

- Type: `string`
- Default: `.`
- Description: Output directory (or `-` for stdout)

```shell
# Write SVGs into directory `./renders`
tracespace --out=renders
```

#### `-B`, `--noBoard`, `config.noBoard`

- Type: `boolean`
- Default: `false`
- Description: Skip rendering PCB top and bottom

```shell
# Output only the individual layer renders
tracespace -B
```

#### `-L`, `--noLayer`, `config.noLayer`

- Type: `boolean`
- Default: `false`
- Description: Skip rendering individual Gerber and drill layers

```shell
# Output only the top and bottom PCB renders
tracespace -L
```

#### `-f`, `--force`, `config.force`

- Type: `boolean`
- Default: `false`
- Description: Attempt to render files even if they're unrecognized

```shell
# Attempt render even if whats-that-gerber cannot identify
tracespace -B --force some-file.xyz
```

#### `-g`, `--gerber`, `config.gerber`

- Type: `object`
- Default: `{}`
- Description: Options for all gerber files (passed to gerber-to-svg)

```shell
# Set the color attribute of all Gerber SVGs
tracespace -B -g.attributes.color=blue
```

#### `-d`, `--drill`, `config.drill`

- Type: `object`
- Default: `{}`
- Description: Options for all drill files (passed to gerber-to-svg)

```shell
# Set the color attribute of all drill SVGs
tracespace -B -d.attributes.color=red
```

#### `-b`, `--board`, `config.board`

- Type: `object`
- Default: `{}`
- Description: Options for PCB renders (passed to pcb-stackup)

```shell
# Set the soldermask color of the board renders
tracespace -b.color.sm="rgba(128,00,00,0.75)"
```

#### `-l`, `--layer`, `config.layer`

- Type: `object`
- Default: `{}`
- Description: Override the layers options of a given file

> If you're using this option a lot, you may want to consider using a config file

```shell
# Set layer type of `arduino-uno.drd` to `drill` and parse as a drill file
tracespace -l.arduino-uno.drd.type=drill -l.arduino-uno.drd.options.filetype=drill
```

#### `-q`, `--quiet`, `config.quiet`

- Type: `boolean`
- Default: `false`
- Description: Suppress informational output (info logs to stderr)

```shell
# Do not print info to stderr
tracespace --quiet
```

<!-- endinsert:docs:options -->
