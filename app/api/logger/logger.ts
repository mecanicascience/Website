interface LogFunction {
    (message?: any, ...optionalParams: any[]): void;
}

/**
 * Logger class.
 * This class is used to log messages to the console using the console.log,
 *   console.warn and console.error functions.
 * console.debug and console.info are bound to console.log.
 */
class Logger {
    readonly log: LogFunction;
    readonly warn: LogFunction;
    readonly error: LogFunction;
    readonly debug: LogFunction;
    readonly info: LogFunction;

    constructor() {
        this.error = console.error.bind(console);
        this.warn = console.warn.bind(console);
        this.log = console.log.bind(console);

        // Bind debug and info to log
        this.debug = this.log;
        this.info = this.log;
    }
}

const logger = new Logger();
export default logger;
