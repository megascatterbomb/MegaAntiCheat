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
import { CacheType, EmbedFieldData, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed, MessageEmbedOptions, MessageEmbedThumbnail, User } from "discord.js";
import { basename } from "path/posix";
import { PlayerSummary } from "steamapi";
import { dbSteamUser, DBSteamUser, getAllUsers, getFriendsInDB, getSteamUser, registerSteamUser, SteamIDType, SteamUserType } from "../database/steamUser";
import ChannelCommand from "../extensions/channelCommand";
import { getUserBans, getCurrentAlias, getSteamID64, getUserData, getFriendsList, convertSteamID64toSteamID3, convertSteamID64toSteamID1 } from "../webrequests/steamquery";
import { cheaterFriendCountForWatch, colours, databaseAccountID, griefTypes } from "../utilities/config";
import { getCompHistoryEmbedField } from "../webrequests/competitive";
import MarkCheaterCommand, { finishInteraction } from "./markcheater";
import MarkInnocentCommand from "./markinnocent";
import MarkSuspiciousCommand from "./marksuspicious";
import WatchCommand from "./watch";
import mongoose from "mongoose";
import FriendsCommand from "./friends";
import { forEach } from "vis-util";

@Alias("lookup", "check")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Check if a steam user is in the database.")
export default class LookupCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The steam user to check (Link to Steam Profile or SteamID)."})
        steamUser!: string;

    async execute(message: Message, client: Client) {
        const steamID64 = await getSteamID64(this.steamUser).catch();
        if(steamID64 === undefined) {
            throw new Error("That is not a valid profile. Provide a SteamID or a link to a steam profile.");
        } else if (steamID64 === null) {
            throw new Error("This custom URL does not point to a valid profile.");
        }
        //const reply = message.reply("Searching for information about user `" + steamID64 + "`...");
        const steamUser = await getSteamUser(steamID64, true);
        const embed = await getLookupEmbed(steamID64, steamUser ?? undefined);
        //(await reply).delete(); // Don't wait for reply to fully post before searching
        const cheaterButton = new MessageButton()
            .setCustomId("cheaterButton" + message.id)
            .setLabel("Mark cheater")
            .setStyle("DANGER");
        const susButton = new MessageButton()
            .setCustomId("susButton" + message.id)
            .setLabel("Mark suspicious")
            .setStyle("SECONDARY");
        const watchButton = new MessageButton()
            .setCustomId("watchButton" + message.id)
            .setLabel("Remove mark")
            .setStyle("SECONDARY");
        const innocentButton = new MessageButton()
            .setCustomId("innocentButton" + message.id)
            .setLabel("Mark innocent")
            .setStyle("SUCCESS");
        const friendsButton = new MessageButton()
            .setCustomId("friendsButton" + message.id)
            .setLabel("Check friends")
            .setStyle("PRIMARY");
        let buttons = [cheaterButton, susButton, watchButton, innocentButton, friendsButton];
        switch (steamUser?.userType) {
        case SteamUserType.KnownCheater:
            cheaterButton.label = "Modify hacks";
            break;
        case SteamUserType.Suspicious:
            buttons = [cheaterButton, watchButton, innocentButton, friendsButton];
            break;
        case SteamUserType.Watching:
            buttons = [cheaterButton, susButton, innocentButton, friendsButton];
            break;
        case SteamUserType.Innocent:
            buttons = [cheaterButton, susButton, watchButton, friendsButton];
            break;
        default:
            watchButton.label = "Watch";
        }
        const actionRow = new MessageActionRow();
        actionRow.addComponents(...buttons);
        const response = await message.reply({embeds: [embed], components: [actionRow]});
        const interactionFunction = async (interaction: Interaction<CacheType>) => {
            if(interaction.user.id !== message.author.id) {
                if(interaction.isButton()) {
                    let commandToUse = "";
                    switch(interaction.customId) {
                    case "cheaterButton" + message.id:
                        commandToUse = "$markcheater";
                        break;
                    case "susButton" + message.id:
                        commandToUse = "$marksus";
                        break;
                    case "watchButton" + message.id:
                        commandToUse = "$watch";
                        break;
                    case "innocentButton" + message.id:
                        commandToUse = "$markinnocent";
                        break;
                    case "friendsButton" + message.id:
                        break;
                    default:
                        return;
                    }
                    if(commandToUse !== "") {
                        await interaction.deferUpdate();
                        await interaction.followUp({content: `<@${interaction.user.id}> Only the person who requested this lookup can use these buttons to modify the database.\nUse ${commandToUse} instead.`, ephemeral: true});
                        return;
                    }
                }
            }
            try {
                if(interaction.isButton() && interaction.customId === "cheaterButton" + message.id) {
                    await interaction.deferUpdate();
                    const command = new MarkCheaterCommand();
                    command.steamUser = this.steamUser;
                    await command.execute(message, client);
                } if(interaction.isButton() && interaction.customId === "susButton" + message.id) {
                    await interaction.deferUpdate();
                    const command = new MarkSuspiciousCommand();
                    command.steamUser = this.steamUser;
                    await command.execute(message, client);
                } else if(interaction.isButton() && interaction.customId === "watchButton" + message.id) {
                    await interaction.deferUpdate();
                    const command = new WatchCommand();
                    command.steamUser = this.steamUser;
                    await command.execute(message, client);
                } else if(interaction.isButton() && interaction.customId === "innocentButton" + message.id) {
                    await interaction.deferUpdate();
                    const command = new MarkInnocentCommand();
                    command.steamUser = this.steamUser;
                    await command.execute(message, client);
                } else if(interaction.isButton() && interaction.customId === "friendsButton" + message.id) {
                    await interaction.deferUpdate();
                    const command = new FriendsCommand();
                    command.steamUser = this.steamUser;
                    command.pageNumber = 1;
                    if(interaction.user.id !== message.author.id) {
                        command.externalUser = interaction.user.id;
                    }
                    await command.execute(message, client);
                } else {
                    return;
                }
            // eslint-disable-next-line no-empty
            } catch (err) {}
        };
        client.on("interactionCreate", interactionFunction);
    }
}

async function getLookupEmbed(steamID64: string, steamUser?: DBSteamUser): Promise<MessageEmbed> {
    const userSummary = await getUserData(steamID64);
    if(userSummary === null && steamUser === undefined) {
        return new MessageEmbed().setTitle("Not a valid user.");
    }
    const banInfoPromise = getUserBans(steamID64);
    const friendsPromise = getFriendsInDB([SteamUserType.KnownCheater, SteamUserType.Suspicious], steamID64, true);
    const compPromise = getCompHistoryEmbedField(steamID64);

    const thumbnail: MessageEmbedThumbnail | null = userSummary !== null ? {
        url: userSummary.avatar.large
    } : null;
    const name = userSummary?.nickname ?? steamUser?.currentAlias ?? "<unknown alias>";
    const options: MessageEmbedOptions = {
        title: name,
        url: "https://steamcommunity.com/profiles/" + steamID64,
        thumbnail: thumbnail ?? undefined,
        footer: {
            text: `${steamID64} - ${convertSteamID64toSteamID3(steamID64)} - ${convertSteamID64toSteamID1(steamID64)}`
        } 
    };

    switch (steamUser?.userType ?? -1) {
    case SteamUserType.KnownCheater:
        options.color = colours.get("cheater");
        options.description = "**Known cheater**";
        break;
    case SteamUserType.Suspicious:
        options.color = colours.get("suspicious");
        options.description = "**Suspected cheater**";
        break;
    case SteamUserType.Innocent:
        options.color = colours.get("innocent");
        options.description = "**Innocent**";
        break;
    case SteamUserType.Watching:
        options.color = colours.get("friends");
        options.description = "**Watching**";
        break;
    default:
        options.color = colours.get("unknown");
        options.description = "**Not in database**";
        break;
    }

    const fields: EmbedFieldData[] = [];

    let missedAliases = 0;

    fields.push({
        name: "Aliases:",
        value: ((steamUser?.mainAlias ?? "").length > 0 ? "Mainly known as: " + steamUser?.mainAlias + "\n" : "") +
            "```" + (steamUser?.aliases.sort().reduce((result: string, next: string) => {
            const str = result + ", " + next;
            if(str.length > 940) {
                missedAliases++;
                return  result;
            }
            return str;
        }) ?? name) + `${missedAliases === 0 ? "```" : "```+" + missedAliases + " more aliases"}`
    });
    if(steamUser?.userType === SteamUserType.KnownCheater) {
        fields.push({
            name: "Hacks:",
            value: steamUser?.hackTypes.map(h => griefTypes.find((g) => g.value === h)?.label).sort().join(", ") ?? "No hacks listed"
        });
    }

    const banInfo = await banInfoPromise;
    if(banInfo === null) {
        fields.push({
            name: "VAC Bans:",
            value: "Could not get information on this user's VAC bans"
        });
    } else {
        fields.push({
            name: "VAC Bans:",
            value: (banInfo.vacBans + banInfo.gameBans === 0) ? "No bans on record" 
                : banInfo.vacBans + ` VAC ban${banInfo.vacBans === 1 ? "" : "s"} on record\n` + 
                banInfo.gameBans + ` game ban${banInfo.gameBans === 1 ? "" : "s"} on record\n` + 
                banInfo.daysSinceLastBan + " days since last ban"
        });
    }

    if(steamUser !== undefined && steamUser.evidence.length > 0) {
        fields.push({
            name: "Evidence:",
            value: `${steamUser.evidence.length} piece${steamUser.evidence.length === 1 ? "" : "s"} of evidence on record`
        });
    }

    const friends = (await friendsPromise).friends;
    if(friends === null) { // Could not access user's friends list
        fields.push({
            name: "Friends:",
            value: "Could not find any friend information for this user"
        });
    } else {
        const plusSign: string = (await friendsPromise).public ? "" : "+";
        const cheaterFriends = friends.filter((friend) => friend.userType === SteamUserType.KnownCheater);
        const suspiciousFriends = friends.filter((friend) => friend.userType === SteamUserType.Suspicious);

        fields.push({
            name: "Friends:",
            value: (cheaterFriends.length === 0 && suspiciousFriends.length === 0) ? "No cheaters or suspicious players on record" 
                : cheaterFriends.length + plusSign + ` definite cheater${cheaterFriends.length === 1 ? "" : "s"} on record\n` + 
                suspiciousFriends.length + plusSign + ` suspicious player${suspiciousFriends.length === 1 ? "" : "s"} on record`
        });

        // Watch user if they have two or more definite cheaters
        if(cheaterFriends.length >= cheaterFriendCountForWatch && steamUser === undefined) {
            options.color = colours.get("friends");
            options.description = "**Started Watching**";
            await registerSteamUser(steamID64, SteamUserType.Watching, databaseAccountID);
        }
    }
    const compHistory = await compPromise;
    if(compHistory !== null) {
        fields.push(compHistory);
    }
    if(steamUser !== undefined) {
        fields.push({
            name: "Last Changed:",
            value: `${steamUser.changeAuthor === "0" ? "Unknown" : "<t:" + Math.trunc(steamUser?.lastChanged.valueOf() / 1000) + `:f> by <@${steamUser.changeAuthor}>`}`
        });
    }
    

    const embed: MessageEmbed = new MessageEmbed(options);
    embed.setFields(fields);
    return embed;
}