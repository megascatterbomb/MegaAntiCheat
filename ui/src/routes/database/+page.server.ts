import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
    const players = await fetch("/api/players");

    return {
        data: await players.json(),
    };
};
