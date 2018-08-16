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

// ===== Settings =====

const settings = {
  defaultSeverity: Severity.Warn,
  disabled: false,
};

export const setDefaultSeverity = (severity: Severity) => { settings.defaultSeverity = severity; };
export const disableInProduction = () => { settings.disabled = true; };

// ===== Logger builder =====

const LOG_LEVELS: LogLevel[] = ['trace', 'log', 'warn', 'error'];

export const bindTo = {
  console: (level: LogLevel, namespace: string) => console[level].bind(console, `[${namespace}]`),
  noop: function noop() {}, // tslint:disable-line:no-empty
};

const loggerBuilder = (namespace: string, severity: Severity) =>
  LOG_LEVELS.reduce((logger, level, index) => {
    logger[level] = index >= severity && !settings.disabled ? bindTo.console(level, namespace) : bindTo.noop;
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

    // The short way - NOT IE11 compatible
    // Object.assign(this, loggerBuilder(this.namespace, severity));

    // The long way - IE11 compatible
    const logger = loggerBuilder(this.namespace, severity);
    this.trace = logger.trace;
    this.log = logger.log;
    this.warn = logger.warn;
    this.error = logger.error;
  }
}

// ===== Severity state =====

interface ISeverityState { [namespace: string]: Severity; }

export const getSeverityState = (config: string) =>
  config.split(';').reduce((severityState, param) => {
    const params = param.split('=');
    const namespace = params[0].trim();
    const severity = +params[1];
    // The following is like testing: `severity === Severity[Severity[severity]]`
    if (namespace && Severity[severity] in Severity) {
      severityState[namespace] = severity as Severity;
    }
    return severityState;
  }, {} as ISeverityState);

const getStoredSeverityState = () => {
  try {
    const config = localStorage.getItem('NsLogger');
    if (config) {
      return getSeverityState(config);
    }
  } catch (ignore) {} // tslint:disable-line:no-empty
  return {} as ISeverityState;
};

// ===== Logger state =====

interface ILoggerState { [namespace: string]: Logger; }

// ===== Global state =====

export interface IState {
  severity: ISeverityState;
  logger: ILoggerState;
}

export const state: IState = {
  // Note that the stored severity is only retrieved once when the script is loaded!
  // When you set `localStorage.NsLogger` from the console, you have to reload the page to reflect the changes.
  severity: getStoredSeverityState(),

  logger: {},
};

export const cleanState = () => {
  state.severity = {};
  state.logger = {};
};

// ===== Get severity =====

const getSeverity = (namespace: string) => {
  let severity = state.severity[namespace];
  if (severity === undefined) {
    const [module, feature] = namespace.split(':');
    if (feature) {
      severity = state.severity[`${module}:*`]; // Wildcard for all the features of a module
    }
    if (severity === undefined) {
      severity = state.severity['*']; // Wildcard for all modules (overwrite `settings.defaultSeverity`)
    }
    if (severity === undefined) {
      severity = settings.defaultSeverity;
    }
  }
  return severity;
};

// ===== Get logger =====

export const getLogger = (namespace: string) => {
  if (state.logger[namespace]) {
    return state.logger[namespace];
  }
  return state.logger[namespace] = new Logger(namespace, getSeverity(namespace));
};
