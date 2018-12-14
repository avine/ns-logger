export interface IHooks {
    namespace: (severity: Severity, namespace: string) => string;
}
export declare const inject: {
    namespace(hook: (severity: Severity, namespace: string) => string): void;
};
/**
 * Severity of the message
 */
declare type Severity = 'trace' | 'log' | 'warn' | 'error';
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
export declare enum Level {
    Trace = 0,
    Log = 1,
    Warn = 2,
    Error = 3,
    Silent = 4
}
export declare const setDefaultLevel: (level: Level) => void;
export declare const disableInProduction: () => void;
declare function noop(): void;
export declare const bindTo: {
    consoleFactory: (severity: Severity, namespace: string) => (...args: any[]) => void;
    noop: typeof noop;
};
export declare class Logger implements ILogger {
    private ns;
    private lvl;
    trace: IConsole;
    log: IConsole;
    warn: IConsole;
    error: IConsole;
    constructor(ns: string, lvl: Level);
    readonly namespace: string;
    level: Level;
}
interface ILevelState {
    [namespace: string]: Level;
}
export declare const getLevelState: (config: string) => ILevelState;
interface ILoggerState {
    [namespace: string]: Logger;
}
export interface IState {
    level: ILevelState;
    logger: ILoggerState;
}
export declare const state: IState;
export declare const cleanState: () => void;
export declare const getLogger: (namespace: string) => Logger;
export {};
