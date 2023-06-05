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
import { setVerbose, verboseEnabled } from "../../../common/logging";
import { botOperator } from "../../guards";
  
@Discord()
@Guard(botOperator)
export class AdminCommands {
    @Slash({ description: "Toggle verbose logging.", name: "verbose" })
    async verbose(
        @SlashOption({
            description: "true to enable; false to disable",
            name: "boolean",
            type: ApplicationCommandOptionType.Boolean,
            required: true
        })
            boolean: boolean,
            interaction: CommandInteraction
    ): Promise<void> {
        if(verboseEnabled === boolean)  {
            interaction.reply(`Verbose logging is already ${boolean ? "enabled" : "disabled"}.`);
            return;
        }
        setVerbose(boolean);
        interaction.reply(`Successfully ${boolean ? "enabled" : "disabled"} verbose logging.`);
    }

    @Slash({ description: "Pull latest info about all accounts in the database.", name: "refresh" })
    async refresh(
        interaction: CommandInteraction
    ): Promise<void> {
        const reply = await interaction.reply("Refreshing database...");
        // TODO: Refresh database
        reply.edit("Refreshed database.");
    }

    @Slash({ description: "Backup the database to a .JSON", name: "backup" })
    async backup(
        interaction: CommandInteraction
    ): Promise<void> {
        const reply = await interaction.reply("Backing up database...");
        // TODO: Back up database to JSON, return to user
        // TODO: Should this be admin only?
        await reply.edit("Backed up database.");
    }

    @Slash({ description: "Restart the database", name: "restart" })
    async restart(
        interaction: CommandInteraction
    ): Promise<void> {
        const reply = await interaction.reply("Shutting down in 5 seconds...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        await reply.edit("Shutting down...");
        process.exit(-1); // Failure status code SHOULD trigger an automatic restart.
    }

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