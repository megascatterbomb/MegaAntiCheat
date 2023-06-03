import { IntentsBitField } from "discord.js";
import { Client } from "discordx";

export async function startDiscordServer() {
    const client = new Client({
        botId: "test",
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
        ],
    });

    client.once("ready", async () => {
        await client.initApplicationCommands();
    });

    client.on("interactionCreate", (interaction) => {
        client.executeInteraction(interaction);
    });

    if(process.env.DISCORD_TOKEN === undefined) {
        throw new Error("DISCORD_TOKEN not defined. Required for headless mode");
    }

    await client.login(process.env.DISCORD_TOKEN);
}