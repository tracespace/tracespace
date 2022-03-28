# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.2.8](https://github.com/tracespace/tracespace/compare/v4.2.7...v4.2.8) (2022-03-28)

**Note:** Version bump only for package pcb-stackup





## [4.2.7](https://github.com/tracespace/tracespace/compare/v4.2.6...v4.2.7) (2022-03-12)

**Note:** Version bump only for package pcb-stackup





## [4.2.6](https://github.com/tracespace/tracespace/compare/v4.2.5...v4.2.6) (2022-03-12)

**Note:** Version bump only for package pcb-stackup





## [4.2.5](https://github.com/tracespace/tracespace/compare/v4.2.4...v4.2.5) (2020-12-18)

**Note:** Version bump only for package pcb-stackup





## [4.2.4](https://github.com/tracespace/tracespace/compare/v4.2.3...v4.2.4) (2020-12-15)

**Note:** Version bump only for package pcb-stackup





## [4.2.2](https://github.com/tracespace/tracespace/compare/v4.2.1...v4.2.2) (2020-10-13)

**Note:** Version bump only for package pcb-stackup





## [4.2.1](https://github.com/tracespace/tracespace/compare/v4.2.0...v4.2.1) (2020-04-30)

**Note:** Version bump only for package pcb-stackup





# [4.2.0](https://github.com/tracespace/tracespace/compare/v4.1.1...v4.2.0) (2019-10-10)


### Bug Fixes

* **deps:** update type definitions ([#272](https://github.com/tracespace/tracespace/issues/272)) ([6f6eb3f](https://github.com/tracespace/tracespace/commit/6f6eb3f))
* **deps:** Upgrade all dependencies ([7f3c6f4](https://github.com/tracespace/tracespace/commit/7f3c6f4))





## [4.1.1](https://github.com/tracespace/tracespace/compare/v4.1.0...v4.1.1) (2019-06-05)


### Bug Fixes

* **deps:** update type definitions ([#245](https://github.com/tracespace/tracespace/issues/245)) ([d227db3](https://github.com/tracespace/tracespace/commit/d227db3))





# [4.1.0](https://github.com/tracespace/tracespace/compare/v4.0.3...v4.1.0) (2019-05-01)


### Bug Fixes

* **deps:** update type definitions ([#238](https://github.com/tracespace/tracespace/issues/238)) ([899777e](https://github.com/tracespace/tracespace/commit/899777e))





## [4.0.3](https://github.com/tracespace/tracespace/compare/v4.0.2...v4.0.3) (2019-04-10)


### Bug Fixes

* **deps:** update dependency @types/node to ^11.13.0 ([#193](https://github.com/tracespace/tracespace/issues/193)) ([44f2d60](https://github.com/tracespace/tracespace/commit/44f2d60))
* **deps:** update dependency @types/node to ^11.13.2 ([#217](https://github.com/tracespace/tracespace/issues/217)) ([e981a4e](https://github.com/tracespace/tracespace/commit/e981a4e))





## [4.0.2](https://github.com/tracespace/tracespace/compare/v4.0.1...v4.0.2) (2019-03-24)


### Bug Fixes

* **deps:** update dependency @types/node to ^11.11.6 ([#184](https://github.com/tracespace/tracespace/issues/184)) ([c3bb301](https://github.com/tracespace/tracespace/commit/c3bb301))
* **gerber-to-svg:** Allow options parameter to be skipped ([#181](https://github.com/tracespace/tracespace/issues/181)) ([bbe5c07](https://github.com/tracespace/tracespace/commit/bbe5c07))





## [4.0.1](https://github.com/tracespace/tracespace/compare/v4.0.0...v4.0.1) (2019-03-23)

**Note:** Version bump only for package pcb-stackup





# [4.0.0](https://github.com/tracespace/tracespace/compare/v4.0.0-next.19...v4.0.0) (2019-03-09)

**Note:** Version bump only for package pcb-stackup





# [4.0.0-next.19](https://github.com/tracespace/tracespace/compare/v4.0.0-next.18...v4.0.0-next.19) (2019-03-09)


### Code Refactoring

* **pcb-stackup:** Remove special handling of options.createElement ([#110](https://github.com/tracespace/tracespace/issues/110)) ([7d7fbeb](https://github.com/tracespace/tracespace/commit/7d7fbeb)), closes [#43](https://github.com/tracespace/tracespace/issues/43)


### Features

* Add typescript definitions to all consumable modules ([#103](https://github.com/tracespace/tracespace/issues/103)) ([bb6e8f9](https://github.com/tracespace/tracespace/commit/bb6e8f9))
* Update dependencies and enable Greenkeeper ([9db54cc](https://github.com/tracespace/tracespace/commit/9db54cc))


### Performance Improvements

* Align and simplify parameters, defaults, and return values ([#102](https://github.com/tracespace/tracespace/issues/102)) ([c4e3a84](https://github.com/tracespace/tracespace/commit/c4e3a84)), closes [#99](https://github.com/tracespace/tracespace/issues/99)


### BREAKING CHANGES

* **pcb-stackup:** pcb-stackup no longer tries to help if you use
options.createElement. You can still use it, but you'll have to manually
align your gerber-to-svg options with pcb-stackup's options
* Parameters, defaults, and return types have changed in pcb-stackup,
pcb-stackup-core, and gerber-to-svg





# [4.0.0-next.18](https://github.com/tracespace/tracespace/compare/v4.0.0-next.17...v4.0.0-next.18) (2019-01-26)

**Note:** Version bump only for package pcb-stackup





# [4.0.0-next.17](https://github.com/tracespace/tracespace/compare/v4.0.0-next.16...v4.0.0-next.17) (2018-12-20)

**Note:** Version bump only for package pcb-stackup





# [4.0.0-next.15](https://github.com/tracespace/tracespace/compare/v4.0.0-next.14...v4.0.0-next.15) (2018-11-13)


### Features

* **whats-that-gerber:** Use collection of filenames to determine type ([#77](https://github.com/tracespace/tracespace/issues/77)) ([6919549](https://github.com/tracespace/tracespace/commit/6919549))


### BREAKING CHANGES

* **whats-that-gerber:** Output of whats-that-gerber changed from a single string to an
object keyed by the filenames passed in as an array





<a name="4.0.0-next.14"></a>
# [4.0.0-next.14](https://github.com/tracespace/tracespace/compare/v4.0.0-next.13...v4.0.0-next.14) (2018-10-13)

**Note:** Version bump only for package pcb-stackup





<a name="4.0.0-next.13"></a>
# [4.0.0-next.13](https://github.com/tracespace/tracespace/compare/v4.0.0-next.12...v4.0.0-next.13) (2018-09-12)


### Bug Fixes

* Replace shortid with [@tracespace](https://github.com/tracespace)/xml-id and sanitize IDs ([#79](https://github.com/tracespace/tracespace/issues/79)) ([2cda760](https://github.com/tracespace/tracespace/commit/2cda760)), closes [#78](https://github.com/tracespace/tracespace/issues/78)





<a name="4.0.0-next.12"></a>
# [4.0.0-next.12](https://github.com/tracespace/tracespace/compare/v4.0.0-next.11...v4.0.0-next.12) (2018-07-17)


### Bug Fixes

* **pcb-stackup:** Do not mutate layer options and keep filename ([6cbecde](https://github.com/tracespace/tracespace/commit/6cbecde))





<a name="4.0.0-next.11"></a>
# [4.0.0-next.11](https://github.com/tracespace/tracespace/compare/v4.0.0-next.10...v4.0.0-next.11) (2018-07-02)

**Note:** Version bump only for package pcb-stackup





<a name="4.0.0-next.10"></a>
# [4.0.0-next.10](https://github.com/tracespace/tracespace/compare/v4.0.0-next.9...v4.0.0-next.10) (2018-06-27)

**Note:** Version bump only for package pcb-stackup





<a name="4.0.0-next.9"></a>
# [4.0.0-next.9](https://github.com/tracespace/tracespace/compare/v4.0.0-next.8...v4.0.0-next.9) (2018-06-19)

**Note:** Version bump only for package pcb-stackup





<a name="4.0.0-next.8"></a>
# [4.0.0-next.8](https://github.com/tracespace/tracespace/compare/v4.0.0-next.7...v4.0.0-next.8) (2018-06-16)

**Note:** Version bump only for package pcb-stackup





<a name="4.0.0-next.7"></a>
# [4.0.0-next.7](https://github.com/tracespace/tracespace/compare/v4.0.0-next.6...v4.0.0-next.7) (2018-06-16)

**Note:** Version bump only for package pcb-stackup





<a name="4.0.0-next.6"></a>
# [4.0.0-next.6](https://github.com/tracespace/tracespace/compare/v4.0.0-next.5...v4.0.0-next.6) (2018-06-15)

**Note:** Version bump only for package pcb-stackup





<a name="4.0.0-next.5"></a>
# [4.0.0-next.5](https://github.com/tracespace/tracespace/compare/v4.0.0-next.4...v4.0.0-next.5) (2018-06-15)

**Note:** Version bump only for package pcb-stackup





<a name="4.0.0-next.4"></a>
# [4.0.0-next.4](https://github.com/tracespace/tracespace/compare/v4.0.0-next.3...v4.0.0-next.4) (2018-04-27)


### Features

* **fixtures:** Move common render server into fixtures module ([523f681](https://github.com/tracespace/tracespace/commit/523f681))





<a name="4.0.0-next.3"></a>
# [4.0.0-next.3](https://github.com/tracespace/tracespace/compare/v4.0.0-next.2...v4.0.0-next.3) (2018-04-18)


### Features

* **tracespace:** Add whats-that-gerber@3.0.0 to monorepo ([5d755ed](https://github.com/tracespace/tracespace/commit/5d755ed))





<a name="4.0.0-next.2"></a>
# [4.0.0-next.2](https://github.com/tracespace/tracespace/compare/v4.0.0-next.1...v4.0.0-next.2) (2018-04-17)

**Note:** Version bump only for package pcb-stackup
