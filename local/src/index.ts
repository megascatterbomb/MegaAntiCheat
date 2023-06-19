import {config} from "dotenv";
//import { startDiscordServer } from "./discord/client";
import {startDiscordServer} from "./discord/main";
import {runClient} from "./client/main";

console.log("--- MegaAntiCheat Local Client ---");

config({path: "./local/.env"});

export const headlessMode = process.env.HEADLESS === "true";
export const rconHost = process.env.RCON_HOST || "127.0.0.1";
export const logPath = process.env.LOG_PATH;
export const rconPort = Number(process.env.RCON_PORT || 27015);
export const rconPwd = process.env.RCON_PWD;


async function start() {
    if(headlessMode) {
        console.log("Starting in headless mode...");
        await startDiscordServer();
        console.log("Connected to Discord.");
    } else {
        await runClient();
    }
}

start();
