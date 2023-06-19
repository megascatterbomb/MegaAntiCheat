import { blueBright, cyanBright, magenta, magentaBright } from "colorette";

export const createRGB = (r: number, g: number, b: number) => (text: string) =>
    `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;

export const orange = createRGB(255, 165, 0);
export const darkOrange = createRGB(255, 140, 0);

export const red = createRGB(255, 0, 0);
export const darkRed = createRGB(220, 20, 60);

export const green = createRGB(152, 251, 152);
export const darkGreen = createRGB(0, 100, 0);

export const infoPrefix = cyanBright("[") + blueBright("INFO") + cyanBright("]");
export const errorPrefix = darkRed("[") + red("ERROR") + darkRed("]");
export const warnPrefix = darkOrange("[") + orange("WARN") + darkOrange("]");

export class Logger {
    public service: string;

    public constructor(service: string) {
        this.service = service;
    }

    private makeServicePrefix() {
        return `${darkGreen("[")}${green(this.service.toUpperCase())}${darkGreen("]")}`;
    }

    private getMethodString(method: string) {
        switch (method) {
            case "GET":
                return magenta(method);

            case "POST":
                return cyanBright(method);

            case "PUT":
                return blueBright(method);

            case "DELETE":
                return red(method);

            default:
                return method;
        }
    }

    private multiply(text: string, times: number) {
        let result = "";

        for (let i = 0; i < times; i++) {
            result += text;
        }

        return result;
    }

    private formatStack(stack = "") {
        return stack
            .split("\n")
            .map(
                (line) =>
                    `${this.multiply(" ", this.service.length + 12)}${magenta("=>")} ${line.trim()}`
            )
            .join("\n");
    }

    public info(message: string) {
        console.log(`${this.makeServicePrefix()} ${infoPrefix} ${message}`);
    }

    public error(message: string | Error) {
        console.log(
            `${this.makeServicePrefix()} ${errorPrefix} ${
                message instanceof Error
                    ? magentaBright(message.message) + "\n" + this.formatStack(message.stack)
                    : message
            }`
        );
    }

    public warn(message: string) {
        console.log(`${this.makeServicePrefix()} ${warnPrefix} ${message}`);
    }

    public route(method: string, message: string) {
        console.log(`${this.makeServicePrefix()} ${this.getMethodString(method)} ${message}`);
    }
}
