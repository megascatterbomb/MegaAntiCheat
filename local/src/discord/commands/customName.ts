import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { SteamID } from "../../common/steamID";
import { SteamIDTransformer } from "../transformers";
import https from "https";

@Discord()
export class CustomNameCommands {
    // Custom names will be displayed where current aliases typically are so that users can be more easily identified.
    @Slash({ description: "Give a Steam User a custom name.", name: "setcustomname" })
    async setcustomname(
        @SlashOption({
            description: "User to check friends of",
            name: "user",
            required: true,
            type: ApplicationCommandOptionType.String,
            transformer: SteamIDTransformer,
        })
        user: SteamID,
        @SlashOption({
            description: "The custom name to give this user",
            name: "name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        interaction: CommandInteraction
    ): Promise<void> {
        // TODO: See if user is in database, add them as "Normal" if they're not.
        // TODO: Apply custom name
    }
}
