import { ApplicationCommandOptionType, Attachment, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { SteamID } from "../../common/steamID";
import { downloadTextAttachments } from "../helpers";
import { SteamIDTransformer } from "../transformers";

@Discord()
export class MarkCommands {
    @Slash({ description: "Import a list of cheaters/bots/sus users to the database", name: "import" })
    async import(
        @SlashChoice({name: "Cheater", value: "cheater"})
        @SlashChoice({name: "Bot", value: "bot"})
        @SlashChoice({name: "Suspicious", value: "suspicious"})
        @SlashChoice({name: "Normal", value: "normal"})
        @SlashOption({
            description: "What is this account?",
            name: "type",
            required: true,
            type: ApplicationCommandOptionType.String
        })
            type: string,
        @SlashOption({
            description: "User to check friends of",
            name: "user",
            required: true,
            type: ApplicationCommandOptionType.String,
            transformer: SteamIDTransformer
        })
            user: SteamID,
            interaction: CommandInteraction
    ): Promise<void> {
        if(!["cheater", "bot", "suspicious", "normal"].includes(type)) {
            // TODO: Test if throwing errors like this is a valid way of doing things.
            throw new Error("Invalid status to set.");
        }
        
        // TODO: Interpret

        // TODO: Use helper SteamID parser here to get all the SteamID64s.

        // TODO: Send IDs to database to mark as cheater/sus/bot
        // TODO: What should happen if the account is already marked? Perhaps optional override flag?
    }
}