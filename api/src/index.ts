import Fastify from "fastify";
import querystring from "querystring";
import { connect } from "./connect";
import { Logger, green, orange } from "./logger";
import { register } from "./routes";
import ws from "@fastify/websocket";
import { addLogger } from "./hook";

export const main = async () => {
    const host = process.env.HOST ?? "127.0.0.1";
    const port = parseInt(process.env.PORT ?? "4000");
    const logger = new Logger("api");

    logger.info("Connecting to database...");

    await connect();

    logger.info("Creating server...");

    const app = Fastify({
        logger: false,
        querystringParser: querystring.parse,
    });

    app.register(ws);
    register(app);

    addLogger(app, logger);

    app.listen({ host, port }, (err, addr) => {
        if (err) {
            logger.error(err);
            process.exit(1);
        }

        logger.info(`Server listening at ${addr}!`);
    });
};

main();
