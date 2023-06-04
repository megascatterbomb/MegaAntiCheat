import { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import { botOperator } from "../../guards";

@Discord()
@Guard(botOperator)
export class ShutdownCommand {
    @Slash({ description: "Shut down the database", name: "shutdown" })
    async shutdown(
        interaction: CommandInteraction
    ): Promise<void> {
        const reply = await interaction.reply("Shutting down in 5 seconds...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        await reply.edit("Shutting down...");
        process.exit(0);
    }
}