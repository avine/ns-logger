# ns-logger

Logger with namespaces for node and browser

[![Build Status](https://travis-ci.org/avine/ns-logger.svg?branch=master)](https://travis-ci.org/avine/ns-logger)

## Usage

### Get logger and change its severity

```js
import { getLogger, Severity } from 'ns-logger';

// Get logger (default severity is `Severity.Warn`)
const logger = getLogger('FirstModule');

logger.trace('Trace NOT visible');
logger.log('Log NOT visible');
logger.warn('Warn visible');        // = [FirstModule] Warn visible
logger.error('Error visible');      // = [FirstModule] Error visible

// Make the `.log()` visible
logger.level = Severity.Log;        // = 1

logger.trace('Trace NOT visible');
logger.log('Log NOW visible!');     // = [FirstModule] Log NOW visible!
logger.warn('Warn visible');        // = [FirstModule] Warn visible
logger.error('Error visible');      // = [FirstModule] Error visible

// Make all logs NOT visible
logger.level = Severity.Silent;     // = 4

logger.trace('Trace NOT visible');
logger.log('Log NOT visible');
logger.warn('Warn NOT visible');
logger.error('Error NOT visible');
```

### Change default severity for newly created logger

```js
import { getLogger, Severity } from 'ns-logger';

const a = getLogger('NamespaceA');

setDefaultSeverity(Severity.Log);
const b = getLogger('NamespaceB');

// a.level === Severity.Warn
// b.level === Severity.Log

setDefaultSeverity(Severity.Error);
const aCopy = getLogger('NamespaceA');
const bCopy = getLogger('NamespaceB');
const c = getLogger('NamespaceC');

// Loggers that already exists are NOT affected by the new default severity settings.
// aCopy.level === Severity.Warn
// bCopy.level === Severity.Log

// Only newly created logger are affected by the new default severity settings.
// c.level === Severity.Error
```

### Configure severity from state

```js
import { getLogger, Severity, state } from 'ns-logger';

state.severity = {
  'ModuleA:Feature1': 0,
  'ModuleA:Feature2': 1,
  'ModuleA:*': 2, // Wildcard for all the features of a module
  'ModuleB': 3,
  '*': 4, // Wildcard for all modules
};

getLogger('ModuleA:Feature1').level // === 0;
getLogger('ModuleA:Feature2').level // === 1;
getLogger('ModuleA:Feature3').level // === 2;
getLogger('ModuleB').level          // === 3;
getLogger('ModuleC').level          // === 4;
```

## Browser

### Configure severity from the console using `localStorage`

Just enter the following in the browser console and reload the page.

```console
localStorage.NsLogger = 'ModuleA:Feature1 = 0; ModuleA:Feature2 = 1; ModuleA:* = 2; ModuleB = 3; * = 4;';
```

You can use the script
[https://unpkg.com/@avine/ns-logger/ns-logger.js](https://unpkg.com/@avine/ns-logger/ns-logger.js)
that exposes the package as the global variable `NsLogger`.

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>NsLogger</title>
    <script src="https://unpkg.com/@avine/ns-logger/ns-logger.js" type="text/javascript"></script>
  </head>

  <body>
    <p>Open the console to see the logs</p>

    <script>
      const logger = NsLogger.getLogger('MyModule');
      logger.error('Oups!');
    </script>
  </body>
</html>
```
