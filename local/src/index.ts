import dotenv from "dotenv";
//import { startDiscordServer } from "./discord/client";
import { startDiscordServer } from "./discord/main";
import { runClient } from "./client/main";

console.log("--- MegaAntiCheat Local Client ---");

dotenv.config({ path: "./local/.env" });

export const headlessMode = process.env.HEADLESS === "true";
export const logPath = process.env.LOG_PATH;
export const rconPort = Number(process.env.RCON_PORT || 27015);
export const rconPwd = process.env.RCON_PWD;

async function start() {
    if (headlessMode) {
        console.log("Starting in headless mode...");
        await startDiscordServer();
        console.log("Connected to Discord.");
    } else {
        await runClient();
    }
}

start();
