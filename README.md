# readium-cfi-js

**EPUB3 CFI utility library in JavaScript**

This is a software component used by other Readium projects, see https://github.com/readium/readium-shared-js

Forked by [@evidentpoint](https://github.com/evidentpoint) to add project & packaging enhancements, including minor code changes.

## License

**BSD-3-Clause** ( http://opensource.org/licenses/BSD-3-Clause )

See [license.txt](./license.txt).


## Installation

### Using npm / yarn

`npm install @evidentpoint/readium-cfi-js` or `yarn add @evidentpoint/readium-cfi-js`

### Importing

**This library is bundled in UMD and provided as ES module source files.**

- CommonJS
```javascript
const ReadiumCFI = require('@evidentpoint/readium-cfi-js');
```

- ES Module
```javascript
import * as ReadiumCFI from '@evidentpoint/readium-cfi-js';
```

- Globally with `window.ReadiumCFI`
```html
<script src="dist/readium-cfi.umd.js"></script>
```

## Usage in non-browser environments (Node)
Currently not supported as the implementation depends on jQuery and the DOM. 

A subset of the API could work without a browser, which may be planned for a future release.

## Development

**Initial setup:**

* `npm install` (to download dependencies defined in `package.json`)

**Typical workflow:**

* Hack away! (mostly the source code in `./src` and `./spec/models` )
* `npm run build` (to update the output in the `dist`, and `lib` folder)

**Unit tests:**

* `npm run test` (Karma launcher)

Travis (Continuous Integration): https://travis-ci.com/evidentpoint/readium-cfi-js/


## Bundled output

The `dist` directory contains bundled scripts in UMD module format:

### UMD - [Universal Module Definition](https://github.com/umdjs/umd)

`readium-cfi.umd.js` (and its associated source-map file),
which aggregates all the required code (external library dependencies included, such as jQuery, etc.)

You can include this as CommonJS/AMD or with the global `ReadiumCFI`

Works best for when using _Browserify_ or _RequireJS_

## Importing as an ES Module

Include the `lib/` source tree as an import. 

There is no bundling of relative source files or external dependencies.
External dependencies are assumed to be resolved using NPM conventions.

Works best for _rollup.js_ or _webpack_
