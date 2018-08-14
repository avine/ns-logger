declare type LogLevel = 'trace' | 'log' | 'warn' | 'error';
declare type LogFn = (...args: any[]) => void;
interface ILogger {
    trace: LogFn;
    log: LogFn;
    warn: LogFn;
    error: LogFn;
}
export declare enum Severity {
    Trace = 0,
    Log = 1,
    Warn = 2,
    Error = 3,
    Silent = 4
}
export declare const setDefaultSeverity: (severity: Severity) => void;
export declare const disableForProduction: () => void;
export declare const bindTo: {
    console: (level: LogLevel, namespace: string) => any;
    noop: () => void;
};
export declare class Logger implements ILogger {
    private namespace;
    private severity;
    trace: LogFn;
    log: LogFn;
    warn: LogFn;
    error: LogFn;
    constructor(namespace: string, severity: Severity);
    readonly name: string;
    level: Severity;
}
interface ISeverityState {
    [namespace: string]: Severity;
}
export declare const getSeverityState: (config: string) => ISeverityState;
interface ILoggerState {
    [namespace: string]: Logger;
}
export interface IState {
    severity: ISeverityState;
    logger: ILoggerState;
}
export declare const state: IState;
export declare const cleanState: () => void;
export declare const getLogger: (namespace: string) => Logger;
export {};
