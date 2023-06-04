import {
    Alias,
    Inhibit,
    Permit,
    Command,
    Argument,
    BooleanType,
    IntegerType,
    UnionType,
    FloatType,
    Client,
    UserType,
    Described,
    StringType,
} from "@frasermcc/overcord";
import { CacheType, Interaction, Message, MessageActionRow, MessageButton, User } from "discord.js";
import { client } from "..";
import { getSteamUser, registerSteamUser, removeSteamUser, SteamIDType, SteamUserType } from "../database/steamUser";
import ChannelCommand from "../extensions/channelCommand";
import { getSteamID64 } from "../webrequests/steamquery";
import { currentInteractions, finishInteraction } from "./markcheater";

@Alias("markinnocent", "innocent")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Mark a steam user as innocent so that others don't mistaken them for a cheater.")
export default class MarkInnocentCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The steam user to mark as innocent (Link to Steam Profile or SteamID)."})
        steamUser!: string;

    async execute(message: Message, client: Client) {
        const steamID64 = await getSteamID64(this.steamUser).catch();
        if(steamID64 === undefined) {
            throw new Error("That is not a valid profile. Provide a SteamID or a link to a steam profile.");
        } else if (steamID64 === null) {
            throw new Error("This custom URL does not point to a valid profile.");
        } else if(currentInteractions.includes(steamID64)) {
            throw new Error("Someone else is currently attempting to register that user.");
        }
        currentInteractions.push(steamID64);
        const dbUser = await getSteamUser(steamID64, true);
        if(dbUser?.userType === SteamUserType.KnownCheater || dbUser?.userType === SteamUserType.Suspicious) {
            await this.overrideMessage(steamID64, message, dbUser.userType);
            return;
        } else if (dbUser?.userType === SteamUserType.Innocent) {
            message.reply("This user has already been marked as Innocent");
            finishInteraction(steamID64);
            return;
        }
        const err = await registerSteamUser(steamID64, SteamUserType.Innocent, message.author.id);
        if(err !== "") {
            throw new Error(err);
        }
        finishInteraction(steamID64);
        message.reply("Successfully marked `" + steamID64 + "` as innocent.");
    }

    async overrideMessage(steamID64: string, cmdMessage: Message, currentType: SteamUserType) {
        const submitButton = new MessageButton()
            .setCustomId("submitButton" + cmdMessage.id)
            .setLabel("Mark as Innocent")
            .setStyle("PRIMARY");
        const rejectButton = new MessageButton()
            .setCustomId("cancelButton" + cmdMessage.id)
            .setLabel("Cancel")
            .setStyle("SECONDARY");
        const buttonRow = new MessageActionRow().addComponents(submitButton, rejectButton);

        const typeString = currentType === SteamUserType.Suspicious ? "suspicious" : "a cheater";
        const response = cmdMessage.reply({components: [buttonRow], content:
            `**This user has already been marked as ${typeString}.** If you wish to change this to innocent, you can, otherwise you may cancel the operation.`});
        const interactionFunction = async (interaction: Interaction<CacheType>) => {
            if(interaction.user.id !== cmdMessage.author.id) {
                return;
            }
            try {
                if(interaction.isButton() && interaction.customId === "submitButton" + cmdMessage.id) {
                    await interaction.deferUpdate();
                    await interaction.editReply({ content: "Successfully marked `" + steamID64 + "` as innocent", components: [] });
                    const err = await registerSteamUser(steamID64, SteamUserType.Innocent, interaction.user.id);
                    client.off("interactionCreate", interactionFunction);
                    finishInteraction(steamID64);
                    if(err !== "") {
                        throw new Error(err);
                    }
                } else if (interaction.isButton() && interaction.customId === "cancelButton" + cmdMessage.id) {
                    await interaction.deferUpdate();
                    await interaction.editReply({ content: "Cancelled operation", components: [] });
                    client.off("interactionCreate", interactionFunction);
                    finishInteraction(steamID64);
                }
            // eslint-disable-next-line no-empty
            } catch (err) {}
        };
        client.on("interactionCreate", interactionFunction);
    }
}