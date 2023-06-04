import { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import { botOperator } from "../../guards";

@Discord()
@Guard(botOperator)
export class RestartCommand {
    @Slash({ description: "Restart the database", name: "restart" })
    async restart(
        interaction: CommandInteraction
    ): Promise<void> {
        const reply = await interaction.reply("Shutting down in 5 seconds...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        await reply.edit("Shutting down...");
        process.exit(-1); // Failure status code SHOULD trigger an automatic restart.
    }
}