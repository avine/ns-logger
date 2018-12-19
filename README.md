# ns-logger

Logger with namespace support for node and browser

[![Build Status](https://travis-ci.org/avine/ns-logger.svg?branch=master)](https://travis-ci.org/avine/ns-logger)

## Usage

### Get logger

By default, only `warn` and `error` severity levels are displayed in the console.

```js
import { getLogger } from '@avine/ns-logger';

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

As you can see, the logs are prefixed by the namespace.

### Check enabled severity levels

Determine whether a severity level is enabled, by checking the `enabled` readonly property.

```js
import { getLogger } from '@avine/ns-logger';

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

### Change severity level of logger instance

To change the severity level of logger instance programmatically, set its `level` property using the `Level` enum:

```ts
export enum Level {
  Trace,  // (= 0)
  Log,    // (= 1)
  Warn,   // (= 2)
  Error,  // (= 3)
  Silent  // (= 4)
}
```

Here's how to use it:

```js
import { getLogger, Level } from '@avine/ns-logger';

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

### Change default severity level

`NsLogger` keeps track of instantiated loggers.
Existing loggers are NOT affected by new default level setting.
Only fresh created loggers are affected.

```js
import { getLogger, setDefaultLevel, Level } from '@avine/ns-logger';

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

### Configure severity level of loggers from `state` object

To configure the severity level of loggers to be instantiated in a declarative way, use the `state.level` object.

```ts
interface ILevelState {
  [namespace: string]: Level;
}
```

The namespace key has the following pattern `[Module]:[Feature]`.

You can use the symbol `*` as a wildcard to target all features of a module like this: `[Module]:*`.

In the same way, you can use this symbol to target all modules and features (this is like overwriting the default severity level declaratively).

```js
import { getLogger, state } from '@avine/ns-logger';

state.level = {
  'ModuleA:Feature1': 0,
  'ModuleA:Feature2': 1,
  'ModuleA:*': 2, // Wildcard for all features of a module
  'ModuleB': 3,
  '*': 4, // Wildcard for all modules and features
};

console.log(
  getLogger('ModuleA:Feature1').level,
  getLogger('ModuleA:Feature2').level,
  getLogger('ModuleA:Feature3').level, // Matches 'ModuleA:*'
  getLogger('ModuleB').level,
  getLogger('ModuleC').level, // Matches '*'
);
```

*Console output:*

```console
0 1 2 3 4
```

### Configure severity level of loggers from `localStorage`

In the brower, you can set the `state.level` object using `localStorage.NsLogger`.

The `NsLogger` property has following pattern: `[Module]:[Feature] = [Level]; ...`

To get the same result as above, enter the following line in the browser console and reload the page:

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
import { getLogger } from '@avine/ns-logger';

// Your code...
```

For a live preview, check out this [demo](https://avine.github.io/ns-logger/) in your favorite browser.

## Plugins

### Chalk-plugin

This plugin is designed for use in node (not  in the browser) and uses
[Chalk](https://www.npmjs.com/package/chalk)
package to style the logs prefix depending on the severity level.

```js
import '@avine/ns-logger/chalk-plugin';
import { getLogger } from '@avine/ns-logger';

const logger = getLogger('MyNamespace');
logger.error('Message...');
```

*Console output:*

```console
[MyNamespace] Message...
```

The string `[MyNamespace]` will appear in red color in the console (trust me :-).

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
