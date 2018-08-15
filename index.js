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
// ===== Settings =====
const settings = {
    defaultSeverity: Severity.Warn,
    disabled: false,
};
exports.setDefaultSeverity = (severity) => { settings.defaultSeverity = severity; };
exports.disableInProduction = () => { settings.disabled = true; };
// ===== Logger builder =====
const LOG_LEVELS = ['trace', 'log', 'warn', 'error'];
exports.bindTo = {
    console: (level, namespace) => console[level].bind(console, `[${namespace}]`),
    noop: function noop() { },
};
const loggerBuilder = (namespace, severity) => LOG_LEVELS.reduce((logger, level, index) => {
    logger[level] = index >= severity && !settings.disabled ? exports.bindTo.console(level, namespace) : exports.bindTo.noop;
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
        // Note that changing the `severity` programmatically will NOT update the stored severity!
        this.severity = severity;
        Object.assign(this, loggerBuilder(this.namespace, severity));
    }
}
exports.Logger = Logger;
exports.getSeverityState = (config) => config.split(';').reduce((severityState, param) => {
    const params = param.split('=');
    const namespace = params[0].trim();
    const severity = +params[1];
    // The following is like testing: `severity === Severity[Severity[severity]]`
    if (namespace && Severity[severity] in Severity) {
        severityState[namespace] = severity;
    }
    return severityState;
}, {});
const getStoredSeverityState = () => {
    try {
        const config = localStorage.getItem('NsLogger');
        if (config) {
            return exports.getSeverityState(config);
        }
    }
    catch (ignore) { } // tslint:disable-line:no-empty
    return {};
};
exports.state = {
    // Note that the stored severity is only retrieved once when the script is loaded!
    // When you set `localStorage.NsLogger` from the console, you have to reload the page to reflect the changes.
    severity: getStoredSeverityState(),
    logger: {},
};
exports.cleanState = () => {
    exports.state.severity = {};
    exports.state.logger = {};
};
// ===== Get severity =====
const getSeverity = (namespace) => {
    let severity = exports.state.severity[namespace];
    if (severity === undefined) {
        const [module, feature] = namespace.split(':');
        if (feature) {
            severity = exports.state.severity[`${module}:*`]; // Wildcard for all the features of a module
        }
        if (severity === undefined) {
            severity = exports.state.severity['*']; // Wildcard for all modules (overwrite `settings.defaultSeverity`)
        }
        if (severity === undefined) {
            severity = settings.defaultSeverity;
        }
    }
    return severity;
};
// ===== Get logger =====
exports.getLogger = (namespace) => {
    if (exports.state.logger[namespace]) {
        return exports.state.logger[namespace];
    }
    return exports.state.logger[namespace] = new Logger(namespace, getSeverity(namespace));
};
