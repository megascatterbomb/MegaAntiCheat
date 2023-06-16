import { FastifyInstance } from "fastify";
import { addPlayer, getPlayers } from "./players";
import { websocket } from "./ws";
import { addLogger } from "../hook";
import { Logger } from "../logger";

export const register = (app: FastifyInstance) => {
    app.get("/api/v1/players", getPlayers);
    app.put("/api/v1/players", addPlayer);

    app.register(async (fastify) => {
        fastify.get("/api/v1/ws", { websocket: true }, websocket);

        addLogger(fastify, new Logger("WebSocket"));
    });
};
