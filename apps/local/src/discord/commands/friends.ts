import { ApplicationCommandOptionType, CommandInteraction, Embed } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { SteamID } from "../../common/steamID";
import { SteamIDTransformer } from "../transformers";

@Discord()
export class FriendCommands {
    @Slash({ description: "Check a user's friends list for cheaters.", name: "friends" })
    async friends(
        @SlashOption({
            description: "User to check friends of",
            name: "user",
            required: true,
            type: ApplicationCommandOptionType.String,
            transformer: SteamIDTransformer
        })
            user: SteamID,
        @SlashOption({
            description: "Page number (defaults to 1)",
            name: "page",
            required: false,
            minValue: 1,
            type: ApplicationCommandOptionType.Number,
        })
            page: number | undefined,
            interaction: CommandInteraction
    ): Promise<void> {
        page ??= 1;
        // TODO: Use steam ID to get user from database.
        // TODO: Make API call.
    }
}

// TODO: Update method signature to reflect whatever database module returns.
export async function getFriendEmbed(steamID: SteamID, results: any[]): Promise<Embed[] | string> {
    // TODO: Get database information.

    // TODO: Create embed. Perhaps come up with other ways of listing friends more efficiently; the old method is quite clunky.
    
    return [];
}