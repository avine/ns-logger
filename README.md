# ns-logger

Logger with namespace support for node and browser

[![Build Status](https://travis-ci.org/avine/ns-logger.svg?branch=master)](https://travis-ci.org/avine/ns-logger)

## Usage

### Get logger

By default, only `warn` and `error` severity levels are displayed in the console.

```js
import { getLogger } from 'ns-logger';

const logger = getLogger('MyNamespace');

logger.trace('Trace hidden');
logger.log('Log hidden');
logger.warn('Warn visible');
logger.error('Error visible');
```

*Console output:*

```console
[MyNamespace] Warn visible
[MyNamespace] Error visible
```

### Check whether a level is enabled

By checking the `enabled` readonly property, you can determine whether or not a level is enabled.

```js
import { getLogger } from 'ns-logger';

const logger = getLogger('MyNamespace');

console.log('Trace:', logger.trace.enabled);
console.log('Log:', logger.log.enabled);
console.log('Warn:', logger.warn.enabled);
console.log('Error:', logger.error.enabled);
```

*Console output:*

```console
Trace: false
Log: false
Warn: true
Error: true
```

### Change displayed levels

You can change the level programmatically using the `Level` enum:

- `Trace`  (= 0)
- `Log`    (= 1)
- `Warn`   (= 2)
- `Error`  (= 3)
- `Silent` (= 4)

```js
import { getLogger, Level } from 'ns-logger';

const logger = getLogger('MyNamespace');

logger.level = Level.Log; // Using Level enum

logger.trace('Trace hidden');
logger.log('Log NOW visible!');
logger.warn('Warn visible');
logger.error('Error visible');

logger.level = 4; // Using literal number

logger.trace('Trace hidden...');
logger.log('Log hidden...');
logger.warn('Warn hidden...');
logger.error('Error hidden...');
```

*Console output:*

```console
[MyNamespace] Log NOW visible!
[MyNamespace] Warn visible
[MyNamespace] Error visible
```

### Change default level

`NsLogger` keeps track of instantiated loggers.
Existing loggers are NOT affected by new default level settings.
Only fresh created loggers are affected.

```js
import { getLogger, setDefaultLevel, Level } from 'ns-logger';

const a = getLogger('NamespaceA'); // a.level === Level.Warn

setDefaultLevel(Level.Log);

const b = getLogger('NamespaceB'); // b.level === Level.Log

setDefaultLevel(Level.Error);

const aAlias = getLogger('NamespaceA'); // a.level is still Level.Warn
const bAlias = getLogger('NamespaceB'); // b.level is still Level.Log
const c = getLogger('NamespaceC'); // Only c.level is Level.Error

aAlias.warn('aAlias === a ?', aAlias === a);
bAlias.warn('bAlias === b ?', bAlias === b);

a.warn('level:', a.level);
b.log('level:', b.level);
c.error('level:', c.level);
```

*Console output:*

```console
[NamespaceA] aAlias === a ? true
[NamespaceB] bAlias === b ? true
[NamespaceA] level: 2
[NamespaceB] level: 1
[NamespaceC] level: 3
```

### Configure level from state

The namespace follows the pattern `[Module]:[Feature]`.
You can use the symbol `*` as a wildcard to target all the features of a module like this: `[Module]:*`.
In the same way, you can use `*` to target all modules and features (this is like overwriting the default level globally).

```js
import { getLogger, state } from 'ns-logger';

state.level = {
  'ModuleA:Feature1': 0,
  'ModuleA:Feature2': 1,
  'ModuleA:*': 2, // Wildcard for all the features of a module
  'ModuleB': 3,
  '*': 4, // Wildcard for all modules
};

console.log(
  getLogger('ModuleA:Feature1').level,
  getLogger('ModuleA:Feature2').level,
  getLogger('ModuleA:Feature3').level,
  getLogger('ModuleB').level,
  getLogger('ModuleC').level,
);
```

*Console output:*

```console
0 1 2 3 4
```

### Configure level using `localStorage`

In the brower, you can manage the `state.level` from the `localStorage`.

To get the same result as above, just enter the following line in the browser console and reload the page:

```console
localStorage.NsLogger = 'ModuleA:Feature1 = 0; ModuleA:Feature2 = 1; ModuleA:* = 2; ModuleB = 3; * = 4;';
```

## Browser support

`NsLogger` supports all major browsers (including IE11).

You can use the script
[https://unpkg.com/@avine/ns-logger/ns-logger.js](https://unpkg.com/@avine/ns-logger/ns-logger.js)
that exposes the package as the global variable `NsLogger`.

```html
<script src="https://unpkg.com/@avine/ns-logger/ns-logger.js"></script>

<script>
  const logger = NsLogger.getLogger('MyNamespace');
  logger.warn('Cool!'); // [MyNamespace] Cool!
</script>
```

You can also import the package in your code and bundle your application with `webpack` for example or any other bundler of your choice.

```js
import { getLogger } from 'ns-logger';

// Your code...
```

For a live preview, check out this [demo](https://avine.github.io/ns-logger/) in your favorite browser.

## Plugins

### Chalk-plugin

This plugin uses [Chalk](https://www.npmjs.com/package/chalk) to style the namespace depending on severity.

```js
import 'ns-logger/chalk-plugin';
import { getLogger } from 'ns-logger';

const logger = getLogger('MyNamespace');
logger.error('Message...');
```

*Console output:*

```console
[MyNamespace] Message...
```

The string `[MyNamespace]` will appear in red color in the console.

## Contribute

`NsLogger` is written in TypeScript, and that's the fun part.

```bash
git clone https://github.com/avine/ns-logger.git

cd ./ns-logger

npm install

npm run all # npm run lint && npm test && npm run build

npm start # this will launch a demo in your favorite browser
```

## License

MIT @ [Avine](https://avine.io)
