import { LobbyCapture, StatusCapture } from "./regexes";

export enum Team {
    Defenders,
    Invaders,
    None,
}

export enum PlayerState {
    Spawning,
    Active,
}

export default class Player {
    uid: string;
    name: string;
    steamid32: string;
    steamid64: string;
    time: string = "";
    ping: number;
    loss: number;
    team: Team = Team.None;
    state: PlayerState = PlayerState.Spawning;

    constructor(player: StatusCapture) {
        this.uid = player.userid;
        this.name = player.name;
        this.steamid32 = player.steamid32;
        this.steamid64 = steamid32To64(player.steamid32)!;
        this.time = player.time;
        this.ping = player.ping;
        this.loss = player.loss;
        this.state = player.state;
    }

    public update(player: StatusCapture) {
        if (player.steamid32 != this.steamid32) throw new Error("Wrong status entry for player");
        this.uid = player.userid;
        this.name = player.name;
        this.time = player.time;
        this.ping = player.ping;
        this.loss = player.loss;
        this.state = player.state;
    }

    public updateLobby(player: LobbyCapture) {
        if (player.steamid32 != this.steamid32) throw new Error("Wrong status entry for player");
        this.team = player.team;
    }
}

export function steamid32To64(steamid32: string): string | null {
    let segments = steamid32.split(":");
    if (segments.length != 3) return null;

    let id32 = BigInt(segments[2]);
    return String(id32 + BigInt("76561197960265728"));
}

export function steamid64To32(steamid64: string): string {
    let id64 = BigInt(steamid64);
    return "U:1:" + (id64 - BigInt("76561197960265728"));
}