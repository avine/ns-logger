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
 * Minimum level of displayed messages
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
export declare const bindTo: {
    console: (severity: Severity, namespace: string) => (...args: any[]) => void;
    noop: () => void;
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
