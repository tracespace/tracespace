# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
