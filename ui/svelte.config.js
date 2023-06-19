import auto from "@sveltejs/adapter-auto";
import node from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/kit/vite";

const adapter = process.env.SVELTE_ADAPTER == "node" ? node : auto;

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        csrf: false,
        adapter: adapter(),
    },
};

export default config;
