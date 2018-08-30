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
var settings = {
    defaultSeverity: Severity.Warn,
    disabled: false,
};
exports.setDefaultSeverity = function (severity) { settings.defaultSeverity = severity; };
exports.disableInProduction = function () { settings.disabled = true; };
// ===== Logger builder =====
var LOG_LEVELS = ['trace', 'log', 'warn', 'error'];
exports.bindTo = {
    console: function (level, namespace) { return console[level].bind(console, "[" + namespace + "]"); },
    noop: function noop() { },
};
var loggerBuilder = function (namespace, severity) {
    return LOG_LEVELS.reduce(function (logger, level, index) {
        var enabled = index >= severity && !settings.disabled;
        logger[level] = enabled ? exports.bindTo.console(level, namespace) : exports.bindTo.noop;
        Object.defineProperty(logger[level], 'enabled', { value: enabled, writable: false });
        return logger;
    }, {});
};
var Logger = /** @class */ (function () {
    function Logger(namespace, severity) {
        this.namespace = namespace;
        this.severity = severity;
        this.level = severity;
    }
    Object.defineProperty(Logger.prototype, "name", {
        get: function () {
            return this.namespace;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Logger.prototype, "level", {
        get: function () {
            return this.severity;
        },
        set: function (severity) {
            // Note that changing the `severity` programmatically will NOT update the stored severity!
            this.severity = severity;
            // The short way - NOT IE11 compatible
            // Object.assign(this, loggerBuilder(this.namespace, severity));
            // The long way - IE11 compatible
            var logger = loggerBuilder(this.namespace, severity);
            this.trace = logger.trace;
            this.log = logger.log;
            this.warn = logger.warn;
            this.error = logger.error;
        },
        enumerable: true,
        configurable: true
    });
    return Logger;
}());
exports.Logger = Logger;
exports.getSeverityState = function (config) {
    return config.split(';').reduce(function (severityState, param) {
        var params = param.split('=');
        var namespace = params[0].trim();
        var severity = +params[1];
        // The following is like testing: `severity === Severity[Severity[severity]]`
        if (namespace && Severity[severity] in Severity) {
            severityState[namespace] = severity;
        }
        return severityState;
    }, {});
};
var getStoredSeverityState = function () {
    try {
        var config = localStorage.getItem('NsLogger');
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
exports.cleanState = function () {
    exports.state.severity = {};
    exports.state.logger = {};
};
// ===== Get severity =====
var getSeverity = function (namespace) {
    var severity = exports.state.severity[namespace];
    if (severity === undefined) {
        var _a = namespace.split(':'), module = _a[0], feature = _a[1];
        if (feature) {
            severity = exports.state.severity[module + ":*"]; // Wildcard for all the features of a module
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
exports.getLogger = function (namespace) {
    if (exports.state.logger[namespace]) {
        return exports.state.logger[namespace];
    }
    return exports.state.logger[namespace] = new Logger(namespace, getSeverity(namespace));
};
