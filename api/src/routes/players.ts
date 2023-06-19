import { ParsedUrlQuery } from "querystring";
import { FastifyReply, FastifyRequest } from "fastify";
import { Player } from "../models";
import { sendMessage } from "./ws";

export const getPlayers = async (req: FastifyRequest, res: FastifyReply) => {
    const query: ParsedUrlQuery = req.query as ParsedUrlQuery;

    const count = parseInt(query.count?.toString() || "20");
    const page = parseInt(query.page?.toString() || "0");

    const _ = await Player.find().select("steamId").exec();
    const num = _.length;

    const players = await Player.find(
        {},
        {},
        {
            skip: page * count,
            limit: count,
        }
    ).exec();

    res.send({
        data: players,

        pagination: {
            count,
            page,
            pages: Math.ceil(num / count) - 1,
            total: num,
        },
    });
};

export const addPlayer = async (req: FastifyRequest, res: FastifyReply) => {
    const body: Record<string, any> = req.body as Record<string, any>;

    const existing = await Player.find({
        steamId: body.steamId,
    }).exec();

    if (existing.length > 0) {
        for (const player of existing) {
            await player.deleteOne();
        }
    }

    const player = new Player({
        steamId: body.steamId,
        name: body.name,
        aliases: body.aliases,

        status: body.status,
    });

    try {
        const data = await player.save();

        res.send(data);
        sendMessage(data);
    } catch (e: any) {
        res.status(500);
        res.send(e);
    }
};
