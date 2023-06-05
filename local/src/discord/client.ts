import { IntentsBitField } from "discord.js";
import { Client } from "discordx";

// Entry point to start discord server. Only supported in headless mode.
export async function startDiscordServer() {
    const client = new Client({
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent
        ],
        botGuilds: process.env.DEV_GUILD ? [process.env.DEV_GUILD] : undefined,
    });

    if(!process.env.BOT_OWNER) {
        throw new Error("BOT_OWNER not specified in environment. Whoever hosts this needs to set BOT_OWNER to their discord account ID!");
    }

    if(process.env.DISCORD_TOKEN === undefined) {
        throw new Error("DISCORD_TOKEN not defined. Required for headless mode.");
    }

    client.on("ready", async () => {
        await client.initApplicationCommands();
    });

    client.on("interactionCreate", (interaction) => {
        client.executeInteraction(interaction);
    });

    await client.login(process.env.DISCORD_TOKEN);
}