import { get } from "svelte/store";
import type { LayoutServerLoad } from "./$types";
import { client, runningSetup } from "../stores/database";
import { setupDatabase } from "$lib";

export const load: LayoutServerLoad = async ({ fetch }) => {
    if (get(client) == null && !get(runningSetup)) setupDatabase();

    const quote = await fetch("/quote");

    return {
        quote: await quote.json(),
    };
};
