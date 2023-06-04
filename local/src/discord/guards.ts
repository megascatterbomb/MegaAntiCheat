import { GuardFunction } from "discordx";
import { Message } from "discord.js";

export const botOperator: GuardFunction<Message> = async (message: Message, client, next) => {
    if(process.env.BOT_OWNER !== undefined && message.author.id === process.env.BOT_OWNER) {
        await next();
    }
};