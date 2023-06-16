import type { RequestHandler } from "@sveltejs/kit";
import { Player } from "$lib";

export const GET: RequestHandler = async (event) => {
    const query = event.url.searchParams;

    const count = parseInt(query.get("count") || "20");
    const page = parseInt(query.get("page") || "0");

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

    return new Response(
        JSON.stringify(
            {
                data: players,

                pagination: {
                    count,
                    page,
                    pages: Math.ceil(num / count),
                    total: num,
                },
            },
            null,
            4
        )
    );
};

export const POST: RequestHandler = async (event) => {
    const body = await event.request.json();

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

        return new Response(JSON.stringify(data, null, 4));
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
};
