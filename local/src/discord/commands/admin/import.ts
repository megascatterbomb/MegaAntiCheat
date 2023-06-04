import { CommandInteraction, Message, Client, Interaction, CacheType, ApplicationCommandOptionType, Attachment } from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import { botOperator } from "../../guards";
import { downloadTextAttachments } from "../../helpers";
import { currentInteractions, finishInteraction } from "../markcheater";

@Discord()
@Guard(botOperator)
export class ImportCommand {
    @Slash({ description: "Import a list of cheaters/bots/sus users to the database", name: "import" })
    async import(
        @SlashChoice({name: "Cheater", value: "cheater"})
        @SlashChoice({name: "Bot", value: "bot"})
        @SlashChoice({name: "Suspicious", value: "suspicious"})
        @SlashOption({
            description: "What are these accounts?",
            name: "type",
            required: true,
            type: ApplicationCommandOptionType.String
        })
            type: string,
        @SlashOption({
            description: "Text file containing Steam IDs",
            name: "attachment",
            required: true,
            type: ApplicationCommandOptionType.Attachment
        })
            attachment: Attachment,
            interaction: CommandInteraction,
    ): Promise<void> {
        if(!["cheater", "bot", "suspicious"].includes(type)) {
            // TODO: Test if throwing errors like this is a valid way of doing things.
            throw new Error("Invalid status to set.");
        }
        // TODO: Test if this works as intended.
        const [attachmentText] = await downloadTextAttachments([attachment]);

        // TODO: Use helper SteamID parser here to get all the SteamID64s.

        // TODO: Send IDs to database to mark as cheater/sus/bot
        // TODO: What should happen if the account is already marked? Perhaps optional override flag?
    }
}