import { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import { botOperator } from "../../guards";

@Discord()
@Guard(botOperator)
export class BackupCommand {
    @Slash({ description: "Backup the database to a .JSON", name: "backup" })
    async backup(
        interaction: CommandInteraction
    ): Promise<void> {
        const reply = await interaction.reply("Backing up database...");
        // TODO: Back up database to JSON, return to user
        // TODO: Should this be admin only?
        await reply.edit("Backed up database.");
    }
}