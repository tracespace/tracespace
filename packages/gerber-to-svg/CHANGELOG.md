# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://github.com/tracespace/tracespace/compare/v4.0.0-next.19...v4.0.0) (2019-03-09)

**Note:** Version bump only for package gerber-to-svg





# [4.0.0-next.19](https://github.com/tracespace/tracespace/compare/v4.0.0-next.18...v4.0.0-next.19) (2019-03-09)


### Features

* Add typescript definitions to all consumable modules ([#103](https://github.com/tracespace/tracespace/issues/103)) ([bb6e8f9](https://github.com/tracespace/tracespace/commit/bb6e8f9))
* Update dependencies and enable Greenkeeper ([9db54cc](https://github.com/tracespace/tracespace/commit/9db54cc))


### Performance Improvements

* Align and simplify parameters, defaults, and return values ([#102](https://github.com/tracespace/tracespace/issues/102)) ([c4e3a84](https://github.com/tracespace/tracespace/commit/c4e3a84)), closes [#99](https://github.com/tracespace/tracespace/issues/99)


### BREAKING CHANGES

* Parameters, defaults, and return types have changed in pcb-stackup,
pcb-stackup-core, and gerber-to-svg





# [4.0.0-next.18](https://github.com/tracespace/tracespace/compare/v4.0.0-next.17...v4.0.0-next.18) (2019-01-26)


### Bug Fixes

* **gerber-to-svg:** Wrap children of <mask> nodes in a <g> ([#100](https://github.com/tracespace/tracespace/issues/100)) ([b984e32](https://github.com/tracespace/tracespace/commit/b984e32)), closes [#98](https://github.com/tracespace/tracespace/issues/98)





# [4.0.0-next.17](https://github.com/tracespace/tracespace/compare/v4.0.0-next.16...v4.0.0-next.17) (2018-12-20)

**Note:** Version bump only for package gerber-to-svg





# [4.0.0-next.15](https://github.com/tracespace/tracespace/compare/v4.0.0-next.14...v4.0.0-next.15) (2018-11-13)


### Features

* **whats-that-gerber:** Use collection of filenames to determine type ([#77](https://github.com/tracespace/tracespace/issues/77)) ([6919549](https://github.com/tracespace/tracespace/commit/6919549))


### BREAKING CHANGES

* **whats-that-gerber:** Output of whats-that-gerber changed from a single string to an
object keyed by the filenames passed in as an array





<a name="4.0.0-next.14"></a>
# [4.0.0-next.14](https://github.com/tracespace/tracespace/compare/v4.0.0-next.13...v4.0.0-next.14) (2018-10-13)

**Note:** Version bump only for package gerber-to-svg





<a name="4.0.0-next.13"></a>
# [4.0.0-next.13](https://github.com/tracespace/tracespace/compare/v4.0.0-next.12...v4.0.0-next.13) (2018-09-12)


### Bug Fixes

* Replace shortid with [@tracespace](https://github.com/tracespace)/xml-id and sanitize IDs ([#79](https://github.com/tracespace/tracespace/issues/79)) ([2cda760](https://github.com/tracespace/tracespace/commit/2cda760)), closes [#78](https://github.com/tracespace/tracespace/issues/78)





<a name="4.0.0-next.12"></a>
# [4.0.0-next.12](https://github.com/tracespace/tracespace/compare/v4.0.0-next.11...v4.0.0-next.12) (2018-07-17)


### Code Refactoring

* **gerber-to-svg:** Remove CLI in favor of [@tracespace](https://github.com/tracespace)/cli ([50e255d](https://github.com/tracespace/tracespace/commit/50e255d))


### BREAKING CHANGES

* **gerber-to-svg:** Removed gerber-to-svg (gerber2svg) CLI





<a name="4.0.0-next.9"></a>
# [4.0.0-next.9](https://github.com/tracespace/tracespace/compare/v4.0.0-next.8...v4.0.0-next.9) (2018-06-19)

**Note:** Version bump only for package gerber-to-svg





<a name="4.0.0-next.8"></a>
# [4.0.0-next.8](https://github.com/tracespace/tracespace/compare/v4.0.0-next.7...v4.0.0-next.8) (2018-06-16)

**Note:** Version bump only for package gerber-to-svg





<a name="4.0.0-next.7"></a>
# [4.0.0-next.7](https://github.com/tracespace/tracespace/compare/v4.0.0-next.6...v4.0.0-next.7) (2018-06-16)

**Note:** Version bump only for package gerber-to-svg





<a name="4.0.0-next.6"></a>
# [4.0.0-next.6](https://github.com/tracespace/tracespace/compare/v4.0.0-next.5...v4.0.0-next.6) (2018-06-15)


### Bug Fixes

* **gerber-to-svg:** Fix append-ext check using old short-option ([cde8cda](https://github.com/tracespace/tracespace/commit/cde8cda))





<a name="4.0.0-next.5"></a>
# [4.0.0-next.5](https://github.com/tracespace/tracespace/compare/v4.0.0-next.4...v4.0.0-next.5) (2018-06-15)


### Features

* **gerber-to-svg:** Replace non-functional CLI options ([5633375](https://github.com/tracespace/tracespace/commit/5633375))


### BREAKING CHANGES

* **gerber-to-svg:** Short option for --append-ext was changed from -a to
-e, short option for --optimize-paths was changed to from -z to -t to
match documentation and because -z was already used by --zero
