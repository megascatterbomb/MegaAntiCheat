import { Document, Schema, model } from "mongoose";
import { PlayerStatus } from "./PlayerStatus";

export interface IPlayer extends Document {
    steamId: string;
    name: string;
    aliases: string[];
    status: PlayerStatus;
}

export const PlayerSchema = new Schema<IPlayer>({
    steamId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    aliases: { type: [String], required: true },

    status: {
        type: String,
        required: true,
        enum: PlayerStatus,
        default: PlayerStatus.Normal,
    },
});

export const Player = model<IPlayer>("Player", PlayerSchema);

export default Player;
