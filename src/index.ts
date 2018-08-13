// ===== Model =====

type LogLevel = 'trace' | 'log' | 'warn' | 'error';

type LogFn = (...args: any[]) => void;

interface ILogger {
  trace: LogFn;
  log: LogFn;
  warn: LogFn;
  error: LogFn;
}

export enum Severity { Trace, Log, Warn, Error, Silent }

// ===== Logger builder =====

const LOG_LEVELS: LogLevel[] = ['trace', 'log', 'warn', 'error'];

export const bindTo = {
  console: (level: LogLevel, namespace: string) => console[level].bind(console, `[${namespace}]`),
  noop: function noop() {}, // tslint:disable-line:no-empty
};

const loggerBuilder = (namespace: string, severity: Severity) =>
  LOG_LEVELS.reduce((logger, level, index) => {
    logger[level] = index >= severity ? bindTo.console(level, namespace) : bindTo.noop;
    return logger;
  }, {} as ILogger);

export class Logger implements ILogger {
  trace!: LogFn;
  log!: LogFn;
  warn!: LogFn;
  error!: LogFn;
  constructor(private namespace: string, private severity: Severity) {
    this.level = severity;
  }
  get name() {
    return this.namespace;
  }
  get level() {
    return this.severity;
  }
  set level(severity: Severity) {
    // Note that changing the `severity` programmatically will NOT update the stored severity!
    this.severity = severity;
    Object.assign(this, loggerBuilder(this.namespace, severity));
  }
}

// ===== Severity state =====

interface ISeverityState { [namespace: string]: Severity; }

export const getSeverityState = (config: string) =>
  config.split(';').reduce((state, param) => {
    const params = param.split('=');
    const namespace = params[0].trim();
    const severity = +(params[1] || '').trim();
    // The following is like testing: `severity === Severity[Severity[severity]]`
    if (namespace && Severity[severity] in Severity) {
      state[namespace] = severity as Severity;
    }
    return state;
  }, {} as ISeverityState);

const getStoredSeverityState = () => {
  try {
    return getSeverityState(localStorage.getItem('NsLogger') || '');
  } catch (e) {
    return {} as ISeverityState;
  }
};

// Note that the stored severity is only retrieved once when the script is loaded!
// When you set `localStorage.NsLogger` from the console, you have to reload the page to reflect the changes.
export const severityState = getStoredSeverityState();

// ===== Logger state =====

interface ILoggerState { [namespace: string]: Logger; }

export const loggerState: ILoggerState = {};

// ===== Clean states =====

export const cleanStates = () => [
  severityState,
  loggerState,
].forEach((state) => Object.keys(state).forEach((namespace) => delete state[namespace]));

// ===== Logger =====

const DEF_SEVERITY = Severity.Warn;

export const getLogger = (namespace: string, severity: Severity = DEF_SEVERITY) => {
  if (loggerState[namespace]) {
    return loggerState[namespace];
  }
  let s = severityState[namespace];
  if (s === undefined) {
    const [module, feature] = namespace.split(':');
    if (feature) {
      s = severityState[`${module}:*`]; // Wildcard for all the features of a module
    }
    if (s === undefined) {
      s = severityState['*']; // Wildcard for all modules (overwrite `DEF_SEVERITY`)
    }
  }
  return loggerState[namespace] = new Logger(namespace, s !== undefined ? s : severity);
};
