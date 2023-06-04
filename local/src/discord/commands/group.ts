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
import { EmbedFieldData, Message, MessageEmbed, MessageEmbedOptions, MessageEmbedThumbnail, User } from "discord.js";
import { basename } from "path/posix";
import { PlayerSummary } from "steamapi";
import { dbSteamUser, DBSteamUser, getAllUsers, getFriendsInDB, getSteamUser, registerSteamUser, SteamIDType, SteamUserType } from "../database/steamUser";
import ChannelCommand from "../extensions/channelCommand";
import { getUserBans, getCurrentAlias, getSteamID64, getUserData, getFriendsList, globalRegexes } from "../webrequests/steamquery";
import { cheaterFriendCountForWatch, colours, griefTypes } from "../utilities/config";
import xml2js from "xml2js";
import https from "https";
import massCheck from "../database/massCheck";
@Alias("group")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Check the users in a Steam group")
export default class GroupCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The steam group to check (Link to group)."})
        steamGroup!: string;

    async execute(message: Message, client: Client) {
        let i = 1;
        let xmlString = "";
        // eslint-disable-next-line no-constant-condition
        while(true) {
            const baseString = ["https://steamcommunity.com/groups/", "/memberslistxml/?xml=1&p=" + i];

            const nameStartIndex = this.steamGroup.indexOf("groups/") + 7;
            const nameEndIndex = this.steamGroup.indexOf("/", nameStartIndex);
            const groupName = this.steamGroup.substring(nameStartIndex, nameEndIndex > 0 ? nameEndIndex : undefined);

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
        await massCheck(message, xmlString);
    }
}