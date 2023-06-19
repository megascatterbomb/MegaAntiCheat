import { ChatInputCommandInteraction } from "discord.js";
import { SteamID } from "../common/steamID";

// Converts a string arg from discordx to a SteamID object.
// SteamID throws error on construction if invalid, so this class checks if custom URL is valid first.
export function SteamIDTransformer(
    input: string,
    interaction: ChatInputCommandInteraction
): SteamID {
    // TODO: Custom URL support.
    return new SteamID(input);
}
