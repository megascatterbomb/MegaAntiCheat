import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { SteamID } from "../../common/steamID";
import { SteamIDTransformer } from "../transformers";
import https from "https";

@Discord()
export class CustomNameCommands {
    @Slash({description: "Give a Steam User a custom name.", name: "setcustomname"})
    async setcustomname(
        @SlashOption({
            description: "User to check friends of",
            name: "user",
            required: true,
            type: ApplicationCommandOptionType.String,
            transformer: SteamIDTransformer
        })
            user: SteamID,
        @SlashOption({
            description: "The custom name to give this user",
            name: "name",
            required: true,
            type: ApplicationCommandOptionType.String
        })
            name: string,
        interaction: CommandInteraction
    ): Promise<void> {
        // Check if the user exists in the database
        // Replace `getUserFromDatabase` with actual function
        const existingUser = await getUserFromDatabase(user);

        if (!existingUser) {
            // Add the user to the database with the "Normal" role
            // Replace `addUserToDatabase` with function
            await addUserToDatabase(user, 'Normal');
        }

        // Apply the custom name to the user
        // Replace `applyCustomName` with function
        await applyCustomName(user, name);

        // Send a confirmation message to the interaction
        await interaction.reply(`Custom name "${name}" has been set for user ${user}.`);
    }
}
