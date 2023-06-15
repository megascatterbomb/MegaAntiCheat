import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = (event) => {
    const action = event.url.searchParams.get("action");
    
    void action;

    return new Response(
        JSON.stringify(
            {
                message: "Action not found",
            },
            null,
            4
        ),
        {
            status: 400,
            statusText: "Bad Request",
        }
    );
};
