import dotenv from "dotenv";
//import { startDiscordServer } from "./discord/client";
import {startDiscordServer} from "./discord/main";

console.log("--- MegaAntiCheat Local Client ---");

dotenv.config({path: "./local/.env"});

export const headlessMode = process.env.HEADLESS === "true";

async function start() {
    if(headlessMode) {
        console.log("Starting in headless mode...");
        await startDiscordServer();
        console.log("Connected to Discord.");
    }
}

start();