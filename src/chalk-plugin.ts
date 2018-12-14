import Chalk from 'chalk';
import { definePlugin } from '.';

// Use Chalk to style the namespace depending on severity
//
// Usage (for Node only):
// ----------------------
//    import 'ns-logger/chalk-plugin';
//    import { getLogger } from 'ns-logger';
//
//    const logger = getLogger('MyNamespace');
//
//    /*
//     * The following line will output: "[MyNamespace] Message..."
//     * with a red color for "[MyNamespace]" part.
//     */
//    logger.error('Message...');

definePlugin.renderNamespace((severity, namespace) => {
  const ns = `[${namespace}]`;
  switch (severity) {
    case 'trace': return ns;
    case 'log': return Chalk.blue(ns);
    case 'warn': return Chalk.yellow(ns);
    case 'error': return Chalk.red(ns);
  }
});
