import {
    CommandInteraction,
    Message,
    Client,
    Interaction,
    CacheType,
    ApplicationCommandOptionType,
    Attachment,
} from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import { botOperator } from "../../guards";
import { downloadTextAttachments } from "../../helpers";
import https from "https";

@Discord()
@Guard(botOperator)
export class ImportCommands {
    @Slash({
        description: "Import a list of cheaters/bots/sus users to the database via a text file",
        name: "import",
    })
    async import(
        @SlashChoice({ name: "Cheater", value: "cheater" })
        @SlashChoice({ name: "Bot", value: "bot" })
        @SlashChoice({ name: "Suspicious", value: "suspicious" })
        @SlashOption({
            description: "What are these accounts?",
            name: "type",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        type: string,
        @SlashOption({
            description: "Text file containing Steam IDs",
            name: "attachment",
            required: true,
            type: ApplicationCommandOptionType.Attachment,
        })
        attachment: Attachment,
        interaction: CommandInteraction
    ): Promise<void> {
        if (!["cheater", "bot", "suspicious"].includes(type)) {
            // TODO: Test if throwing errors like this is a valid way of doing things.
            throw new Error("Invalid status to set.");
        }
        // TODO: Test if this works as intended.
        const [attachmentText] = await downloadTextAttachments([attachment]);

        // TODO: Use helper SteamID parser here to get all the SteamID64s.

        // TODO: Send IDs to database to mark as cheater/sus/bot
        // TODO: What should happen if the account is already marked? Perhaps optional override flag?
    }

    @Slash({
        description: "Import a steam group of cheaters/bots/sus users to the database",
        name: "importgroup",
    })
    async importgroup(
        @SlashChoice({ name: "Cheater", value: "cheater" })
        @SlashChoice({ name: "Bot", value: "bot" })
        @SlashChoice({ name: "Suspicious", value: "suspicious" })
        @SlashOption({
            description: "What are these accounts?",
            name: "type",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        type: string,
        @SlashOption({
            description: "Link to steam group",
            name: "link",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        link: string,
        interaction: CommandInteraction
    ): Promise<void> {
        if (!["cheater", "bot", "suspicious"].includes(type)) {
            // TODO: Test if throwing errors like this is a valid way of doing things.
            throw new Error("Invalid status to set.");
        }

        // TODO: Move to helper function (Use other helper to parse the xml for SteamIDs)
        let i = 1;
        let xmlString = "";
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const baseString = [
                "https://steamcommunity.com/groups/",
                "/memberslistxml/?xml=1&p=" + i,
            ];

            const nameStartIndex = link.indexOf("groups/") + 7;
            const nameEndIndex = link.indexOf("/", nameStartIndex);
            const groupName = link.substring(
                nameStartIndex,
                nameEndIndex > 0 ? nameEndIndex : undefined
            );

            const xmlUrl = baseString[0] + groupName + baseString[1];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await new Promise((resolve) => {
                https.get(xmlUrl, (res) => {
                    let data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });
                    res.on("end", () => {
                        resolve(data);
                    });
                });
            });
            const newXmlString = response as string;
            xmlString += "\n" + newXmlString;
            if (
                newXmlString.search(
                    /<nextPageLink>\s*<!\[CDATA\[\s?https:\/\/steamcommunity\.com\/groups\//gm
                ) === -1
            ) {
                break;
            }
            i++;
        }

        // TODO: Send IDs to database to mark as cheater/sus/bot
        // TODO: What should happen if the account is already marked? Perhaps optional override flag?
    }
}
