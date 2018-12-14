"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var _1 = require(".");
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
_1.definePlugin.renderNamespace(function (severity, namespace) {
    var ns = "[" + namespace + "]";
    switch (severity) {
        case 'trace': return ns;
        case 'log': return chalk_1.default.blue(ns);
        case 'warn': return chalk_1.default.yellow(ns);
        case 'error': return chalk_1.default.red(ns);
    }
});
