import chalk from "chalk";

export class CLIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CLIError';
    }
}

export function safeCall<T>(fn: () => T): () => T | undefined {
    return () => {
        try {
            return fn();
        } catch (e) {
            if (e instanceof CLIError) {
                console.log(chalk.red(e.message));
                return undefined;
            } else {
                console.log(chalk.red('An unexpected error occurred'));
                console.log(e);
                return undefined;
            }
        }
    }
}