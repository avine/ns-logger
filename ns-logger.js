// Export NsLogger in global Browser window
((exports) => {
  "use strict";
  // ===== Model =====
  Object.defineProperty(exports, "__esModule", { value: true });
  var Severity;
  (function (Severity) {
    Severity[Severity["Trace"] = 0] = "Trace";
    Severity[Severity["Log"] = 1] = "Log";
    Severity[Severity["Warn"] = 2] = "Warn";
    Severity[Severity["Error"] = 3] = "Error";
    Severity[Severity["Silent"] = 4] = "Silent";
  })(Severity = exports.Severity || (exports.Severity = {}));
  // ===== Logger builder =====
  const LOG_LEVELS = ['trace', 'log', 'warn', 'error'];
  exports.bindTo = {
    console: (level, namespace) => console[level].bind(console, `[${namespace}]`),
    noop: function noop() { },
  };
  const loggerBuilder = (namespace, severity) => LOG_LEVELS.reduce((logger, level, index) => {
    logger[level] = index >= severity ? exports.bindTo.console(level, namespace) : exports.bindTo.noop;
    return logger;
  }, {});
  class Logger {
    constructor(namespace, severity) {
      this.namespace = namespace;
      this.severity = severity;
      this.level = severity;
    }
    get name() {
      return this.namespace;
    }
    get level() {
      return this.severity;
    }
    set level(severity) {
      // Note that changing the `severity` programmatically will NOT update the persisted severity!
      this.severity = severity;
      Object.assign(this, loggerBuilder(this.namespace, severity));
    }
  }
  exports.Logger = Logger;
  exports.getSeverityState = (config) => config.split(';').reduce((state, param) => {
    const params = param.split('=');
    const namespace = params[0].trim();
    const severity = +(params[1] || '').trim();
    // The following is like testing: `severity === Severity[Severity[severity]]`
    if (namespace && Severity[severity] in Severity) {
      state[namespace] = severity;
    }
    return state;
  }, {});
  const getPersistedSeverityState = () => {
    try {
      return exports.getSeverityState(sessionStorage.getItem('Logger') || '');
    }
    catch (e) {
      return {};
    }
  };
  // Note that the persisted severity is only evaluated once when the script is loaded!
  // When you set the `sessionStorage` from the console, you have to reload the page to reflect the changes.
  exports.severityState = getPersistedSeverityState();
  exports.loggerState = {};
  // ===== Clean states =====
  exports.cleanStates = () => [
    exports.severityState,
    exports.loggerState,
  ].forEach((state) => Object.keys(state).forEach((namespace) => delete state[namespace]));
  // ===== Logger =====
  const DEF_SEVERITY = Severity.Warn;
  exports.getLogger = (namespace, severity = DEF_SEVERITY) => {
    if (exports.loggerState[namespace]) {
      return exports.loggerState[namespace];
    }
    let ps = exports.severityState[namespace];
    if (ps === undefined) {
      const [module, feature] = namespace.split(':');
      if (feature) {
        ps = exports.severityState[`${module}:*`]; // Wildcard for module's features
      }
      if (ps === undefined) {
        ps = exports.severityState['*']; // Wildcard for all modules
      }
    }
    return exports.loggerState[namespace] = new Logger(namespace, ps !== undefined ? ps : severity);
  };
})(this.NsLogger = this.NsLogger || {});
