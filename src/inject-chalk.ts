import Chalk from 'chalk';
import { inject } from '.';

inject.namespace((severity, namespace) => {
  const ns = `[${namespace}]`;
  switch (severity) {
    case 'trace': return ns;
    case 'log': return Chalk.blue(ns);
    case 'warn': return Chalk.yellow(ns);
    case 'error': return Chalk.red(ns);
  }
});
