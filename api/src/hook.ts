import { FastifyInstance } from "fastify";
import { Logger, green, orange } from "./logger";

export const addLogger = (app: FastifyInstance, logger: Logger) => {
    app.addHook("onResponse", async (req, res) => {
        logger.route(
            req.method,
            `${req.url} ${green(res.statusCode.toString())} (${orange(
                `${res.getResponseTime().toPrecision(3)}ms`
            )})`
        );
    });
};
