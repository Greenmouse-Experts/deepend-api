import morgan from "morgan";
import chalk from "chalk";
import type { Request, Response } from "express";

morgan.token("methodColored", (req: Request) => {
	switch (req.method) {
		case "POST":
			return chalk.yellow(req.method);
		case "PUT":
			return chalk.blue(req.method);
		case "PATCH":
			return chalk.magenta(req.method);
		case "DELETE":
			return chalk.red(req.method);
		case "GET":
		default:
			return chalk.green(req.method);
	}
});

morgan.token("statusColored", (_req: Request, res: Response) => {
	const code = res.statusCode;
	if (code >= 500) return chalk.red(String(code));
	if (code >= 400) return chalk.yellow(String(code));
	if (code >= 300) return chalk.cyan(String(code));
	return chalk.green(String(code));
});

morgan.token("isoDate", () => new Date().toISOString());

const format =
	":methodColored [:isoDate] :url :statusColored :response-time ms - :res[content-length]";

interface LoggerOptions {
	skipHealth?: boolean;
}

export function requestLogger(options: LoggerOptions = {}) {
	return morgan(format, {
		skip: (req) => {
			if (options.skipHealth && (req.url === "/health" || req.url === "/ready"))
				return true;
			return false;
		},
	});
}
