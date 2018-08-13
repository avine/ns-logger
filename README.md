# ns-logger

Logger with namespaces for node and browser

[![Build Status](https://travis-ci.org/avine/ns-logger.svg?branch=master)](https://travis-ci.org/avine/ns-logger)

## Usage

```js
import { getLogger, Severity } from './index';

// Get logger with expected severity
// (actually, `Warn` is the default value)
const logger = getLogger('FirstModule', Severity.Warn); // = 2

logger.trace('Trace NOT visible');
logger.log('Log NOT visible');
logger.warn('Warn visible');        // = [FirstModule] Warn visible
logger.error('Error visible');      // = [FirstModule] Error visible

// Make the `Log` visible
logger.level = Severity.Log;        // = 1

logger.trace('Trace NOT visible');
logger.log('Log NOW visible!');     // = [FirstModule] Log NOW visible!
logger.warn('Warn visible');        // = [FirstModule] Warn visible
logger.error('Error visible');      // = [FirstModule] Error visible

// Disable all logs
logger.level = Severity.Silent;     // = 4

logger.trace('Trace NOT visible');
logger.log('Log NOT visible');
logger.warn('Warn NOT visible');
logger.error('Error NOT visible');

const loggerAgain = getLogger('FirstModule'); // logger === loggerAgain
const logger2 = getLogger('SecondModule');    // logger !== logger2
```

## Browser

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
