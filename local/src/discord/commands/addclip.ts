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
import { addEvidence, registerSteamUser, SteamIDType, SteamUserType } from "../database/steamUser";
import { registerSubscriber, toggleSubscriptionStatus } from "../database/subscriber";
import ChannelCommand from "../extensions/channelCommand";
import { convertSteamID64toSteamID1, convertSteamID64toSteamID3, getSteamID64, steam } from "../webrequests/steamquery";

@Alias("addclip", "addevidence")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Attach evidence to a particular account.")
export default class AddClipCommand extends ChannelCommand {
    @Argument({ type: new StringType(), description: "The steam user to link this evidence to (Link to Steam Profile or SteamID)."})
        steamUser!: string;
    @Argument({ type: new StringType(), description: "Link to evidence, include notes if you wish", infinite: true})
        evidenceRaw!: string[];
    async execute(message: Message, client: Client) {
        const evidence = `<@${message.author.id}> ` + this.evidenceRaw.join(" ");
        if(evidence.length > 1000) throw new Error("Evidence cannot exceed 1000 characters");
        const steamID64 = await getSteamID64(this.steamUser).catch();
        if(steamID64 === undefined) {
            throw new Error("That is not a valid profile. Provide a SteamID or a link to a steam profile.");
        } else if (steamID64 === null) {
            throw new Error("This custom URL does not point to a valid profile.");
        }
        const result = await addEvidence(steamID64, evidence);
        if(result !== "") throw new Error(result);
        await message.reply("Evidence attached to `" + steamID64 + "`");
    }
}