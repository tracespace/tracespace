# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.2.8](https://github.com/tracespace/tracespace/compare/v4.2.7...v4.2.8) (2022-03-28)


### Bug Fixes

* **plotter:** do not ignore duplicate tool definitions ([#379](https://github.com/tracespace/tracespace/issues/379)) ([87a0849](https://github.com/tracespace/tracespace/commit/87a0849))





## [4.2.7](https://github.com/tracespace/tracespace/compare/v4.2.6...v4.2.7) (2022-03-12)

**Note:** Version bump only for package tracespace





## [4.2.6](https://github.com/tracespace/tracespace/compare/v4.2.5...v4.2.6) (2022-03-12)


### Bug Fixes

* **gerber-parser:** ignore object attribute %TO blocks ([#376](https://github.com/tracespace/tracespace/issues/376)) ([844d44b](https://github.com/tracespace/tracespace/commit/844d44b)), closes [#375](https://github.com/tracespace/tracespace/issues/375)





## [4.2.5](https://github.com/tracespace/tracespace/compare/v4.2.4...v4.2.5) (2020-12-18)


### Bug Fixes

* **gerber-plotter:** allow unset tool when drawing region arcs ([#356](https://github.com/tracespace/tracespace/issues/356)) ([f18d796](https://github.com/tracespace/tracespace/commit/f18d796)), closes [#355](https://github.com/tracespace/tracespace/issues/355)





## [4.2.4](https://github.com/tracespace/tracespace/compare/v4.2.3...v4.2.4) (2020-12-15)


### Bug Fixes

* **parser:** accept units on same line as format ([#350](https://github.com/tracespace/tracespace/issues/350)) ([eb2feae](https://github.com/tracespace/tracespace/commit/eb2feae))
* **types:** define more types for gerber-plotter ([#349](https://github.com/tracespace/tracespace/issues/349)) ([d1a1417](https://github.com/tracespace/tracespace/commit/d1a1417))





## [4.2.3](https://github.com/tracespace/tracespace/compare/v4.2.2...v4.2.3) (2020-10-13)


### Bug Fixes

* **view:** revert jszip to 3.2.2 ([489f207](https://github.com/tracespace/tracespace/commit/489f207)), closes [Stuk/jszip#663](https://github.com/Stuk/jszip/issues/663)





## [4.2.2](https://github.com/tracespace/tracespace/compare/v4.2.1...v4.2.2) (2020-10-13)


### Bug Fixes

* **parser,plotter:** resolve issues with macro parsing and plotting ([#346](https://github.com/tracespace/tracespace/issues/346)) ([09d4a28](https://github.com/tracespace/tracespace/commit/09d4a28)), closes [#345](https://github.com/tracespace/tracespace/issues/345)





## [4.2.1](https://github.com/tracespace/tracespace/compare/v4.2.0...v4.2.1) (2020-04-30)


### Bug Fixes

* **cli:** resolve file paths correctly on Windows ([#328](https://github.com/tracespace/tracespace/issues/328)) ([2eb1dc7](https://github.com/tracespace/tracespace/commit/2eb1dc7)), closes [#327](https://github.com/tracespace/tracespace/issues/327)
* **deps:** update devDependencies, React, and yargs ([#315](https://github.com/tracespace/tracespace/issues/315)) ([34ebb3e](https://github.com/tracespace/tracespace/commit/34ebb3e))
* **view:** avoid lowercase sentence start in welcome message ([#323](https://github.com/tracespace/tracespace/issues/323)) ([8b7f331](https://github.com/tracespace/tracespace/commit/8b7f331))





# [4.2.0](https://github.com/tracespace/tracespace/compare/v4.1.1...v4.2.0) (2019-10-10)


### Bug Fixes

* **deps:** update dependencies ([#304](https://github.com/tracespace/tracespace/issues/304)) ([8029e8e](https://github.com/tracespace/tracespace/commit/8029e8e))
* **deps:** update dependency globby to v10 ([#289](https://github.com/tracespace/tracespace/issues/289)) ([09f6960](https://github.com/tracespace/tracespace/commit/09f6960))
* **deps:** update type definitions ([#272](https://github.com/tracespace/tracespace/issues/272)) ([6f6eb3f](https://github.com/tracespace/tracespace/commit/6f6eb3f))
* **deps:** Upgrade all dependencies ([7f3c6f4](https://github.com/tracespace/tracespace/commit/7f3c6f4))
* **view:** Ensure layer defs are accessible to <mask>s in board renders ([#305](https://github.com/tracespace/tracespace/issues/305)) ([0d0ee60](https://github.com/tracespace/tracespace/commit/0d0ee60)), closes [#303](https://github.com/tracespace/tracespace/issues/303)


### Features

* **gerber-parser:** Identify hole-plating in drill files ([#285](https://github.com/tracespace/tracespace/issues/285)) ([497f506](https://github.com/tracespace/tracespace/commit/497f506))





## [4.1.1](https://github.com/tracespace/tracespace/compare/v4.1.0...v4.1.1) (2019-06-05)


### Bug Fixes

* **cli:** Do not append "null" to output filenames ([#253](https://github.com/tracespace/tracespace/issues/253)) ([09f1c4e](https://github.com/tracespace/tracespace/commit/09f1c4e)), closes [#251](https://github.com/tracespace/tracespace/issues/251)
* **deps:** update dependency core-js to ^3.1.3 ([#261](https://github.com/tracespace/tracespace/issues/261)) ([5b60c1e](https://github.com/tracespace/tracespace/commit/5b60c1e))
* **deps:** update dependency cosmiconfig to ^5.2.1 ([#257](https://github.com/tracespace/tracespace/issues/257)) ([b2586c5](https://github.com/tracespace/tracespace/commit/b2586c5))
* **deps:** update dependency file-saver to ^2.0.2 ([#255](https://github.com/tracespace/tracespace/issues/255)) ([3dac107](https://github.com/tracespace/tracespace/commit/3dac107))
* **deps:** update dependency formik to ^1.5.7 ([#259](https://github.com/tracespace/tracespace/issues/259)) ([e47896e](https://github.com/tracespace/tracespace/commit/e47896e))
* **deps:** update dependency glob to ^7.1.4 ([#250](https://github.com/tracespace/tracespace/issues/250)) ([8f6c5dc](https://github.com/tracespace/tracespace/commit/8f6c5dc))
* **deps:** update dependency mixpanel-browser to ^2.28.0 ([#256](https://github.com/tracespace/tracespace/issues/256)) ([52b81d6](https://github.com/tracespace/tracespace/commit/52b81d6))
* **deps:** update dependency readable-stream to ^3.4.0 ([#264](https://github.com/tracespace/tracespace/issues/264)) ([1936088](https://github.com/tracespace/tracespace/commit/1936088))
* **deps:** update dependency yargs to ^13.2.4 ([#254](https://github.com/tracespace/tracespace/issues/254)) ([04646a3](https://github.com/tracespace/tracespace/commit/04646a3))
* **deps:** update font awesome ([#249](https://github.com/tracespace/tracespace/issues/249)) ([040b16d](https://github.com/tracespace/tracespace/commit/040b16d))
* **deps:** update type definitions ([#245](https://github.com/tracespace/tracespace/issues/245)) ([d227db3](https://github.com/tracespace/tracespace/commit/d227db3))
* **whats-that-gerber:** Support for PCB:NG Eagle, .gbx, .art files ([#268](https://github.com/tracespace/tracespace/issues/268)) ([1449cba](https://github.com/tracespace/tracespace/commit/1449cba)), closes [#246](https://github.com/tracespace/tracespace/issues/246) [#248](https://github.com/tracespace/tracespace/issues/248)





# [4.1.0](https://github.com/tracespace/tracespace/compare/v4.0.3...v4.1.0) (2019-05-01)


### Bug Fixes

* **deps:** update dependency dexie to v3.0.0-alpha.8 ([#240](https://github.com/tracespace/tracespace/issues/240)) ([e853602](https://github.com/tracespace/tracespace/commit/e853602))
* **deps:** update dependency formik to ^1.5.4 ([#241](https://github.com/tracespace/tracespace/issues/241)) ([4584731](https://github.com/tracespace/tracespace/commit/4584731))
* **deps:** update dependency react-hot-loader to ^4.8.4 ([#209](https://github.com/tracespace/tracespace/issues/209)) ([591bf66](https://github.com/tracespace/tracespace/commit/591bf66))
* **deps:** update dependency react-transition-group to v4 ([#232](https://github.com/tracespace/tracespace/issues/232)) ([14286fa](https://github.com/tracespace/tracespace/commit/14286fa))
* **deps:** update dependency untildify to v4 ([#242](https://github.com/tracespace/tracespace/issues/242)) ([207faf1](https://github.com/tracespace/tracespace/commit/207faf1))
* **deps:** update type definitions ([#238](https://github.com/tracespace/tracespace/issues/238)) ([899777e](https://github.com/tracespace/tracespace/commit/899777e))


### Features

* **view:** Add optional anonymous usage tracking ([#236](https://github.com/tracespace/tracespace/issues/236)) ([fea6a33](https://github.com/tracespace/tracespace/commit/fea6a33))





## [4.0.3](https://github.com/tracespace/tracespace/compare/v4.0.2...v4.0.3) (2019-04-10)


### Bug Fixes

* **deps:** update dependency @types/node to ^11.13.0 ([#193](https://github.com/tracespace/tracespace/issues/193)) ([44f2d60](https://github.com/tracespace/tracespace/commit/44f2d60))
* **deps:** update dependency @types/node to ^11.13.2 ([#217](https://github.com/tracespace/tracespace/issues/217)) ([e981a4e](https://github.com/tracespace/tracespace/commit/e981a4e))
* **deps:** update dependency core-js to ^3.0.1 ([#213](https://github.com/tracespace/tracespace/issues/213)) ([b6a87f1](https://github.com/tracespace/tracespace/commit/b6a87f1))
* **deps:** update dependency cosmiconfig to ^5.2.0 ([#190](https://github.com/tracespace/tracespace/issues/190)) ([347a9f5](https://github.com/tracespace/tracespace/commit/347a9f5))
* **deps:** update dependency dot-prop to v5 ([#214](https://github.com/tracespace/tracespace/issues/214)) ([921518e](https://github.com/tracespace/tracespace/commit/921518e))
* **deps:** update dependency formik to ^1.5.2 ([#204](https://github.com/tracespace/tracespace/issues/204)) ([f84edda](https://github.com/tracespace/tracespace/commit/f84edda))
* **deps:** update dependency globby to ^9.2.0 ([#200](https://github.com/tracespace/tracespace/issues/200)) ([06f0955](https://github.com/tracespace/tracespace/commit/06f0955))
* **deps:** update dependency make-dir to v3 ([#201](https://github.com/tracespace/tracespace/issues/201)) ([eff27d5](https://github.com/tracespace/tracespace/commit/eff27d5))
* **deps:** update dependency react-transition-group to ^2.8.0 ([#202](https://github.com/tracespace/tracespace/issues/202)) ([44a05a1](https://github.com/tracespace/tracespace/commit/44a05a1))
* **deps:** update dependency readable-stream to ^3.3.0 ([#199](https://github.com/tracespace/tracespace/issues/199)) ([594e947](https://github.com/tracespace/tracespace/commit/594e947))
* **deps:** update react monorepo and packages ([#191](https://github.com/tracespace/tracespace/issues/191)) ([56320c8](https://github.com/tracespace/tracespace/commit/56320c8))
* **view:** Make ZIP logic more lenient by checking filename ([#222](https://github.com/tracespace/tracespace/issues/222)) ([a37a02d](https://github.com/tracespace/tracespace/commit/a37a02d)), closes [#220](https://github.com/tracespace/tracespace/issues/220)





## [4.0.2](https://github.com/tracespace/tracespace/compare/v4.0.1...v4.0.2) (2019-03-24)


### Bug Fixes

* **deps:** update dependency @types/node to ^11.11.6 ([#184](https://github.com/tracespace/tracespace/issues/184)) ([c3bb301](https://github.com/tracespace/tracespace/commit/c3bb301))
* **deps:** update dependency jszip to ^3.2.1 ([#163](https://github.com/tracespace/tracespace/issues/163)) ([ee2aeac](https://github.com/tracespace/tracespace/commit/ee2aeac))
* **deps:** update font awesome ([#173](https://github.com/tracespace/tracespace/issues/173)) ([f9ba8e8](https://github.com/tracespace/tracespace/commit/f9ba8e8))
* **deps:** update react monorepo and packages ([#155](https://github.com/tracespace/tracespace/issues/155)) ([cd445d8](https://github.com/tracespace/tracespace/commit/cd445d8))
* **gerber-plotter:** Emit correct 'repeat' object on steprepeat disable ([#188](https://github.com/tracespace/tracespace/issues/188)) ([930d133](https://github.com/tracespace/tracespace/commit/930d133)), closes [#81](https://github.com/tracespace/tracespace/issues/81)
* **gerber-to-svg:** Allow options parameter to be skipped ([#181](https://github.com/tracespace/tracespace/issues/181)) ([bbe5c07](https://github.com/tracespace/tracespace/commit/bbe5c07))
* **whats-that-gerber:** Add Orcad matchers for .drd and .npt ([#189](https://github.com/tracespace/tracespace/issues/189)) ([2894208](https://github.com/tracespace/tracespace/commit/2894208))





## [4.0.1](https://github.com/tracespace/tracespace/compare/v4.0.0...v4.0.1) (2019-03-23)


### Bug Fixes

* **deps:** update dependency @types/lodash to ^4.14.123 ([#154](https://github.com/tracespace/tracespace/issues/154)) ([ff4856b](https://github.com/tracespace/tracespace/commit/ff4856b))
* **deps:** update dependency @types/react-dom to ^16.8.3 ([#156](https://github.com/tracespace/tracespace/issues/156)) ([0ee9a03](https://github.com/tracespace/tracespace/commit/0ee9a03))
* **deps:** update dependency color-string to ^1.5.3 ([#157](https://github.com/tracespace/tracespace/issues/157)) ([611b026](https://github.com/tracespace/tracespace/commit/611b026))
* **deps:** update dependency cosmiconfig to ^5.1.0 ([#158](https://github.com/tracespace/tracespace/issues/158)) ([100bb59](https://github.com/tracespace/tracespace/commit/100bb59))
* **deps:** update dependency debug to ^4.1.1 ([#159](https://github.com/tracespace/tracespace/issues/159)) ([153fa22](https://github.com/tracespace/tracespace/commit/153fa22))
* **deps:** update dependency dexie to v3.0.0-alpha.7 ([#161](https://github.com/tracespace/tracespace/issues/161)) ([0621fe4](https://github.com/tracespace/tracespace/commit/0621fe4))
* **deps:** update dependency glob to ^7.1.3 ([#162](https://github.com/tracespace/tracespace/issues/162)) ([e20498c](https://github.com/tracespace/tracespace/commit/e20498c))
* **deps:** update dependency mini-svg-data-uri to ^1.0.3 ([#164](https://github.com/tracespace/tracespace/issues/164)) ([ebc957c](https://github.com/tracespace/tracespace/commit/ebc957c))
* **deps:** update dependency run-parallel to ^1.1.9 ([#166](https://github.com/tracespace/tracespace/issues/166)) ([a175306](https://github.com/tracespace/tracespace/commit/a175306))
* **deps:** update dependency run-series to ^1.1.8 ([#170](https://github.com/tracespace/tracespace/issues/170)) ([d5b0082](https://github.com/tracespace/tracespace/commit/d5b0082))
* **deps:** update dependency run-waterfall to ^1.1.6 ([#172](https://github.com/tracespace/tracespace/issues/172)) ([9e72361](https://github.com/tracespace/tracespace/commit/9e72361))
* **gerber-parser:** Parse DipTrace drill coordinate format command ([#168](https://github.com/tracespace/tracespace/issues/168)) ([b0de854](https://github.com/tracespace/tracespace/commit/b0de854)), closes [#137](https://github.com/tracespace/tracespace/issues/137)
* **whats-that-gerber:** Recognize DipTrace inner copper layers  ([#171](https://github.com/tracespace/tracespace/issues/171)) ([100a95b](https://github.com/tracespace/tracespace/commit/100a95b)), closes [#138](https://github.com/tracespace/tracespace/issues/138)





# [4.0.0](https://github.com/tracespace/tracespace/compare/v4.0.0-next.19...v4.0.0) (2019-03-09)

**Note:** Version bump only for package tracespace





# [4.0.0-next.19](https://github.com/tracespace/tracespace/compare/v4.0.0-next.18...v4.0.0-next.19) (2019-03-09)


### Bug Fixes

* **pcb-stackup-core:** Fix defs duplication when collecting layers ([#108](https://github.com/tracespace/tracespace/issues/108)) ([e0be86e](https://github.com/tracespace/tracespace/commit/e0be86e)), closes [#85](https://github.com/tracespace/tracespace/issues/85)


### Code Refactoring

* **pcb-stackup:** Remove special handling of options.createElement ([#110](https://github.com/tracespace/tracespace/issues/110)) ([7d7fbeb](https://github.com/tracespace/tracespace/commit/7d7fbeb)), closes [#43](https://github.com/tracespace/tracespace/issues/43)


### Continuous Integration

* **travis:** Set up deployment to S3 from Travis ([#105](https://github.com/tracespace/tracespace/issues/105)) ([fc915f9](https://github.com/tracespace/tracespace/commit/fc915f9))


### Features

* Add typescript definitions to all consumable modules ([#103](https://github.com/tracespace/tracespace/issues/103)) ([bb6e8f9](https://github.com/tracespace/tracespace/commit/bb6e8f9))
* **view:** Add viewer rewrite to monorepo ([#104](https://github.com/tracespace/tracespace/issues/104)) ([4502adf](https://github.com/tracespace/tracespace/commit/4502adf))
* Update dependencies and enable Greenkeeper ([9db54cc](https://github.com/tracespace/tracespace/commit/9db54cc))


### Performance Improvements

* Align and simplify parameters, defaults, and return values ([#102](https://github.com/tracespace/tracespace/issues/102)) ([c4e3a84](https://github.com/tracespace/tracespace/commit/c4e3a84)), closes [#99](https://github.com/tracespace/tracespace/issues/99)


### BREAKING CHANGES

* **pcb-stackup:** pcb-stackup no longer tries to help if you use
options.createElement. You can still use it, but you'll have to manually
align your gerber-to-svg options with pcb-stackup's options
* **travis:** Node v6 dropped from CI testing matrix
* Parameters, defaults, and return types have changed in pcb-stackup,
pcb-stackup-core, and gerber-to-svg





# [4.0.0-next.18](https://github.com/tracespace/tracespace/compare/v4.0.0-next.17...v4.0.0-next.18) (2019-01-26)


### Bug Fixes

* **fixtures:** Replace macro multi-exposure expected render ([#101](https://github.com/tracespace/tracespace/issues/101)) ([a821588](https://github.com/tracespace/tracespace/commit/a821588))
* **gerber-to-svg:** Wrap children of <mask> nodes in a <g> ([#100](https://github.com/tracespace/tracespace/issues/100)) ([b984e32](https://github.com/tracespace/tracespace/commit/b984e32)), closes [#98](https://github.com/tracespace/tracespace/issues/98)





# [4.0.0-next.17](https://github.com/tracespace/tracespace/compare/v4.0.0-next.16...v4.0.0-next.17) (2018-12-20)


### Bug Fixes

* **parser:** Set units with M71/M72 in drill files ([#96](https://github.com/tracespace/tracespace/issues/96)) ([11066d2](https://github.com/tracespace/tracespace/commit/11066d2))





# [4.0.0-next.16](https://github.com/tracespace/tracespace/compare/v4.0.0-next.15...v4.0.0-next.16) (2018-11-26)


### Bug Fixes

* **cli:** Update CLI to be compatible with whats-that-gerber ([#94](https://github.com/tracespace/tracespace/issues/94)) ([8f5f91e](https://github.com/tracespace/tracespace/commit/8f5f91e))





# [4.0.0-next.15](https://github.com/tracespace/tracespace/compare/v4.0.0-next.14...v4.0.0-next.15) (2018-11-13)


### Features

* **whats-that-gerber:** Use collection of filenames to determine type ([#77](https://github.com/tracespace/tracespace/issues/77)) ([6919549](https://github.com/tracespace/tracespace/commit/6919549))


### BREAKING CHANGES

* **whats-that-gerber:** Output of whats-that-gerber changed from a single string to an
object keyed by the filenames passed in as an array





<a name="4.0.0-next.14"></a>
# [4.0.0-next.14](https://github.com/tracespace/tracespace/compare/v4.0.0-next.13...v4.0.0-next.14) (2018-10-13)


### Bug Fixes

* **xml-id:** Restrict characters to those valid in CSS selectors ([#88](https://github.com/tracespace/tracespace/issues/88)) ([1fe779e](https://github.com/tracespace/tracespace/commit/1fe779e)), closes [#78](https://github.com/tracespace/tracespace/issues/78)





<a name="4.0.0-next.13"></a>
# [4.0.0-next.13](https://github.com/tracespace/tracespace/compare/v4.0.0-next.12...v4.0.0-next.13) (2018-09-12)


### Bug Fixes

* Replace shortid with [@tracespace](https://github.com/tracespace)/xml-id and sanitize IDs ([#79](https://github.com/tracespace/tracespace/issues/79)) ([2cda760](https://github.com/tracespace/tracespace/commit/2cda760)), closes [#78](https://github.com/tracespace/tracespace/issues/78)


### Features

* **whats-that-gerber:** Add support for diptrace filenames ([f3d5d9a](https://github.com/tracespace/tracespace/commit/f3d5d9a))





<a name="4.0.0-next.12"></a>
# [4.0.0-next.12](https://github.com/tracespace/tracespace/compare/v4.0.0-next.11...v4.0.0-next.12) (2018-07-17)


### Bug Fixes

* **pcb-stackup:** Do not mutate layer options and keep filename ([6cbecde](https://github.com/tracespace/tracespace/commit/6cbecde))


### Code Refactoring

* **gerber-to-svg:** Remove CLI in favor of [@tracespace](https://github.com/tracespace)/cli ([50e255d](https://github.com/tracespace/tracespace/commit/50e255d))


### Features

* **cli:** Add [@tracespace](https://github.com/tracespace)/cli package ([486d6fc](https://github.com/tracespace/tracespace/commit/486d6fc)), closes [#13](https://github.com/tracespace/tracespace/issues/13)
* **whats-that-gerber:** Add support for eagle 9+ filenames ([#76](https://github.com/tracespace/tracespace/issues/76)) ([3b8f570](https://github.com/tracespace/tracespace/commit/3b8f570))


### BREAKING CHANGES

* **gerber-to-svg:** Removed gerber-to-svg (gerber2svg) CLI





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


### Bug Fixes

* **gerber-plotter:** Fix outline regression with duplicate paths([#64](https://github.com/tracespace/tracespace/issues/64)) ([23b4bcb](https://github.com/tracespace/tracespace/commit/23b4bcb))


### Features

* **fixtures:** Add usbvil and bus-pirate boards ([#65](https://github.com/tracespace/tracespace/issues/65)) ([394e130](https://github.com/tracespace/tracespace/commit/394e130))





<a name="4.0.0-next.8"></a>
# [4.0.0-next.8](https://github.com/tracespace/tracespace/compare/v4.0.0-next.7...v4.0.0-next.8) (2018-06-16)

**Note:** Version bump only for package tracespace





<a name="4.0.0-next.7"></a>
# [4.0.0-next.7](https://github.com/tracespace/tracespace/compare/v4.0.0-next.6...v4.0.0-next.7) (2018-06-16)


### Bug Fixes

* **gerber-plotter:** Fix gap fill ruining arcs (mcous/gerber-plotter[#13](https://github.com/tracespace/tracespace/issues/13)) ([6cf04b7](https://github.com/tracespace/tracespace/commit/6cf04b7))





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





<a name="4.0.0-next.4"></a>
# [4.0.0-next.4](https://github.com/tracespace/tracespace/compare/v4.0.0-next.3...v4.0.0-next.4) (2018-04-27)


### Bug Fixes

* **pcb-stackup-core:** Fix rgba to rgb+opacity conversion ([e07b4be](https://github.com/tracespace/tracespace/commit/e07b4be))


### Features

* **tracespace:** Add pcb-stackup-core@3.0.0 to monorepo ([44a24c1](https://github.com/tracespace/tracespace/commit/44a24c1))
* **fixtures:** Move common render server into fixtures module ([523f681](https://github.com/tracespace/tracespace/commit/523f681))





<a name="4.0.0-next.3"></a>
# [4.0.0-next.3](https://github.com/tracespace/tracespace/compare/v4.0.0-next.2...v4.0.0-next.3) (2018-04-18)


### Features

* **tracespace:** Add whats-that-gerber@3.0.0 to monorepo ([5d755ed](https://github.com/tracespace/tracespace/commit/5d755ed))





<a name="4.0.0-next.2"></a>
# [4.0.0-next.2](https://github.com/tracespace/tracespace/compare/v4.0.0-next.1...v4.0.0-next.2) (2018-04-17)

### Features

* **tracespace:** Add pcb-stackup@3.0.0 to monorepo ([4b08b2d](https://github.com/tracespace/tracespace/commit/4b08b2d))





<a name="4.0.0-next.1"></a>
# [4.0.0-next.1](https://github.com/tracespace/tracespace/compare/v4.0.0-next.0...v4.0.0-next.1) (2018-04-17)


### Features

* **fixtures:** Add [@tracespace](https://github.com/tracespace)/fixtures module ([526a330](https://github.com/tracespace/tracespace/commit/526a330))
