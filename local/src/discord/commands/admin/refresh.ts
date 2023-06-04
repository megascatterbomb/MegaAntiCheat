import type {
    ButtonInteraction,
    CommandInteraction,
    GuildMember,
    MessageActionRowComponentBuilder,
    User,
} from "discord.js";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { ButtonComponent, Discord, Guard, Slash, SlashOption } from "discordx";
import { botOperator } from "../../guards";
  
@Discord()
@Guard(botOperator)
export class RefreshCommand {
    @Slash({ description: "Pull latest info about all accounts in the database.", name: "refresh" })
    async refresh(
        interaction: CommandInteraction
    ): Promise<void> {
        const reply = await interaction.reply("Refreshing database...");
        // TODO: Refresh database
        reply.edit("Refreshed database.");
    }
}