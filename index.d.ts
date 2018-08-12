declare type LogLevel = 'trace' | 'log' | 'warn' | 'error';
declare type LogFn = (...args: any[]) => string;
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
export declare const severityState: ISeverityState;
interface ILoggerState {
    [namespace: string]: Logger;
}
export declare const loggerState: ILoggerState;
export declare const cleanStates: () => void;
export declare const getLogger: (namespace: string, severity?: Severity) => Logger;
export {};
