import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { importx } from "@discordx/importer";
import path from "path";


// Entry point to start discord server. Only supported in headless mode.
export async function startDiscordServer() {
    const client = new Client({
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMessageReactions,
            IntentsBitField.Flags.GuildVoiceStates,
            IntentsBitField.Flags.MessageContent
        ],
        silent: false,
        botGuilds: process.env.DEV_GUILD ? [process.env.DEV_GUILD] : undefined
    });

    if(!process.env.BOT_OWNER) {
        throw new Error("BOT_OWNER not specified in environment. Whoever hosts this needs to set BOT_OWNER to their discord account ID!");
    }

    if(process.env.DISCORD_TOKEN === undefined) {
        throw new Error("DISCORD_TOKEN not defined. Required for headless mode.");
    }

    await importx(path.join(__dirname, "{events,commands}/**/*.{ts,js}"));

    client.once("ready", async () => {
        await client.initApplicationCommands();
        
        console.log("Commands registered");
    });

    client.on("interactionCreate", (interaction) => {
        client.executeInteraction(interaction);
    });

    //await importx(`${__dirname}/commands/**/*.{ts,js}`);
    //await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

    await client.login(process.env.DISCORD_TOKEN);
}