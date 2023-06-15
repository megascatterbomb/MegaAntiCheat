import { defineConfig, type ServerOptions } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

const proxyPort = process.env.PROXY_PORT || 4000;
const proxyClientPort = process.env.PROXY_CLIENT_PORT || 443;
const proxyHmrProtocol = process.env.PROXY_HMR_PROTOCOL || "wss";

export default defineConfig({
    plugins: [sveltekit()],
    clearScreen: false,

    server: process.env.BEHIND_PROXY
        ? ({
              host: "0.0.0.0",
              port: proxyPort,

              hmr: {
                  clientPort: proxyClientPort,
                  port: proxyPort,
                  protocol: proxyHmrProtocol,
              },
          } as ServerOptions)
        : undefined,
});
