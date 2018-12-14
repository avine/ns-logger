"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var _1 = require(".");
_1.inject.namespace(function (severity, namespace) {
    var ns = "[" + namespace + "]";
    switch (severity) {
        case 'trace': return ns;
        case 'log': return chalk_1.default.blue(ns);
        case 'warn': return chalk_1.default.yellow(ns);
        case 'error': return chalk_1.default.red(ns);
    }
});
