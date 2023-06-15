import type { RequestHandler } from "@sveltejs/kit";
import { Player } from "$lib";

export const GET: RequestHandler = async (event) => {
    const players = await Player.find().exec();

    return new Response(JSON.stringify(players, null, 4));
};

export const POST: RequestHandler = async (event) => {
    const body = await event.request.json();

    const existing = await Player.find().where("steamId").equals(body.steamId).exec();

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

    const data = await player.save();

    return new Response(JSON.stringify(data, null, 4));
};
