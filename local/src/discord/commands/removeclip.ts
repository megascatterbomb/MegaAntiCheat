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
import { Message, User } from "discord.js";
import { registerSteamUser, removeEvidence, SteamIDType, SteamUserType } from "../database/steamUser";
import { registerSubscriber, toggleSubscriptionStatus } from "../database/subscriber";
import ChannelCommand from "../extensions/channelCommand";
import { convertSteamID64toSteamID1, convertSteamID64toSteamID3, getSteamID64, steam } from "../webrequests/steamquery";

@Alias("removeclip", "rmclip", "removeevidence", "rmevidence")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Remove evidence from a particular account.")
export default class RemoveClipCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The steam user to remove this evidence from (Link to Steam Profile or SteamID)."})
        steamUser!: string;
    @Argument({ type: new IntegerType(), description: "Index of evidence to remove"})
        number!: number;
    async execute(message: Message, client: Client) {
        const steamID64 = await getSteamID64(this.steamUser).catch();
        if(steamID64 === undefined) {
            throw new Error("That is not a valid profile. Provide a SteamID or a link to a steam profile.");
        } else if (steamID64 === null) {
            throw new Error("This custom URL does not point to a valid profile.");
        }
        const result = await removeEvidence(steamID64, this.number);
        if(result !== "") throw new Error(result);
        await message.reply("Evidence removed from `" + steamID64 + "`");
    }
}