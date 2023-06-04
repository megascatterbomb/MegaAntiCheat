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
import { dbSteamUser, DBSteamUser, getAllUsers, getFriendsInDB, getSteamUser, registerSteamUser, setMainAlias, SteamIDType, SteamUserType } from "../database/steamUser";
import ChannelCommand from "../extensions/channelCommand";
import { getUserBans, getCurrentAlias, getSteamID64, getUserData, getFriendsList } from "../webrequests/steamquery";
import { colours, griefTypes } from "../utilities/config";

@Alias("setalias", "alias")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Check for cheaters in a user's friends list.")
export default class SetAliasCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The steam user to check (Link to Steam Profile or SteamID)."})
        steamUser!: string;
    @Argument({ type: new StringType(), description: "Main alias", infinite: true})
        rawAlias!: string[];

    async execute(message: Message, client: Client) {
        const mainAlias = this.rawAlias.join(" ");
        const steamID64 = await getSteamID64(this.steamUser).catch();
        if(steamID64 === undefined) {
            throw new Error("That is not a valid profile. Provide a SteamID or a link to a steam profile.");
        } else if (steamID64 === null) {
            throw new Error("This custom URL does not point to a valid profile.");
        }
        //const reply = message.reply("Searching for information about user `" + steamID64 + "`...");
        const result = await setMainAlias(steamID64, mainAlias);
        if(!result) {
            throw new Error("User needs to be added to the database before a main alias can be set.");
        } else if(mainAlias === "") {
            await message.reply(`Main alias successfully removed from user \`${steamID64}\``);
        } else if (mainAlias.length > 32) {
            throw new Error("Cannot set an alias length greater than 32");
        } else {
            await message.reply(`Successfully set main alias of \`${steamID64}\` to ${mainAlias}`);
        }
    }
}