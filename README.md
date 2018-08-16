# ns-logger

Logger with namespaces for node and browser

[![Build Status](https://travis-ci.org/avine/ns-logger.svg?branch=master)](https://travis-ci.org/avine/ns-logger)

## Usage

### Get logger

By default, only `warn` and `error` levels are logged.

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

### Change severity

The object `Severity` has the following properties:

- `Trace`  (= 0)
- `Log`    (= 1)
- `Warn`   (= 2)
- `Error`  (= 3)
- `Silent` (= 4)

You can change the logger level programmatically:

```js
import { getLogger, Severity } from 'ns-logger';

const logger = getLogger('MyNamespace');

logger.level = Severity.Log; // Using Severity object

logger.trace('Trace hidden');
logger.log('Now Log visible!');
logger.warn('Warn visible');
logger.error('Error visible');

logger.level = 4; // Using number

logger.trace('Trace hidden...');
logger.log('Log hidden...');
logger.warn('Warn hidden...');
logger.error('Error hidden...');
```

*Console output:*

```console
[MyNamespace] Now Log visible!
[MyNamespace] Warn visible
[MyNamespace] Error visible
```

### Change default severity

`NsLogger` keeps track of instantiated loggers.
Existing loggers are NOT affected by new default severity settings.
Only fresh created loggers are affected.

```js
import { getLogger, setDefaultSeverity, Severity } from 'ns-logger';

const a = getLogger('NamespaceA'); // a.level === Severity.Warn

setDefaultSeverity(Severity.Log);

const b = getLogger('NamespaceB'); // b.level === Severity.Log

setDefaultSeverity(Severity.Error);

const aCopy = getLogger('NamespaceA'); // a.level is still Severity.Warn
const bCopy = getLogger('NamespaceB'); // b.level is still Severity.Log
const c = getLogger('NamespaceC'); // Only c.level is Severity.Error

aCopy.warn('aCopy === a ?', aCopy === a);
bCopy.warn('bCopy === b ?', bCopy === b);

a.warn('NamespaceA level:', a.level);
b.log('NamespaceB level:', b.level);
c.error('NamespaceC level:', c.level);
```

*Console output:*

```console
[NamespaceA] aCopy === a ? true
[NamespaceB] bCopy === b ? true
[NamespaceA] level: 3
[NamespaceB] level: 2
[NamespaceC] level: 4
```

### Configure severity from state

The namespace follows the pattern `[Module]:[Feature]`.
You can use the symbol `*` as a wildcard to target all the features of a module like this: `[Module]:*`.
In the same way, you can use `*` to target all modules and features (this is like overwriting the default serevity globally).

```js
import { getLogger, state } from 'ns-logger';

state.severity = {
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

### Configure severity using `localStorage`

In the brower, you can manage the `state.severity` from the `localStorage`.

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
  logger.warn('Cool!');
</script>
```

You can also import the package in your code and bundle your application with `webpack` for example or any other bundler of your choice.

```js
import { getLogger } from 'ns-logger';

// Your code...
```

## Contribute

```bash
git clone https://github.com/avine/ns-logger.git

cd ./ns-logger

npm install

npm run all # npm run lint && npm test && npm run build

npm start # this will launch a demo in your favorite browser
```

## License

MIT @ [Avine](https://avine.io)
