# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.2.7](https://github.com/tracespace/tracespace/compare/v4.2.6...v4.2.7) (2022-03-12)

**Note:** Version bump only for package @tracespace/fixtures





# [4.2.0](https://github.com/tracespace/tracespace/compare/v4.1.1...v4.2.0) (2019-10-10)


### Bug Fixes

* **deps:** Upgrade all dependencies ([7f3c6f4](https://github.com/tracespace/tracespace/commit/7f3c6f4))





## [4.1.1](https://github.com/tracespace/tracespace/compare/v4.1.0...v4.1.1) (2019-06-05)


### Bug Fixes

* **deps:** update dependency glob to ^7.1.4 ([#250](https://github.com/tracespace/tracespace/issues/250)) ([8f6c5dc](https://github.com/tracespace/tracespace/commit/8f6c5dc))
* **whats-that-gerber:** Support for PCB:NG Eagle, .gbx, .art files ([#268](https://github.com/tracespace/tracespace/issues/268)) ([1449cba](https://github.com/tracespace/tracespace/commit/1449cba)), closes [#246](https://github.com/tracespace/tracespace/issues/246) [#248](https://github.com/tracespace/tracespace/issues/248)





## [4.0.2](https://github.com/tracespace/tracespace/compare/v4.0.1...v4.0.2) (2019-03-24)


### Bug Fixes

* **whats-that-gerber:** Add Orcad matchers for .drd and .npt ([#189](https://github.com/tracespace/tracespace/issues/189)) ([2894208](https://github.com/tracespace/tracespace/commit/2894208))





## [4.0.1](https://github.com/tracespace/tracespace/compare/v4.0.0...v4.0.1) (2019-03-23)


### Bug Fixes

* **deps:** update dependency glob to ^7.1.3 ([#162](https://github.com/tracespace/tracespace/issues/162)) ([e20498c](https://github.com/tracespace/tracespace/commit/e20498c))
* **deps:** update dependency run-parallel to ^1.1.9 ([#166](https://github.com/tracespace/tracespace/issues/166)) ([a175306](https://github.com/tracespace/tracespace/commit/a175306))
* **deps:** update dependency run-series to ^1.1.8 ([#170](https://github.com/tracespace/tracespace/issues/170)) ([d5b0082](https://github.com/tracespace/tracespace/commit/d5b0082))
* **deps:** update dependency run-waterfall to ^1.1.6 ([#172](https://github.com/tracespace/tracespace/issues/172)) ([9e72361](https://github.com/tracespace/tracespace/commit/9e72361))
* **whats-that-gerber:** Recognize DipTrace inner copper layers  ([#171](https://github.com/tracespace/tracespace/issues/171)) ([100a95b](https://github.com/tracespace/tracespace/commit/100a95b)), closes [#138](https://github.com/tracespace/tracespace/issues/138)





# [4.0.0](https://github.com/tracespace/tracespace/compare/v4.0.0-next.19...v4.0.0) (2019-03-09)

**Note:** Version bump only for package @tracespace/fixtures





# [4.0.0-next.19](https://github.com/tracespace/tracespace/compare/v4.0.0-next.18...v4.0.0-next.19) (2019-03-09)


### Performance Improvements

* Align and simplify parameters, defaults, and return values ([#102](https://github.com/tracespace/tracespace/issues/102)) ([c4e3a84](https://github.com/tracespace/tracespace/commit/c4e3a84)), closes [#99](https://github.com/tracespace/tracespace/issues/99)


### BREAKING CHANGES

* Parameters, defaults, and return types have changed in pcb-stackup,
pcb-stackup-core, and gerber-to-svg





# [4.0.0-next.18](https://github.com/tracespace/tracespace/compare/v4.0.0-next.17...v4.0.0-next.18) (2019-01-26)


### Bug Fixes

* **fixtures:** Replace macro multi-exposure expected render ([#101](https://github.com/tracespace/tracespace/issues/101)) ([a821588](https://github.com/tracespace/tracespace/commit/a821588))





# [4.0.0-next.15](https://github.com/tracespace/tracespace/compare/v4.0.0-next.14...v4.0.0-next.15) (2018-11-13)


### Features

* **whats-that-gerber:** Use collection of filenames to determine type ([#77](https://github.com/tracespace/tracespace/issues/77)) ([6919549](https://github.com/tracespace/tracespace/commit/6919549))


### BREAKING CHANGES

* **whats-that-gerber:** Output of whats-that-gerber changed from a single string to an
object keyed by the filenames passed in as an array





<a name="4.0.0-next.13"></a>
# [4.0.0-next.13](https://github.com/tracespace/tracespace/compare/v4.0.0-next.12...v4.0.0-next.13) (2018-09-12)


### Bug Fixes

* Replace shortid with [@tracespace](https://github.com/tracespace)/xml-id and sanitize IDs ([#79](https://github.com/tracespace/tracespace/issues/79)) ([2cda760](https://github.com/tracespace/tracespace/commit/2cda760)), closes [#78](https://github.com/tracespace/tracespace/issues/78)





<a name="4.0.0-next.12"></a>
# [4.0.0-next.12](https://github.com/tracespace/tracespace/compare/v4.0.0-next.11...v4.0.0-next.12) (2018-07-17)


### Features

* **whats-that-gerber:** Add support for eagle 9+ filenames ([#76](https://github.com/tracespace/tracespace/issues/76)) ([3b8f570](https://github.com/tracespace/tracespace/commit/3b8f570))





<a name="4.0.0-next.11"></a>
# [4.0.0-next.11](https://github.com/tracespace/tracespace/compare/v4.0.0-next.10...v4.0.0-next.11) (2018-07-02)


### Bug Fixes

* **whats-that-gerber:** Improve Altium mech layer recognition ([#70](https://github.com/tracespace/tracespace/issues/70)) ([e48d03f](https://github.com/tracespace/tracespace/commit/e48d03f)), closes [#69](https://github.com/tracespace/tracespace/issues/69)





<a name="4.0.0-next.10"></a>
# [4.0.0-next.10](https://github.com/tracespace/tracespace/compare/v4.0.0-next.9...v4.0.0-next.10) (2018-06-27)


### Features

* **whats-that-gerber:** Match Altium internal planes as icu layer ([#68](https://github.com/tracespace/tracespace/issues/68)) ([f0155e2](https://github.com/tracespace/tracespace/commit/f0155e2)), closes [#67](https://github.com/tracespace/tracespace/issues/67)





<a name="4.0.0-next.9"></a>
# [4.0.0-next.9](https://github.com/tracespace/tracespace/compare/v4.0.0-next.8...v4.0.0-next.9) (2018-06-19)


### Features

* **fixtures:** Add usbvil and bus-pirate boards ([#65](https://github.com/tracespace/tracespace/issues/65)) ([394e130](https://github.com/tracespace/tracespace/commit/394e130))





<a name="4.0.0-next.7"></a>
# [4.0.0-next.7](https://github.com/tracespace/tracespace/compare/v4.0.0-next.6...v4.0.0-next.7) (2018-06-16)

**Note:** Version bump only for package @tracespace/fixtures





<a name="4.0.0-next.5"></a>
# [4.0.0-next.5](https://github.com/tracespace/tracespace/compare/v4.0.0-next.4...v4.0.0-next.5) (2018-06-15)

**Note:** Version bump only for package @tracespace/fixtures





<a name="4.0.0-next.4"></a>
# [4.0.0-next.4](https://github.com/tracespace/tracespace/compare/v4.0.0-next.3...v4.0.0-next.4) (2018-04-27)


### Features

* **fixtures:** Move common render server into fixtures module ([523f681](https://github.com/tracespace/tracespace/commit/523f681))





<a name="4.0.0-next.2"></a>
# [4.0.0-next.2](https://github.com/tracespace/tracespace/compare/v4.0.0-next.1...v4.0.0-next.2) (2018-04-17)

**Note:** Version bump only for package @tracespace/fixtures





<a name="4.0.0-next.1"></a>
# [4.0.0-next.1](https://github.com/tracespace/tracespace/compare/4.0.0-next.0...4.0.0-next.1) (2018-04-17)


### Features

* **fixtures:** Add [@tracespace](https://github.com/tracespace)/fixtures module ([526a330](https://github.com/tracespace/tracespace/commit/526a330))
