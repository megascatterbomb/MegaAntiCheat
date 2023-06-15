import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
    const quote = await fetch("/quote");

    return {
        quote: await quote.json(),
    };
};
