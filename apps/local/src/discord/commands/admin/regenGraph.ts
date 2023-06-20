import { CommandInteraction, Message, Client } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import { botOperator } from "../../guards";

// TODO: Evaluate if this command is required.

@Discord()
@Guard(botOperator)
export class RegenGraphCommand {
    @Slash({ description: "Regenerate the visualisation of the database", name: "regengraph" })
    async regengraph(
        interaction: CommandInteraction
    ): Promise<void> {
        // if(inProgress) {
        //     await message.reply("A graph regeneration is already in progress.");
        //     return;
        // }
        // const completedPromise = generateGraph();
        const response = await interaction.reply({content: "Regenerating graph...", allowedMentions: {repliedUser: false}});
        let i = 0;
        // TODO: This code won't return on time if actual load time is way less than estimated. Fix.
        // while(i < graphLoadTime) {
        //     i++;
        //     const progressPromise = i % 5 === 0 ? response.edit({content: `Regenerating graph (${Math.floor(100 * i/graphLoadTime)}%)`,
        //         allowedMentions: {repliedUser: false}}) : null;
        //     await new Promise(r => setTimeout(r, 1000)); 
        //     await progressPromise;
        // }
        // await completedPromise;
        response.delete();
        await interaction.reply("Regenerated graph. All existing URLs are still valid.");
    }
}