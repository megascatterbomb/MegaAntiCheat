import { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import { botOperator } from "../guards";

@Discord()
export class MiscCommands {
    @Slash({ description: "Get a report on amount of users in the database", name: "stats" })
    async stats(interaction: CommandInteraction): Promise<void> {
        // TODO: Get all users
        // TODO: Break down users by type
        // TODO: Reply with embed.
    }
}
