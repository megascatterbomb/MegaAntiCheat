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
import { ColorResolvable, DiscordAPIError, EmbedFieldData, Message, MessageEmbed, MessageEmbedOptions, MessageEmbedThumbnail, User, MessageMentionOptions} from "discord.js";
import { basename } from "path/posix";
import { PlayerSummary } from "steamapi";
import { dbSteamUser, DBSteamUser, getAllUsers, getFriendsInDB, getSteamUser, registerSteamUser, SteamIDType, SteamUserType } from "../database/steamUser";
import ChannelCommand from "../extensions/channelCommand";
import { getUserBans, getCurrentAlias, getSteamID64, getUserData, getFriendsList } from "../webrequests/steamquery";
import { colours, griefTypes } from "../utilities/config";

@Alias("friend", "friends")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Check for cheaters in a user's friends list.")
export default class FriendsCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The steam user to check (Link to Steam Profile or SteamID)."})
        steamUser!: string;
    @Argument({ type: new IntegerType(), description: "Page number (defaults to 1)", default: (m) => 1, optional: true})
        pageNumber!: number;
    externalUser: string | undefined;

    async execute(message: Message, client: Client) {
        const steamID64 = await getSteamID64(this.steamUser).catch();
        if(steamID64 === undefined) {
            throw new Error("That is not a valid profile. Provide a SteamID or a link to a steam profile.");
        } else if (steamID64 === null) {
            throw new Error("This custom URL does not point to a valid profile.");
        }
        //const reply = message.reply("Searching for information about user `" + steamID64 + "`...");
        const steamUser = await getSteamUser(steamID64, true);
        const embeds = await getLookupEmbed(steamID64, steamUser ?? undefined, this.pageNumber);
        if(this.externalUser !== undefined) {
            await message.reply({content: `<@${this.externalUser}>`, embeds: embeds, allowedMentions: {repliedUser: false}});
            return;
        }
        //(await reply).delete(); // Don't wait for reply to fully post before searching
        await message.reply({embeds: embeds});
    }
}

async function getLookupEmbed(steamID64: string, steamUser?: DBSteamUser, pageNumber = 1): Promise<MessageEmbed[]> {
    const userSummary = (await getUserData(steamID64) as PlayerSummary) ?? null;
    if(userSummary === null) {
        return [new MessageEmbed().setTitle("Not a valid user.")];
    }
    const originUserName = userSummary.nickname;
    const friendsPromise = getFriendsInDB([SteamUserType.KnownCheater, SteamUserType.Suspicious], steamID64, true);

    const embedCheaters = new MessageEmbed({title: "\nThe following cheaters are friends with " + originUserName +":"});
    const embedSuspicious = new MessageEmbed({title: "\nThe following suspicious players are friends with " + originUserName +":"});

    const embeds: MessageEmbed[] = [];let cheaterFields: EmbedFieldData[] = [];let susUserFields: EmbedFieldData[] = [];

    const friends = (await friendsPromise).friends;
    if(friends === null) {
        return[new MessageEmbed().setTitle("Could not find any friend information for this user")];
    }
    for(const user of friends) {
        const title = ([user?.currentAlias].concat(...user?.aliases ?? []).filter((v, i) => i <= 5 && !(i !== 0 && v === user?.currentAlias))).join(", ") ?? "<unknown alias>";
        const value = "https://steamcommunity.com/profiles/" + user.steamID64;
        if(user.userType === SteamUserType.KnownCheater) {
            cheaterFields.push({
                name: title,
                value: value
            });
        } else if (user.userType === SteamUserType.Suspicious) {
            susUserFields.push({
                name: title,
                value: value
            });
        }
    }
    if(cheaterFields.length > 0) {
        cheaterFields.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
        embedCheaters.setDescription("These users have been marked as cheaters. Use $lookup <steamProfile> to check what hacks they use");
        embedCheaters.setColor(colours.get("cheater") as ColorResolvable);
        if(cheaterFields.length > 25) {
            embedCheaters.setTitle(embedCheaters.title + " (Page " + pageNumber + " of " + Math.ceil(cheaterFields.length / 25) + ")");
            cheaterFields = cheaterFields.slice((pageNumber-1)*25, pageNumber * 25 >= cheaterFields.length ? undefined : pageNumber * 25);
        }
        embedCheaters.setFields(cheaterFields);
        embeds.push(embedCheaters);
    }
    if(susUserFields.length > 0) {
        susUserFields.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
        embedSuspicious.setDescription("These users aren't definite cheaters. Keep an eye on them, and mark them as innocent or a cheat if you get definitive proof");
        embedSuspicious.setColor(colours.get("suspicious") as ColorResolvable);
        if(susUserFields.length > 25) {
            embedSuspicious.setTitle(embedSuspicious.title + " (Page " + pageNumber + " of " + Math.ceil(susUserFields.length / 25) + ")");
            susUserFields = susUserFields.slice((pageNumber-1), pageNumber * 25 >= susUserFields.length ? undefined : pageNumber * 25);
        }
        embedSuspicious.setFields(susUserFields);
        embeds.push(embedSuspicious);
    }
    if(embeds.length === 0) {
        embeds.push(new MessageEmbed().setTitle("This user is not friends with any known cheaters or suspicious players.").setColor(colours.get("innocent") as ColorResolvable));
    }
    if((await friendsPromise).public) {
        embeds.push(new MessageEmbed({title: "View " + originUserName + "'s friends on Steam", url: "https://steamcommunity.com/profiles/" + steamID64 + "/friends"}));
    } else {
        embeds.push(new MessageEmbed({title: originUserName + "'s friends list is private. Friends who also have private accounts cannot appear on this list."}));
    }
    
    return embeds;
}