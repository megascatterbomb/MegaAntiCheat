import quotes from "../../assets/quotes.json";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = () => {
    return new Response(JSON.stringify(quotes));
};
