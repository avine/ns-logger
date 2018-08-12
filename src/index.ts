// ===== Model =====

type LogLevel = 'trace' | 'log' | 'warn' | 'error';

type LogFn = (...args: any[]) => string;

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
    // Note that changing the `severity` programmatically will NOT update the persisted severity!
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

const getPersistedSeverityState = () => {
  try {
    return getSeverityState(sessionStorage.getItem('Logger') || '');
  } catch (e) {
    return {} as ISeverityState;
  }
};

// Note that the persisted severity is only evaluated once when the script is loaded!
// When you set the `sessionStorage` from the console, you have to reload the page to reflect the changes.
export const severityState = getPersistedSeverityState();

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
  let ps = severityState[namespace];
  if (ps === undefined) {
    const [module, feature] = namespace.split(':');
    if (feature) {
      ps = severityState[`${module}:*`]; // Wildcard for module's features
    }
    if (ps === undefined) {
      ps = severityState['*']; // Wildcard for all modules
    }
  }
  return loggerState[namespace] = new Logger(namespace, ps !== undefined ? ps : severity);
};
