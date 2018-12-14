// ===== Plugins =====

export interface IPlugins {
  renderNamespace: (severity: Severity, namespace: string) => string;
}

const plugins: IPlugins = {
  renderNamespace: (severity, namespace) => `[${namespace}]`,
};

export const definePlugin = {
  renderNamespace(plugin: IPlugins['renderNamespace']) {
    plugins.renderNamespace = plugin;
  },
};

// ===== Model =====

/**
 * Severity of the message
 */
type Severity = 'trace' | 'log' | 'warn' | 'error';

interface IConsole {
  (...args: any[]): void;
  enabled: boolean;
}

interface ILogger {
  trace: IConsole;
  log: IConsole;
  warn: IConsole;
  error: IConsole;
}

/**
 * Minimum severity level of displayed messages
 */
export enum Level { Trace, Log, Warn, Error, Silent }

// ===== Settings =====

const settings = {
  defaultLevel: Level.Warn,
  disabled: false,
};

export const setDefaultLevel = (level: Level) => { settings.defaultLevel = level; };
export const disableInProduction = () => { settings.disabled = true; };

// ===== Logger builder =====

const SEVERITIES: Severity[] = ['trace', 'log', 'warn', 'error'];

const consoleFactory = (severity: Severity, namespace: string) =>
  console[severity].bind(console, plugins.renderNamespace(severity, namespace));

function noop() {} // tslint:disable-line:no-empty

export const bindTo = { consoleFactory, noop };

const loggerBuilder = (namespace: string, level: Level) =>
  SEVERITIES.reduce((logger, severity, index) => {
    const enabled = index >= level && !settings.disabled;
    logger[severity] = enabled
      ? bindTo.consoleFactory(severity, namespace) as IConsole
      : bindTo.noop as IConsole;

    // The short way - NOT IE11 compatible
    // Object.assign(logger[severity], { get enabled() { return enabled; } });

    // The long way - IE11 compatible
    Object.defineProperty(logger[severity], 'enabled', { value: enabled, writable: false });

    return logger;
  }, {} as ILogger);

export class Logger implements ILogger {
  trace!: IConsole;
  log!: IConsole;
  warn!: IConsole;
  error!: IConsole;
  constructor(private ns: string, private lvl: Level) {
    this.level = lvl;
  }
  get namespace() {
    return this.ns;
  }
  get level() {
    return this.lvl;
  }
  set level(level: Level) {
    // Note that changing the `level` programmatically will NOT update the stored level!
    this.lvl = level;

    // The short way - NOT IE11 compatible
    // Object.assign(this, loggerBuilder(this.ns, level));

    // The long way - IE11 compatible
    const logger = loggerBuilder(this.ns, level);
    this.trace = logger.trace;
    this.log = logger.log;
    this.warn = logger.warn;
    this.error = logger.error;
  }
}

// ===== Level state =====

interface ILevelState { [namespace: string]: Level; }

export const getLevelState = (config: string) =>
  config.split(';').reduce((levelState, param) => {
    const params = param.split('=');
    const namespace = params[0].trim();
    const level = +params[1];
    // The following is like testing: `level === Level[Level[level]]`
    if (namespace && Level[level] in Level) {
      levelState[namespace] = level as Level;
    }
    return levelState;
  }, {} as ILevelState);

const getStoredLevelState = () => {
  try {
    const config = localStorage.getItem('NsLogger');
    if (config) {
      return getLevelState(config);
    }
  } catch (ignore) {} // tslint:disable-line:no-empty
  return {} as ILevelState;
};

// ===== Logger state =====

interface ILoggerState { [namespace: string]: Logger; }

// ===== Global state =====

export interface IState {
  level: ILevelState;
  logger: ILoggerState;
}

export const state: IState = {
  // Note that the stored level is only retrieved once when the script is loaded!
  // When you set `localStorage.NsLogger` from the console, you have to reload the page to reflect the changes.
  level: getStoredLevelState(),

  logger: {},
};

export const cleanState = () => {
  state.level = {};
  state.logger = {};
};

// ===== Get level =====

const getLevel = (namespace: string) => {
  let level = state.level[namespace];
  if (level === undefined) {
    const [module, feature] = namespace.split(':');
    if (feature) {
      level = state.level[`${module}:*`]; // Wildcard for all the features of a module
    }
    if (level === undefined) {
      level = state.level['*']; // Wildcard for all modules (overwrite `settings.defaultLevel`)
    }
    if (level === undefined) {
      level = settings.defaultLevel;
    }
  }
  return level;
};

// ===== Get logger =====

export const getLogger = (namespace: string) => {
  if (state.logger[namespace]) {
    return state.logger[namespace];
  }
  return state.logger[namespace] = new Logger(namespace, getLevel(namespace));
};
