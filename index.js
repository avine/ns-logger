"use strict";
// ===== Model =====
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Minimum level of displayed messages
 */
var Level;
(function (Level) {
    Level[Level["Trace"] = 0] = "Trace";
    Level[Level["Log"] = 1] = "Log";
    Level[Level["Warn"] = 2] = "Warn";
    Level[Level["Error"] = 3] = "Error";
    Level[Level["Silent"] = 4] = "Silent";
})(Level = exports.Level || (exports.Level = {}));
// ===== Settings =====
var settings = {
    defaultLevel: Level.Warn,
    disabled: false,
};
exports.setDefaultLevel = function (level) { settings.defaultLevel = level; };
exports.disableInProduction = function () { settings.disabled = true; };
// ===== Logger builder =====
var SEVERITIES = ['trace', 'log', 'warn', 'error'];
exports.bindTo = {
    console: function (severity, namespace) { return console[severity].bind(console, "[" + namespace + "]"); },
    noop: function noop() { },
};
var loggerBuilder = function (namespace, level) {
    return SEVERITIES.reduce(function (logger, severity, index) {
        var enabled = index >= level && !settings.disabled;
        logger[severity] = enabled ? exports.bindTo.console(severity, namespace) : exports.bindTo.noop;
        Object.defineProperty(logger[severity], 'enabled', { value: enabled, writable: false });
        return logger;
    }, {});
};
var Logger = /** @class */ (function () {
    function Logger(ns, lvl) {
        this.ns = ns;
        this.lvl = lvl;
        this.level = lvl;
    }
    Object.defineProperty(Logger.prototype, "namespace", {
        get: function () {
            return this.ns;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Logger.prototype, "level", {
        get: function () {
            return this.lvl;
        },
        set: function (level) {
            // Note that changing the `level` programmatically will NOT update the stored level!
            this.lvl = level;
            // The short way - NOT IE11 compatible
            // Object.assign(this, loggerBuilder(this.ns, level));
            // The long way - IE11 compatible
            var logger = loggerBuilder(this.ns, level);
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
exports.getLevelState = function (config) {
    return config.split(';').reduce(function (levelState, param) {
        var params = param.split('=');
        var namespace = params[0].trim();
        var level = +params[1];
        // The following is like testing: `level === Level[Level[level]]`
        if (namespace && Level[level] in Level) {
            levelState[namespace] = level;
        }
        return levelState;
    }, {});
};
var getStoredLevelState = function () {
    try {
        var config = localStorage.getItem('NsLogger');
        if (config) {
            return exports.getLevelState(config);
        }
    }
    catch (ignore) { } // tslint:disable-line:no-empty
    return {};
};
exports.state = {
    // Note that the stored level is only retrieved once when the script is loaded!
    // When you set `localStorage.NsLogger` from the console, you have to reload the page to reflect the changes.
    level: getStoredLevelState(),
    logger: {},
};
exports.cleanState = function () {
    exports.state.level = {};
    exports.state.logger = {};
};
// ===== Get level =====
var getLevel = function (namespace) {
    var level = exports.state.level[namespace];
    if (level === undefined) {
        var _a = namespace.split(':'), module = _a[0], feature = _a[1];
        if (feature) {
            level = exports.state.level[module + ":*"]; // Wildcard for all the features of a module
        }
        if (level === undefined) {
            level = exports.state.level['*']; // Wildcard for all modules (overwrite `settings.defaultLevel`)
        }
        if (level === undefined) {
            level = settings.defaultLevel;
        }
    }
    return level;
};
// ===== Get logger =====
exports.getLogger = function (namespace) {
    if (exports.state.logger[namespace]) {
        return exports.state.logger[namespace];
    }
    return exports.state.logger[namespace] = new Logger(namespace, getLevel(namespace));
};
