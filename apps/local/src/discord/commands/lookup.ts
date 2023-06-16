import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import https from "https";
import { SteamID, convertSteamID64toSteamID3, convertSteamID64toSteamID1 } from "../../common/steamID";
import { SteamIDTransformer } from "../transformers";

@Discord()
export class LookupCommands {
    @Slash({ description: "Check a steam group of users against the database.", name: "group" })
    async group(
        @SlashOption({
            description: "Link to steam group",
            name: "link",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
            link: string,
            interaction: CommandInteraction,
    ): Promise<void> {
        // TODO: Move to helper function (Use other helper to parse the xml for SteamIDs)
        let i = 1;
        let xmlString = "";
        // eslint-disable-next-line no-constant-condition
        while(true) {
            const baseString = ["https://steamcommunity.com/groups/", "/memberslistxml/?xml=1&p=" + i];

            const nameStartIndex = link.indexOf("groups/") + 7;
            const nameEndIndex = link.indexOf("/", nameStartIndex);
            const groupName = link.substring(nameStartIndex, nameEndIndex > 0 ? nameEndIndex : undefined);

            const xmlUrl = baseString[0] + groupName + baseString[1];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await new Promise(resolve => {
                https.get(xmlUrl, res => {
                    let data = "";
                    res.on("data", chunk => {data += chunk;});
                    res.on("end", () => {resolve(data);});
                });
            });
            const newXmlString = response as string;
            xmlString += "\n" + newXmlString;
            if(newXmlString.search(/<nextPageLink>\s*<!\[CDATA\[\s?https:\/\/steamcommunity\.com\/groups\//gm) === -1) {
                break;
            }
            i++;
        }
        // TODO: Send IDs to database to check
        // TODO: Lookup result embed, (optional: with detailed results for group officers/moderators)
    }
    @Slash({description: "Look up an individual Steam account.", name: "lookup"})
    async lookup(
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
        // We can cast as we're only looking up one account.
        const [embed] = await getLookupEmbed([user]) as EmbedBuilder[];
        interaction.reply({embeds: [embed]});
    }
}
// Returns an array of embeds depending on the amount of accounts that have been requested.
// - 1 to 5 accounts: detailed embed for each account.
// - 6 to 50 accounts: embeds listing Cheaters, Bots, and Suspicious players respectively.
// - >50 accounts, or >25 cheaters, bots, or sus players: text file. // TODO: Should we return text content or file path?
async function getLookupEmbed(steamIDs: SteamID[]): Promise<EmbedBuilder[] | string> {
    // TODO: Generic lookup function for any amount of accounts to look up.
    if(steamIDs.length === 0) {
        return [new EmbedBuilder({title: "No SteamIDs included in lookup."})];
    } else if (steamIDs.length <= 5) {
        // TODO: Detailed embeds.
        return [];
    } else if (steamIDs.length <= 50) {
        let fits = true;
        // TODO: Embeds listing accounts. Set fits to false if any embed needs more than 25 fields.
        if(fits) return [];
    }

    // If we get here, then we need to do text file.

    return "text/filepath goes here";
}