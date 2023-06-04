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
import { ColorResolvable, Message, MessageEmbed, User } from "discord.js";
import { getAllUsers, registerSteamUser, SteamIDType, SteamUserType } from "../database/steamUser";
import { registerSubscriber, removeSubscriberByDiscordID, toggleSubscriptionStatus } from "../database/subscriber";
import ChannelCommand from "../extensions/channelCommand";
import { colours } from "../utilities/config";

@Alias("stats", "stat")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("View stats on the database.")
export default class StatsCommand extends ChannelCommand {

    async execute(message: Message, client: Client) {
        const users = await getAllUsers([SteamUserType.Watching, SteamUserType.KnownCheater, SteamUserType.Suspicious, SteamUserType.Innocent]);
        const cheaterCount = users.filter(u => u.userType === SteamUserType.KnownCheater).length;
        const susCount = users.filter(u => u.userType === SteamUserType.Suspicious).length;
        const innocentCount = users.filter(u => u.userType === SteamUserType.Innocent).length;
        const watchCount = users.filter(u => u.userType === SteamUserType.Watching).length;

        const embed = new MessageEmbed({title: "Cheater database statistics:"});
        embed.addFields([{name: "# of known cheaters:", value: cheaterCount.toString()},
            {name: "# of suspicious users:", value: susCount.toString()},
            {name: "# of watched users:", value: watchCount.toString()},
            {name: "# of innocents:", value: innocentCount.toString()}]);
        embed.setColor(colours.get("friends") as ColorResolvable);
        embed.setFooter({text: users.length + " total users in database"});
        message.reply({embeds: [embed]});
    }
}