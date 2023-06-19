import { Player } from "$lib";
import type { RequestHandler } from "@sveltejs/kit";

export const PATCH: RequestHandler = async (event) => {
    const body = await event.request.json();
    const existing = await Player.findOne().where("_id").equals(event.params.id).exec();

    try {
        const data = await existing?.updateOne(body);

        return new Response(JSON.stringify(data, null, 4));
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
};
