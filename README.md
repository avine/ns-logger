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

// loggerAgain === logger
const loggerAgain = getLogger('FirstModule');

// logger2 !== logger
const logger2 = getLogger('SecondModule');
```
