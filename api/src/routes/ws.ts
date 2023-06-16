import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";

const sockets: SocketStream[] = [];

export const sendMessage = (data: any) => {
    for (const socket of sockets) {
        socket.socket.send(JSON.stringify(data));
    }
};

export const websocket = (conn: SocketStream, req: FastifyRequest) => {
    const idx = sockets.push(conn);

    conn.socket.send("Connected!");

    conn.socket.on("close", () => {
        sockets.splice(idx, 1);
    });

    conn.socket.on("message", (msg) => {
        if (msg.toString().toLowerCase() == "ping") {
            conn.socket.send("pong");
        }
    });
};
