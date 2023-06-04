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
import { dbSteamUser, DBSteamUser, getAllUsers, getFriendsInDB, getSteamUser, registerSteamUser, SteamIDType, SteamUserType, userEquals } from "../database/steamUser";
import ChannelCommand from "../extensions/channelCommand";
import { getUserBans, getCurrentAlias, getSteamID64, getUserData, getFriendsList, convertSteamID64toSteamID3, convertSteamID64toSteamID1 } from "../webrequests/steamquery";
import { cheaterFriendCountForWatch, colours, griefTypes } from "../utilities/config";
import LookupCommand from "./lookup";

@Alias("search")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Look for matching aliases in the database.")
export default class AliasCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The string to check for", infinite: true})
        query!: string[];

    async execute(message: Message, client: Client) {
        const query = this.query.join(" ");
        const queryLowerCase = query.toLowerCase();
        if(query === "") return;
        const allUsers = await getAllUsers();
        const matches: {id: string, user: DBSteamUser, priority: number}[] = allUsers.map((user) => {
        // Steam ID match
            if(user.steamID64.toLowerCase() === queryLowerCase ||
            convertSteamID64toSteamID3(user.steamID64).toLowerCase() === queryLowerCase ||
            convertSteamID64toSteamID1(user.steamID64).toLowerCase() === queryLowerCase ) {
                return {id: user.steamID64, user: user, priority: 0};
            }
            // Exact current alias
            if(user.currentAlias === query) {
                return {id: user.steamID64, user: user, priority: 1};
            }
            const lowerCaseLabel = user.currentAlias.toLowerCase();
            // Case insensitive exact current alias
            if(lowerCaseLabel === queryLowerCase) {
                return {id: user.steamID64, user: user, priority: 2};
            }
            // Exact previous alias
            if(user.aliases.includes(query)) {
                return {id: user.steamID64, user: user, priority: 3};
            }
            const lowerCaseAliases = user.aliases.map(a => a.toLowerCase());
            // Case insensitive exact previous alias
            if(lowerCaseAliases.includes(queryLowerCase)) {
                return {id: user.steamID64, user: user, priority: 4};
            }
            // start of current alias
            if(user.currentAlias.startsWith(query)) {
                return {id: user.steamID64, user: user, priority: 5};
            }
            // Case insensitive start of current alias
            if(lowerCaseLabel.startsWith(queryLowerCase)) {
                return {id: user.steamID64, user: user, priority: 6};
            }
            // start of previous alias
            if(user.aliases.some(a => a.startsWith(query))) {
                return {id: user.steamID64, user: user, priority: 7};
            }
            // case insensitive start of previous alias
            if(lowerCaseAliases.some(a => a.startsWith(queryLowerCase))) {
                return {id: user.steamID64, user: user, priority: 8};
            }
            // Substring of current alias
            if(user.currentAlias.includes(query)) {
                return {id: user.steamID64, user: user, priority: 9};
            }
            // case insensitive substring of current alias
            if(lowerCaseLabel.includes(queryLowerCase)) {
                return {id: user.steamID64, user: user, priority: 10};
            }
            // substring of previous alias
            if(user.aliases.some(a => a.includes(query))) {
                return {id: user.steamID64, user: user, priority: 11};
            }
            // case insensitive substring of previous alias
            if(lowerCaseAliases.some(a => a.includes(queryLowerCase))) {
                return {id: user.steamID64, user: user, priority: 12};
            }
            return null;
        }).filter(m => m !== null) as {id: string, user: DBSteamUser, priority: number}[];
        const sortedMatches = matches.sort((m1, m2) => {
            if(m1.priority !== m2.priority) return m1.priority - m2.priority;
            if(m1.user.currentAlias > m2.user.currentAlias) return m1.user.currentAlias > m2.user.currentAlias ? 1 : -1; 
            return m1.id > m2.id ? 1 : -1;
        });
        if(sortedMatches.length === 1) {
            const command = new LookupCommand();
            command.steamUser = sortedMatches[0].id;
            command.execute(message, client);
            return;
        } else if (sortedMatches.length === 0) {
            const noResultsEmbed = new MessageEmbed({
                title: "No results for \"" + query + "\"",
                footer: {
                    text: query.length > 32 ? `Your query is ${query.length} characters, which is larger than the 32 character limit of Steam aliases.` : ""
                }
            });
            await message.reply({embeds: [noResultsEmbed]});
            return;
        }
        const embed = await getEmbed(sortedMatches, query);
        await message.reply({embeds: [embed]});
    }
}

async function getEmbed(sortedMatches: {id: string, user: DBSteamUser, priority: number}[], query: string): Promise<MessageEmbed> {
    const searchResults: EmbedFieldData[] = [];
    for(let i = 0; i < 25 && i < sortedMatches.length; i++) {
        let description: string;
        switch (sortedMatches[i].user.userType) {
        case SteamUserType.KnownCheater:
            description = "*Known cheater*";
            break;
        case SteamUserType.Suspicious:
            description = "*Suspected cheater*";
            break;
        case SteamUserType.Innocent:
            description = "*Innocent*";
            break;
        case SteamUserType.Watching:
            description = "*Watching*";
            break;
        default:
            description = "*Not in database*";
            break;
        }
        searchResults.push({
            name: sortedMatches[i].user.currentAlias,
            value: description + "\n" + getPriorityString(sortedMatches[i].priority) + "\nhttps://steamcommunity.com/profiles/" + sortedMatches[i].id
        });
    }
    const embed: MessageEmbed = new MessageEmbed({
        title: "Search results for \"" + query + "\"",
        description: `${sortedMatches.length} result${sortedMatches.length === 1 ? "" : "s"} found.`,
        footer: { text: sortedMatches.length > 25 ? "\nTo display more than 25 results at a time, use the search function on the $graph" : undefined},
        fields: searchResults,
        color: "AQUA"
    });
    return embed;
}

function getPriorityString(priority: number): string {
    switch (priority) {
    case 0: return "Matching SteamID";
    case 1: return "Exact match of current alias (matching case)";
    case 2: return "Exact match of current alias";
    case 3: return "Exact match of previous alias (matching case)";
    case 4: return "Exact match of previous alias";
    case 5: return "Start of current alias (matching case)";
    case 6: return "Start of current alias";
    case 7: return "Start of previous alias (matching case)";
    case 8: return "Start of previous alias";
    case 9: return  "Substring of current alias (matching case)";
    case 10: return "Substring of current alias";
    case 11: return "Substring of previous alias (matching case)";
    case 12: return "Substring of previous alias";
    }
    return "";
}
