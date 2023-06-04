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
import { CacheType, Interaction, Message, MessageActionRow, MessageButton, User } from "discord.js";
import { graphReady } from "..";
import ChannelCommand from "../extensions/channelCommand";
import { checkUserID, getSignatureIfRegistered, registerUserID } from "../graph/web";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

@Alias("graph")
@Inhibit({ limitBy: "USER", maxUsesPerPeriod: 3, periodDuration: 10 })
@Described("Gain access to the visual represenatation of the database.")
export default class GraphCommand extends ChannelCommand {

    async execute(message: Message, client: Client) {
        
        if(!graphReady) {
            message.reply({content: "Sending the link when the graph is ready...", allowedMentions: { "users" : []}});
            while(!graphReady) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } // else {
        //     message.reply({content: "Sending the link to your DMs...", allowedMentions: { "users" : []}});
        // }

        await message.reply({content: process.env.WEB_URL});
        
        // const url = process.env.WEB_URL;
        // const signature = getSignatureIfRegistered(message.author.id) ?? registerUserID(message.author.id);
        // message.author.send("This URL lets you securely access the graph. Do not share it with anyone. This URL is valid for 24 hours or until the bot is restarted.\n" 
        // + url + "?key=" + signature).catch(
        //     () => message.reply("We were not able to DM you your secret URL. Allow direct messages from this server."));
    }
}