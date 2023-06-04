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
import { randomUUID } from "crypto";
import { CacheType, Interaction, InteractionCollector, Message, MessageActionRow, MessageButton, MessageSelectMenu, User } from "discord.js";
import {  getSteamUser, registerSteamUser, removeSteamUser, SteamIDType, SteamUserType } from "../database/steamUser";
import ChannelCommand from "../extensions/channelCommand";
import { getSteamID64 } from "../webrequests/steamquery";
import { griefTypes } from "../utilities/config";

export let currentInteractions: string[] = [];

@Alias("markcheater", "cheater", "markcheat")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Mark a steam user as a definite cheater.")
export default class MarkCheaterCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The steam user to mark as a cheater (Link to Steam Profile or SteamID)."})
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
        const currentHacks: string[] = (dbUser)?.hackTypes ?? [];
        
        const hackSelectorMenu = new MessageSelectMenu()
            .setCustomId("hackSelectCheater" + message.id)
            .setPlaceholder("Select at least one type of hack:")
            .setMinValues(1)
            .addOptions(griefTypes.map(a => currentHacks.includes(a.value) ? {label: a.label, value: a.value, description: a.description, default: true} : a));
        const submitButton = new MessageButton()
            .setCustomId("submitButton" + message.id)
            .setLabel("Submit")
            .setStyle("SUCCESS");
        const rejectButton = new MessageButton()
            .setCustomId("cancelButton" + message.id)
            .setLabel("Cancel")
            .setStyle("DANGER");
        const row1 = new MessageActionRow().addComponents(hackSelectorMenu);
        const row2 = new MessageActionRow().addComponents(submitButton, rejectButton);

        await message.reply({content: dbUser?.userType === SteamUserType.KnownCheater ? 
            "**This user has already been marked as a cheater.** If you wish to update the list of hacks, you can, otherwise you may cancel the operation."
            : "Please select the hacks this player was using...", components: [row1, row2]});
        let selectedHacks: string[] = currentHacks;

        const interactionFunction = async (interaction: Interaction<CacheType>) => {
            if(interaction.user.id !== message.author.id) {
                return;
            }
            try {
                if (interaction.isSelectMenu() && interaction.customId === "hackSelectCheater" + message.id) {
                    await interaction.deferUpdate();
                    selectedHacks = interaction.values;
                } else if(interaction.isButton() && interaction.customId === "submitButton" + message.id) {
                    await interaction.deferUpdate();
                    if(selectedHacks.length === 0) {
                        interaction.followUp({ephemeral: true, content: "You must select at least one hack"});
                        return;
                    }
                    await interaction.editReply({ content: `Marked \`${steamID64}\` as a cheater using the following hacks:\n\`${selectedHacks.join(", ")}\``, components: [] });
                    const err = await registerSteamUser(steamID64, SteamUserType.KnownCheater, message.author.id, selectedHacks);
                    client.off("interactionCreate", interactionFunction);
                    currentInteractions = currentInteractions.filter((id) => id !== steamID64);
                    if(err !== "") {
                        throw new Error(err);
                    }
                } else if (interaction.isButton() && interaction.customId === "cancelButton" + message.id) {
                    await interaction.deferUpdate();
                    await interaction.editReply({ content: "Cancelled operation", components: [] });
                    client.off("interactionCreate", interactionFunction);
                    currentInteractions = currentInteractions.filter((id) => id !== steamID64);
                }
            // eslint-disable-next-line no-empty
            } catch (err) {}
        };
        client.on("interactionCreate", interactionFunction);
    }
}

export function finishInteraction(steamID64: string){
    currentInteractions = currentInteractions.filter((id) => !id.includes(steamID64));
}