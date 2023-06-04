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
import { CacheType, EmbedFieldData, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed, User } from "discord.js";
import { addEvidence, DBSteamUser, getSteamUser, registerSteamUser, SteamIDType, SteamUserType } from "../database/steamUser";
import { registerSubscriber, toggleSubscriptionStatus } from "../database/subscriber";
import ChannelCommand from "../extensions/channelCommand";
import { convertSteamID64toSteamID1, convertSteamID64toSteamID3, getSteamID64, steam } from "../webrequests/steamquery";

@Alias("clip", "clips", "evidence")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("View evidence for a particular account.")
export default class ClipCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The steam user to view evidence of (Link to Steam Profile or SteamID)."})
        steamUser!: string;
    @Argument({ type: new IntegerType(), description: "Page number (defaults to 1)", default: (m) => 1, optional: true})
        pageNumber!: number;
    async execute(message: Message, client: Client) {
        const steamID64 = await getSteamID64(this.steamUser).catch();
        if(steamID64 === undefined) {
            throw new Error("That is not a valid profile. Provide a SteamID or a link to a steam profile.");
        } else if (steamID64 === null) {
            throw new Error("This custom URL does not point to a valid profile.");
        }
        const steamUser = await getSteamUser(steamID64, true);
        if(steamUser === null) throw new Error("Could not find that user in the database.");

        const result = await generateEvidenceEmbed(steamUser, this.pageNumber, message);
        
        const interactionFunction = async (interaction: Interaction<CacheType>) => {
            if(interaction.user.id !== message.author.id) {
                // Allow anyone to do it
            }
            try {
                if(interaction.isButton()) {
                    const id: string = interaction.customId as string;
                    const split = id.split("evidence");
                    if(split[1] === message.id) {
                        await interaction.deferUpdate();
                        const number = Number.parseInt(split[0]);
                        message.reply({content: result.embed.fields[number % 5].value, allowedMentions: {repliedUser: false}});
                    } else {
                        return;
                    }
                }
            // eslint-disable-next-line no-empty
            } catch (err) {}
        };
        client.on("interactionCreate", interactionFunction);
        await message.reply({embeds: [result.embed], components: result.buttons === undefined ? undefined : [result.buttons]});
    }
}

async function generateEvidenceEmbed(user: DBSteamUser, page: number, message: Message): Promise<{embed: MessageEmbed, buttons: MessageActionRow | undefined}> {
    if(user.evidence.length === 0) {
        return { 
            embed: new MessageEmbed({
                title: `No evidence logged for ${user.currentAlias}.`
            }), buttons: undefined 
        };
    }
    const pageLength = 5;
    const fields: EmbedFieldData[] = user.evidence.map((clip, i) => {
        return {
            name: "#" + (i + 1),
            value: clip
        };
    });
    const first = (page - 1) * pageLength;
    const messageActionRow = new MessageActionRow();
    const buttons = fields.filter((v, i) => i >= first && i < first + 5).map((v, i) => {
        const button = new MessageButton()
            .setCustomId(i + "evidence" + message.id)
            .setLabel(((page*5) + i - 4).toString())
            .setStyle("SECONDARY");
        return button;
    });
    messageActionRow.addComponents(...buttons);
    return {
        embed: new MessageEmbed({
            title: `Evidence for ${user.currentAlias} ${user.evidence.length > pageLength ? `(Page ${page} of ${Math.ceil(user.evidence.length / pageLength)})` : ""}:`,
            fields: fields.filter((v, i) => i >= first && i < first + 5),
            footer: {text: "To view video embeds, use the buttons below."}
        }),
        buttons: messageActionRow
    };
}
